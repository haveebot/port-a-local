import { NextRequest, NextResponse } from "next/server";
import {
  getById,
  markBoostCreated,
  markBoostFailed,
  disableBoost,
} from "@/data/social-post-store";
import { boostPost, isBoostConfigured } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Boost an existing FB post via Marketing API. The point: organic post
 * insights (reach/impressions/clicks) are dead in Graph API v21+; paid
 * boost re-enables them per-post. $1/24hr is the default — small enough
 * to be a baseline marketing tax (~$5/wk at current cadence), large
 * enough to unlock the analytics that would otherwise require Meta
 * Business Suite eyeball-only.
 *
 *   POST /api/wheelhouse/social/boost
 *     body: { id: number }
 *     creates campaign+adset+creative+ad referencing the post's
 *     externalPostId; persists IDs to social_post_queue.boost_*
 *
 *   POST /api/wheelhouse/social/boost?action=disable
 *     body: { id: number }
 *     marks boost_status='disabled' so auto-fire skips this post
 *
 *   GET /api/wheelhouse/social/boost?status=true
 *     returns { configured, reason } for the operator UI
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

interface BoostBody {
  id?: number;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("status") === "true") {
    return NextResponse.json(isBoostConfigured());
  }
  return NextResponse.json({ error: "use ?status=true" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const body = (await req.json().catch(() => null)) as BoostBody | null;
  if (!body?.id || !Number.isFinite(body.id)) {
    return NextResponse.json(
      { error: "missing_or_invalid_id" },
      { status: 400 },
    );
  }

  const post = await getById(body.id);
  if (!post) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }

  if (action === "disable") {
    await disableBoost(post.id);
    const updated = await getById(post.id);
    return NextResponse.json({ ok: true, post: updated });
  }

  // Default: create boost
  if (post.status !== "sent" || !post.externalPostId) {
    return NextResponse.json(
      {
        error: "post_not_eligible",
        detail: "Post must be sent (status=sent) with an externalPostId.",
      },
      { status: 409 },
    );
  }
  if (post.externalPostId.startsWith("stub:")) {
    return NextResponse.json(
      {
        error: "post_was_stubbed",
        detail:
          "This post was published in stub mode — no real FB post exists to boost.",
      },
      { status: 409 },
    );
  }
  if (post.boostStatus === "active") {
    return NextResponse.json(
      { error: "boost_already_active", post },
      { status: 409 },
    );
  }
  if (post.boostStatus === "disabled") {
    return NextResponse.json(
      {
        error: "boost_disabled_by_operator",
        detail: "POST without action=disable was previously called to opt out.",
      },
      { status: 409 },
    );
  }

  // Build a short, identifiable campaign name. Caption truncated to 50ch.
  const cleanCaption = post.caption.replace(/\s+/g, " ").trim().slice(0, 50);
  const campaignName = `${cleanCaption}… (post#${post.id})`;

  const result = await boostPost(post.externalPostId, campaignName);

  if (!result.ok) {
    await markBoostFailed(post.id, result.error ?? "unknown error");
    return NextResponse.json(
      {
        error: "boost_failed",
        detail: result.error,
      },
      { status: 502 },
    );
  }

  await markBoostCreated({
    id: post.id,
    status: result.stubbed ? "stub" : "active",
    campaignId: result.campaignId,
    adsetId: result.adsetId,
    adId: result.adId,
    creativeId: result.creativeId,
  });

  const updated = await getById(post.id);
  return NextResponse.json({ ok: true, stubbed: !!result.stubbed, post: updated });
}
