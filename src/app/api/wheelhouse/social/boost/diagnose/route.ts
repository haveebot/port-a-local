import { NextRequest, NextResponse } from "next/server";
import { getById } from "@/data/social-post-store";
import {
  fetchAdStatus,
  fetchAccountInsights,
  fetchBoostInsights,
} from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Boost diagnostics — when our cron's insights pull comes back empty for an
 * "active" boost, this endpoint distinguishes:
 *
 *   - Meta hasn't approved the ad yet (effective_status PENDING_REVIEW)
 *   - Approved but rejected (DISAPPROVED + issues_info)
 *   - Approved + serving but insights API is lagging (per-ad empty,
 *     account-level shows spend)
 *   - Wrong query window (default insights call returns empty but
 *     date_preset=today / =maximum returns data)
 *
 * GET /api/wheelhouse/social/boost/diagnose?id=POST_ID
 *
 * Returns a structured payload with:
 *   - The post row's boost_* state
 *   - The ad's effective_status + issues_info from Meta
 *   - Insights pulled with three different date_presets to triangulate
 *   - Account-level spend totals for sanity
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const idStr = url.searchParams.get("id");
  const id = idStr ? Number(idStr) : NaN;
  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { error: "missing_or_invalid_id" },
      { status: 400 },
    );
  }

  const post = await getById(id);
  if (!post) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }

  const adId = post.boostAdId;
  if (!adId) {
    return NextResponse.json(
      {
        post: {
          id: post.id,
          boostStatus: post.boostStatus,
          boostError: post.boostError,
        },
        diagnosis: "no_ad_id_on_record",
      },
      { status: 200 },
    );
  }

  const [statusRes, todayRes, last24Res, maximumRes, accountTodayRes] =
    await Promise.all([
      fetchAdStatus(adId),
      fetchBoostInsights(adId, "today"),
      fetchBoostInsights(adId, "last_24h"),
      fetchBoostInsights(adId, "maximum"),
      fetchAccountInsights("today"),
    ]);

  return NextResponse.json({
    post: {
      id: post.id,
      caption: post.caption.slice(0, 80),
      externalPostId: post.externalPostId,
      boostStatus: post.boostStatus,
      boostAdId: adId,
      boostCampaignId: post.boostCampaignId,
      boostAdsetId: post.boostAdsetId,
      boostCreatedAt: post.boostCreatedAt,
      boostInsightsSyncedAt: post.boostInsightsSyncedAt,
      boostSpendCentsRecorded: post.boostSpendCents,
      boostError: post.boostError,
    },
    adStatus: statusRes,
    insights: {
      today: todayRes,
      last_24h: last24Res,
      maximum: maximumRes,
    },
    accountToday: accountTodayRes,
  });
}
