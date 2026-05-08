import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Per-ad spend breakdown — pulls every ad on the PAL ad account in the
 * specified window and returns sorted spend totals plus a sum.
 *
 * Origin: 2026-05-06. The Stripe Issuing card "PAL · FB Ads" was set
 * with a $50/month limit; the May ad spend hit that ceiling Sunday and
 * pushed the account into UNSETTLED status (caught by debug-perms).
 * Operators need a fast way to see what each individual boost actually
 * cost so the cap can be tuned + optimization pass made.
 *
 * GET /api/wheelhouse/social/boost/spend-breakdown?days=30
 *   days  — lookback window (default 30, max 90)
 *
 * Returns: ads sorted by spend desc, with name + spend + impressions
 * + reach + clicks. Plus account-level total + the daily breakdown.
 *
 * Auth: wheelhouse middleware (cookie/bearer).
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getToken(): string | null {
  const t = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  return t.length > 0 ? t : null;
}

function getAdAccountId(): string | null {
  const id = (process.env.META_AD_ACCOUNT_ID ?? "").trim();
  if (!id) return null;
  return id.startsWith("act_") ? id.slice(4) : id;
}

interface AdInsight {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  created_time: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
}

export async function GET(req: NextRequest) {
  const token = getToken();
  const adAccountId = getAdAccountId();
  if (!token || !adAccountId) {
    return NextResponse.json(
      { error: "META env not configured" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const daysRaw = Number(url.searchParams.get("days") ?? "30");
  const days = Math.max(1, Math.min(90, Number.isFinite(daysRaw) ? daysRaw : 30));

  const since = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const until = new Date().toISOString().slice(0, 10);

  // Per-ad breakdown
  const adsParams = new URLSearchParams({
    fields: `id,name,status,effective_status,created_time,insights.time_range({"since":"${since}","until":"${until}"}){spend,impressions,reach,clicks}`,
    limit: "200",
    access_token: token,
  });
  const adsRes = await fetch(`${GRAPH_BASE}/act_${adAccountId}/ads?${adsParams}`);
  const adsJson = (await adsRes.json()) as Record<string, unknown>;

  if (!adsRes.ok) {
    return NextResponse.json(
      { error: "ads_fetch_failed", meta: adsJson.error },
      { status: 502 },
    );
  }

  type RawAd = AdInsight & { insights?: { data?: Array<{ spend?: string; impressions?: string; reach?: string; clicks?: string }> } };
  const ads = (adsJson.data ?? []) as RawAd[];

  const breakdown = ads
    .map((ad) => {
      const ins = ad.insights?.data?.[0];
      return {
        id: ad.id,
        name: ad.name,
        status: ad.status,
        effective_status: ad.effective_status,
        created_time: ad.created_time,
        spend: parseFloat(ins?.spend ?? "0"),
        impressions: parseInt(ins?.impressions ?? "0", 10),
        reach: parseInt(ins?.reach ?? "0", 10),
        clicks: parseInt(ins?.clicks ?? "0", 10),
      };
    })
    .sort((a, b) => b.spend - a.spend);

  const totalSpend = breakdown.reduce((s, a) => s + a.spend, 0);
  const totalImpressions = breakdown.reduce((s, a) => s + a.impressions, 0);
  const totalReach = breakdown.reduce((s, a) => s + a.reach, 0);
  const totalClicks = breakdown.reduce((s, a) => s + a.clicks, 0);

  // Daily account-level breakdown (so we can see when the spend curve
  // crossed the $50 ceiling)
  const dailyParams = new URLSearchParams({
    fields: "spend,impressions,reach,clicks",
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    access_token: token,
  });
  const dailyRes = await fetch(
    `${GRAPH_BASE}/act_${adAccountId}/insights?${dailyParams}`,
  );
  const dailyJson = (await dailyRes.json()) as Record<string, unknown>;
  const daily = (dailyJson.data ?? []) as Array<{
    date_start: string;
    date_stop: string;
    spend?: string;
    impressions?: string;
    reach?: string;
    clicks?: string;
  }>;

  return NextResponse.json({
    window: { since, until, days },
    totals: {
      spend_usd: totalSpend.toFixed(2),
      impressions: totalImpressions,
      reach: totalReach,
      clicks: totalClicks,
      ad_count: breakdown.length,
    },
    daily: daily.map((d) => ({
      date: d.date_start,
      spend_usd: parseFloat(d.spend ?? "0").toFixed(2),
      impressions: parseInt(d.impressions ?? "0", 10),
      reach: parseInt(d.reach ?? "0", 10),
      clicks: parseInt(d.clicks ?? "0", 10),
    })),
    ads_by_spend: breakdown.map((a) => ({
      ...a,
      spend_usd: a.spend.toFixed(2),
    })),
  });
}
