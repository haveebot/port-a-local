import { NextRequest, NextResponse } from "next/server";
import {
  listCampaigns,
  fetchCampaignInsights,
  fetchAccountInsights,
  type CampaignSummary,
  type BoostInsights,
} from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/wheelhouse/ads/list
 *
 * Bearer-authed (middleware) JSON view of every campaign on the PAL ad
 * account, each with lifetime insights inline, plus account-level
 * rollups for today / last_7d / lifetime. Mirrors what the
 * /wheelhouse/ads page renders server-side, exposed as JSON so:
 *   - any agent session can pull live ad performance on demand
 *   - cron jobs (PAL Pulse digest) can fold ad spend / reach into
 *     the daily thread without scraping the page
 *   - external systems / future tenants can pull cross-tenant ad
 *     state through a uniform contract
 *
 * Query params:
 *   ?archived=true   — include archived/deleted campaigns
 *
 * Stub-mode safe: when META_AD_ACCOUNT_ID isn't set the underlying
 * helpers return stubbed empty data instead of crashing.
 */
export async function GET(req: NextRequest) {
  const includeArchived = req.nextUrl.searchParams.get("archived") === "true";

  const campaignResult = await listCampaigns({
    limit: 200,
    includeArchived,
  });

  if (!campaignResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: campaignResult.error ?? "list failed",
      },
      { status: 500 },
    );
  }

  const campaigns: CampaignSummary[] = campaignResult.campaigns ?? [];
  const stubbed = campaignResult.stubbed ?? false;

  // Per-campaign insights in parallel. Each insight call is 200-500ms;
  // a couple dozen campaigns at once stays under serverless time budgets.
  // If a single insight call fails, that row's insights are null and the
  // rest of the response still ships.
  const insightsList: (BoostInsights | null)[] = stubbed
    ? campaigns.map(() => null)
    : await Promise.all(
        campaigns.map((c) =>
          fetchCampaignInsights(c.id)
            .then((r) => (r.ok ? r.insights ?? null : null))
            .catch(() => null),
        ),
      );

  // Account-level rollups in parallel. Each preset is one Marketing API
  // call. Failures (e.g. no spend in window) come back as null so the
  // shape stays predictable.
  const [today, last7d, lifetime] = stubbed
    ? [null, null, null]
    : await Promise.all([
        fetchAccountInsights("today")
          .then((r) => (r.ok ? r.insights ?? null : null))
          .catch(() => null),
        fetchAccountInsights("last_7d")
          .then((r) => (r.ok ? r.insights ?? null : null))
          .catch(() => null),
        fetchAccountInsights("maximum")
          .then((r) => (r.ok ? r.insights ?? null : null))
          .catch(() => null),
      ]);

  return NextResponse.json({
    ok: true,
    stubbed,
    fetchedAt: new Date().toISOString(),
    account: {
      today,
      last7d,
      lifetime,
    },
    campaigns: campaigns.map((c, i) => ({
      ...c,
      insights: insightsList[i],
    })),
  });
}
