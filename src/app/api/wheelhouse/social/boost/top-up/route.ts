import { NextRequest, NextResponse } from "next/server";
import { getById } from "@/data/social-post-store";
import { topUpBoost } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Top up an active boost — increases the lifetime_budget on the existing
 * adset so a hot post keeps serving past its original cap. Operator-
 * triggered from the Currently-boosting card on /wheelhouse/marketing.
 *
 *   POST /api/wheelhouse/social/boost/top-up
 *     body: { id: number, additionalCents: number }
 *
 * Cheaper than spawning a new campaign for the same post (no creative or
 * ad re-create), and Meta's learning/optimization data carries forward.
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */
interface TopUpBody {
  id?: number;
  additionalCents?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as TopUpBody | null;
  if (!body?.id || !Number.isFinite(body.id)) {
    return NextResponse.json(
      { error: "missing_or_invalid_id" },
      { status: 400 },
    );
  }
  if (!body.additionalCents || !Number.isFinite(body.additionalCents)) {
    return NextResponse.json(
      { error: "missing_or_invalid_additionalCents" },
      { status: 400 },
    );
  }
  // Hard cap per top-up to prevent fat-finger ($10 max per click — still
  // generous; under boostPost's $5/day default but we're topping cumulative
  // budget here, not per-day)
  if (body.additionalCents > 1000) {
    return NextResponse.json(
      { error: "additionalCents over $10 cap per top-up" },
      { status: 400 },
    );
  }

  const post = await getById(body.id);
  if (!post) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }
  if (!post.boostAdsetId) {
    return NextResponse.json(
      { error: "no_adset_on_record", detail: "Post has no boost_adset_id." },
      { status: 409 },
    );
  }
  if (post.boostStatus !== "active") {
    return NextResponse.json(
      {
        error: "boost_not_active",
        detail: `Boost status is '${post.boostStatus}' — top-up only valid on active.`,
      },
      { status: 409 },
    );
  }

  const result = await topUpBoost(post.boostAdsetId, body.additionalCents);
  if (!result.ok) {
    return NextResponse.json(
      { error: "top_up_failed", detail: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    postId: post.id,
    adsetId: post.boostAdsetId,
    previousCents: result.previousCents,
    newCents: result.newCents,
    addedCents: body.additionalCents,
  });
}
