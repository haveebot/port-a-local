import { NextRequest, NextResponse } from "next/server";
import { askGully, looksLikeQuestion } from "@/lib/gullyAsk";
import { gullyFuse, gullyItems, type GullyItem } from "@/lib/gullySearch";
import { logAskGully } from "@/data/ask-gully-log-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Best-effort answer-text scan for slugs Claude actually cited. The
 * response answer uses [Name](slug) markdown — we extract the slugs
 * from there rather than logging every result we passed to Claude.
 * Gives the analytics page accurate "what got linked" data.
 */
function extractCitedSlugs(answer: string): string[] {
  const slugs = new Set<string>();
  const re = /\[[^\]]+\]\(([a-z0-9][a-z0-9-]*)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) {
    slugs.add(m[1]);
  }
  return Array.from(slugs);
}

/**
 * Category fallback — when Fuse can't find strong matches for the
 * question, we infer the most likely category from the question text
 * and supplement the result pool with featured items from that
 * category. Without this, Claude punts to "browse Eat / Do" even
 * when concrete recommendations exist.
 *
 * Returns the category slug to draw from, or null if no clear signal.
 */
function inferCategoryFromQuestion(q: string): string | null {
  const t = q.toLowerCase();
  // Order matters — check more specific signals first.
  if (/locals? eat|where do locals|locals' food|local spot/.test(t)) return "eat";
  if (/\bbreakfast|brunch|coffee|cafe|morning/.test(t)) return "eat";
  if (/\bhappy hour|drink|beer|wine|cocktail|bar\b|brewery/.test(t)) return "drink";
  if (/open late|late night|after midnight|past 10|after 10/.test(t)) return "eat";
  if (/\beat|food|restaurant|menu|tacos?|seafood|burger|pizza|lunch|dinner|kid[- ]?friendly/.test(t)) return "eat";
  if (/\bfish|charter|captain|offshore|tarpon|bay fish/.test(t)) return "fish";
  if (/\bsunset|view|waterfront|patio|outside seating/.test(t)) return "drink";
  if (/\bdolphin|kayak|paddleboard|surf|tour|boat ride|excursion/.test(t)) return "do";
  if (/\bdo\b|with kids|for kids|family|rainy|indoor|activity|fun|play/.test(t)) return "do";
  if (/\bstay|hotel|room|rental|condo|vrbo|airbnb|accommodation/.test(t)) return "stay";
  if (/\bshop|store|buy|boutique|gift|souvenir/.test(t)) return "shop";
  if (/\bbeach\b|\bsand\b|umbrella|cabana|beach chair/.test(t)) return "beach";
  if (/\bcart|golf cart/.test(t)) return "rent";
  return null;
}

/**
 * Pull top items from a category as a fallback pool — featured first,
 * then alphabetical. Caps at `n`.
 */
function topInCategory(category: string, n: number): GullyItem[] {
  return gullyItems
    .filter(
      (i) =>
        (i.type === "business" ||
          i.type === "portal" ||
          i.type === "delivery-vendor") &&
        i.category === category,
    )
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, n);
}

/**
 * POST /api/gully/ask
 * Body: { query: string }
 *
 * Server-side wrapper for askGully. Re-runs Fuse.js (server has the
 * same gullyItems index — the client passes only the query, not the
 * results, to keep the request small) and forwards top 8 matches to
 * Claude Haiku for synthesis.
 *
 * Public endpoint. Cost guardrails:
 *   - Skips Claude call when query doesn't look like a question
 *   - Caps results passed to Claude at 8 (~500 input tokens)
 *   - Caps output at 600 tokens
 *   - At PAL volume (~50 searches/day, ~10% questions): ~$0.07/mo
 */
