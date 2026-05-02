import { NextRequest, NextResponse } from "next/server";
import {
  getByExternalPostId,
  importExternalPost,
} from "@/data/social-post-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Reverse-populate manually-created FB posts into our queue ledger.
 *
 * For every recent post on the PAL FB Page that doesn't have a matching
 * social_post_queue row (by external_post_id), insert a synthetic row with
 * trigger_type='manual_external'. Gives us a unified ledger of every PAL
 * FB post — auto-fired or hand-typed — so per-post traffic analytics +
 * the boost button work uniformly regardless of how the post got there.
 *
 *   POST /api/wheelhouse/social/import-fb
 *     query: ?lookback=24 (hours; default 24, max 168)
 *
 * Pairs with the sweep-removed endpoint (FB-deletion detection) to give
 * bidirectional sync between our queue and FB Page reality.
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

interface FbPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  attachments?: {
    data?: {
      url?: string;
      target?: { url?: string };
    }[];
  };
}

const PAL_DOMAIN = "theportalocal.com";

/**
 * Pull the linkUrl for a post — first checks attachments (link card target),
 * then falls back to scanning message text for a theportalocal.com URL.
 * If neither, returns null (the post had no outbound link, e.g., a photo
 * post or text-only).
 */
function extractLinkUrl(p: FbPost): string | null {
  // Prefer attachments.target.url (clean canonical) over attachments.url
  // (sometimes wraps in lm.facebook.com redirect)
  const attachUrl =
    p.attachments?.data?.[0]?.target?.url ?? p.attachments?.data?.[0]?.url;
  if (attachUrl && attachUrl.includes(PAL_DOMAIN)) return attachUrl;

  // Fallback: scan message for the first PAL URL
  if (p.message) {
    const match = p.message.match(/https?:\/\/(?:www\.)?theportalocal\.com\S*/i);
    if (match) {
      // Strip trailing punctuation (period, paren, etc.)
      return match[0].replace(/[.,);!?]+$/, "");
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const lookbackParam = Number(url.searchParams.get("lookback") ?? "24");
  const lookback = Number.isFinite(lookbackParam)
    ? Math.min(168, Math.max(1, lookbackParam))
    : 24;

  const token = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  const pageId = (process.env.META_PAGE_ID ?? "").trim();
  if (!token || !pageId) {
    return NextResponse.json(
      { error: "META_PAGE_ACCESS_TOKEN or META_PAGE_ID not set" },
      { status: 500 },
    );
  }

  const since = Math.floor(Date.now() / 1000) - lookback * 60 * 60;
  const fields = [
    "id",
    "message",
    "created_time",
    "permalink_url",
    "attachments{url,target}",
  ].join(",");

  // Pull the recent feed
  const fbUrl = `https://graph.facebook.com/v21.0/${pageId}/posts?fields=${encodeURIComponent(fields)}&since=${since}&limit=50&access_token=${encodeURIComponent(token)}`;

  let fbData: { data?: FbPost[]; error?: { message?: string } };
  try {
    const res = await fetch(fbUrl);
    fbData = (await res.json()) as typeof fbData;
    if (!res.ok) {
      return NextResponse.json(
        { error: fbData.error?.message ?? `HTTP ${res.status}` },
        { status: 502 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `fetch error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  const fbPosts = fbData.data ?? [];

  const imported: { id: number; externalPostId: string; caption: string }[] = [];
  const skipped: { externalPostId: string; reason: string }[] = [];

  for (const fp of fbPosts) {
    if (!fp.message && !fp.attachments?.data?.length) {
      skipped.push({ externalPostId: fp.id, reason: "no caption or attachment" });
      continue;
    }

    // Already in our DB? Skip.
    const existing = await getByExternalPostId(fp.id);
    if (existing) {
      skipped.push({ externalPostId: fp.id, reason: "already tracked" });
      continue;
    }

    const inserted = await importExternalPost({
      channel: "facebook",
      caption: fp.message ?? "(no caption)",
      linkUrl: extractLinkUrl(fp),
      externalPostId: fp.id,
      externalPostUrl: fp.permalink_url ?? null,
      sentAt: new Date(fp.created_time),
      sentBy: "manual",
    });

    imported.push({
      id: inserted.id,
      externalPostId: inserted.externalPostId ?? fp.id,
      caption: inserted.caption.slice(0, 80),
    });
  }

  return NextResponse.json({
    ok: true,
    lookbackHours: lookback,
    fbPostsScanned: fbPosts.length,
    imported: imported.length,
    skipped: skipped.length,
    importedRows: imported,
    skippedDetails: skipped,
  });
}
