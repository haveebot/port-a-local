import { NextRequest, NextResponse } from "next/server";
import { askGully, looksLikeQuestion } from "@/lib/gullyAsk";
import { gullyFuse, type GullyItem } from "@/lib/gullySearch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  // Re-run Fuse on the server (same index the client uses) so we have
  // canonical results to feed Claude.
  const fuseResults: GullyItem[] = gullyFuse
    .search(query)
    .slice(0, 8)
    .map((r) => r.item);

  const result = await askGully(query, fuseResults);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    answer: result.answer,
    citedSlugs: fuseResults.map((r) => ({ slug: r.slug, name: r.name, type: r.type, category: r.category })),
    usage: result.usage,
  });
}