interface PostBody {
  query?: string;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const query = (body.query || "").trim();
  if (!query || query.length < 3) {
    return NextResponse.json({ error: "query_too_short" }, { status: 400 });
  }
  if (query.length > 400) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  // Skip Claude call entirely if not a question — saves API cost.
  if (!looksLikeQuestion(query)) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "not_a_question",
    });
  }

  // Strip question-prefix words + trailing "?" before Fuse so noise
  // words don't dilute keyword matches. "what is sandfest?" → "sandfest"
  // matches the Heritage piece tag cleanly. We pass the ORIGINAL query
  // to Claude though — it needs the question phrasing to answer well.
  const fuseQuery = query
    .replace(
      /^(what|who|where|when|why|how|can|could|should|would|is|are|do|does|will|which|whose|tell me|find me|recommend|suggest|show me)\s+(is|are|does|do|can|should|would|to|me)?\s*/i,
      "",
    )
    .replace(/\?+$/, "")
    .trim();
  const rawFuseResults = gullyFuse.search(fuseQuery || query).slice(0, 8);
  const fuseResults: GullyItem[] = rawFuseResults.map((r) => r.item);

  // Lever C — category fallback. Two trigger conditions:
  //   1. Fuse top score is weak (>0.55) or pool is empty
  //   2. Inferred category exists but Fuse's top 3 are all wrong-category
  //      (e.g. "where do locals eat" scores 0.2 on the locals portal but
  //       none of the top results are restaurants)
  // When either fires, supplement the pool with featured items from the
  // inferred category. Without this, Claude lacks anything specific to
  // ground in and falls back to "browse Eat / Do" even when concrete
  // recommendations exist in the catalog.
  const topScore = rawFuseResults[0]?.score ?? 1;
  const inferredCategory = inferCategoryFromQuestion(query);
  const isWeak = topScore > 0.55 || rawFuseResults.length === 0;
  const isWrongCategory =
    !!inferredCategory &&
    rawFuseResults.length > 0 &&
    !rawFuseResults
      .slice(0, 3)
      .some((r) => r.item.category === inferredCategory);
  let combinedResults: GullyItem[] = fuseResults;
  let fallbackReason: "weak" | "wrong_category" | null = null;
  if ((isWeak || isWrongCategory) && inferredCategory) {
    const fallback = topInCategory(inferredCategory, 5).filter(
      (it) => !fuseResults.some((f) => f.slug === it.slug),
    );
    if (fallback.length > 0) {
      // For wrong-category, prepend fallback so Claude sees the right
      // type first. For weak, append since Fuse pool may still be useful.
      combinedResults = isWrongCategory
        ? [...fallback, ...fuseResults].slice(0, 8)
        : [...fuseResults, ...fallback].slice(0, 8);
      fallbackReason = isWrongCategory ? "wrong_category" : "weak";
    }
  }

  const result = await askGully(query, combinedResults);
  if (!result.ok) {
    // Log the miss too — failures inform reliability and budget.
    void logAskGully({
      query,
      citedCount: 0,
      citedSlugs: [],
      fuseTopScore: topScore,
      fallbackReason,
      inferredCategory,
      answerChars: null,
    });
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 200 },
    );
  }

  const answer = result.answer ?? "";
  const actuallyCitedSlugs = extractCitedSlugs(answer);

  // Log analytics. Fire-and-forget — the user-facing response does
  // not wait on the insert.
  void logAskGully({
    query,
    citedCount: actuallyCitedSlugs.length,
    citedSlugs: actuallyCitedSlugs,
    fuseTopScore: topScore,
    fallbackReason,
    inferredCategory,
    answerChars: answer.length,
  });

  return NextResponse.json({
    ok: true,
    answer: result.answer,
    citedSlugs: combinedResults.map((r) => ({
      slug: r.slug,
      name: r.name,
      type: r.type,
      category: r.category,
    })),
    usage: result.usage,
    debug: {
      fuseTopScore: topScore,
      inferredCategory,
      fallbackReason,
      actuallyCited: actuallyCitedSlugs,
    },
  });
}
