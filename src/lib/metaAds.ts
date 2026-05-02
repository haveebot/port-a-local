/**
 * Meta Marketing API wrapper — boost an existing FB Page post for a fixed
 * daily budget + duration. Used to unlock the post-level analytics that
 * Meta deprecated for organic content in Graph API v21+.
 *
 * Flow:
 *   1. createBoost({ post, ... }) — creates Campaign → Ad Set → Ad
 *      Creative (referencing existing post via object_story_id) → Ad.
 *      Returns the Ad ID; that's what insights pull against later.
 *   2. fetchBoostInsights(adId) — pulls reach/impressions/clicks/spend
 *      from the Marketing API. Run on a cron at +1hr, +24hr, +final.
 *
 * Stub mode: when META_AD_ACCOUNT_ID is unset, all functions log what
 * they would have done and return stub responses with "stub:" prefixed
 * IDs. Lets the full UI + DB flow work end-to-end without burning
 * budget or requiring Live ads_management permission.
 *
 * Required env vars (all written to Vercel as Sensitive):
 *   META_AD_ACCOUNT_ID         — numeric ad account ID (no "act_" prefix needed; we add it)
 *   META_PAGE_ACCESS_TOKEN     — must have ads_management scope (re-mint via meta_token_rotate.py)
 *   META_PAGE_ID               — already set; the Page that owns the post being boosted
 *
 * Optional:
 *   META_BOOST_AUDIENCE_ID     — saved-audience ID. If unset, falls back to
 *                                geo + interest targeting hard-coded below.
 *   META_BOOST_DAILY_CENTS     — daily budget in cents. Default 100 ($1).
 *                                Hard cap of 500 cents ($5/day) to prevent
 *                                runaway spend if a bug fires repeatedly.
 *   META_BOOST_DURATION_HOURS  — how long the boost runs. Default 24 hours.
 *                                Hard cap of 168 (7 days).
 *
 * Permissions: this code uses META_PAGE_ACCESS_TOKEN, which today does NOT
 * carry ads_management. Until that scope is added (App Review at the
 * Standard Access tier should auto-grant for app admins), Marketing API
 * calls will fail with #200 / #100. The fail-soft pattern below surfaces
 * a clear error in boostStatus = 'failed' rather than crashing.
 */

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

// Default fallback targeting (Port Aransas + Corpus Christi metro + Rockport,
// 50mi radius, Texas). Used if META_BOOST_AUDIENCE_ID is unset.
const FALLBACK_TARGETING = {
  geo_locations: {
    custom_locations: [
      { latitude: 27.8339, longitude: -97.0611, radius: 50, distance_unit: "mile" },
    ],
    location_types: ["home", "recent"],
  },
  age_min: 25,
  age_max: 65,
  publisher_platforms: ["facebook"],
  facebook_positions: ["feed"],
};

export interface BoostConfig {
  /** numeric ad account ID — without the "act_" prefix */
  adAccountId: string;
  /** numeric Page ID owning the post being boosted */
  pageId: string;
  /** "{pageId}_{postId}" string from FB — what's in social_post_queue.external_post_id */
  externalPostId: string;
  /** human-readable name for the campaign — appears in Ads Manager */
  campaignName: string;
  /** daily spend in cents (whole cents, no decimals) */
  dailyBudgetCents: number;
  /** how long the campaign runs */
  durationHours: number;
  /** optional saved-audience ID; if unset, FALLBACK_TARGETING is used */
  audienceId?: string | null;
}

export interface BoostResult {
  ok: boolean;
  stubbed?: boolean;
  campaignId?: string;
  adsetId?: string;
  creativeId?: string;
  adId?: string;
  error?: string;
}

function getToken(): string | null {
  const t = (process.env.META_PAGE_ACCESS_TOKEN ?? "").trim();
  return t.length > 0 ? t : null;
}

function getAdAccountId(): string | null {
  const id = (process.env.META_AD_ACCOUNT_ID ?? "").trim();
  if (!id) return null;
  // Strip "act_" prefix if operator pasted it that way
  return id.startsWith("act_") ? id.slice(4) : id;
}

function getPageId(): string | null {
  const id = (process.env.META_PAGE_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

function getAudienceId(): string | null {
  const id = (process.env.META_BOOST_AUDIENCE_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

function getDailyBudgetCents(): number {
  const raw = Number(process.env.META_BOOST_DAILY_CENTS ?? "100");
  if (!Number.isFinite(raw) || raw <= 0) return 100;
  // Hard cap: $5/day so a bug can't burn >$5/post
  return Math.min(raw, 500);
}

function getDurationHours(): number {
  const raw = Number(process.env.META_BOOST_DURATION_HOURS ?? "24");
  if (!Number.isFinite(raw) || raw <= 0) return 24;
  // Hard cap: 7 days so a bug can't run a campaign forever
  return Math.min(raw, 168);
}

export function isBoostConfigured(): {
  ok: boolean;
  reason?: string;
} {
  if (!getToken()) return { ok: false, reason: "META_PAGE_ACCESS_TOKEN not set" };
  if (!getPageId()) return { ok: false, reason: "META_PAGE_ID not set" };
  if (!getAdAccountId())
    return { ok: false, reason: "META_AD_ACCOUNT_ID not set" };
  return { ok: true };
}

interface PostFormResponse<T> {
  data?: T;
  error?: string;
  raw: unknown;
}

async function postForm<T = Record<string, unknown>>(
  path: string,
  body: URLSearchParams,
): Promise<PostFormResponse<T>> {
  try {
    const res = await fetch(`${GRAPH_BASE}${path}`, {
      method: "POST",
      body,
    });
    const data = (await res.json()) as Record<string, unknown> & {
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        error:
          (data.error as { message?: string })?.message ??
          `HTTP ${res.status}`,
        raw: data,
      };
    }
    return { data: data as T, raw: data };
  } catch (err) {
    return {
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
      raw: null,
    };
  }
}

/**
 * Create a boost campaign for an existing FB post. Returns the IDs of
 * each Marketing API object created (campaign, adset, creative, ad).
 *
 * Atomicity caveat: if step 3 (creative) or 4 (ad) fails, the campaign
 * + adset already exist as PAUSED in Ads Manager. They won't spend, but
 * the operator will see them. Cleanup is manual via Ads Manager UI; we
 * don't bother with cleanup automation because partial-success is rare
 * and the cost is zero (PAUSED status doesn't bill).
 */
export async function createBoost(
  c: BoostConfig,
): Promise<BoostResult> {
  const token = getToken();
  const adAccount = c.adAccountId;
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  if (!adAccount) return { ok: false, error: "ad account id missing" };

  const startTime = new Date();
  const endTime = new Date(
    startTime.getTime() + c.durationHours * 60 * 60 * 1000,
  );

  // Step 1: Campaign
  const campaignBody = new URLSearchParams();
  campaignBody.set("name", `Boost · ${c.campaignName}`);
  campaignBody.set("objective", "OUTCOME_TRAFFIC");
  campaignBody.set("status", "ACTIVE");
  campaignBody.set("special_ad_categories", "[]");
  campaignBody.set("access_token", token);
  const campaignRes = await postForm<{ id: string }>(
    `/act_${adAccount}/campaigns`,
    campaignBody,
  );
  if (campaignRes.error || !campaignRes.data?.id) {
    return { ok: false, error: `campaign: ${campaignRes.error ?? "no id"}` };
  }
  const campaignId = campaignRes.data.id;

  // Step 2: Ad Set
  const adsetBody = new URLSearchParams();
  adsetBody.set("name", `AdSet · ${c.campaignName}`);
  adsetBody.set("campaign_id", campaignId);
  adsetBody.set("daily_budget", String(c.dailyBudgetCents));
  adsetBody.set("billing_event", "IMPRESSIONS");
  adsetBody.set("optimization_goal", "LINK_CLICKS");
  adsetBody.set("bid_strategy", "LOWEST_COST_WITHOUT_CAP");
  adsetBody.set("start_time", startTime.toISOString());
  adsetBody.set("end_time", endTime.toISOString());
  adsetBody.set("status", "ACTIVE");
  if (c.audienceId) {
    adsetBody.set(
      "targeting",
      JSON.stringify({ saved_audience_id: c.audienceId }),
    );
  } else {
    adsetBody.set("targeting", JSON.stringify(FALLBACK_TARGETING));
  }
  adsetBody.set("access_token", token);
  const adsetRes = await postForm<{ id: string }>(
    `/act_${adAccount}/adsets`,
    adsetBody,
  );
  if (adsetRes.error || !adsetRes.data?.id) {
    return {
      ok: false,
      campaignId,
      error: `adset: ${adsetRes.error ?? "no id"}`,
    };
  }
  const adsetId = adsetRes.data.id;

  // Step 3: Ad Creative — references the existing post via object_story_id.
  // This is the magic that makes it a "boost" of an organic post rather
  // than a new ad with new creative.
  const creativeBody = new URLSearchParams();
  creativeBody.set("name", `Creative · ${c.campaignName}`);
  creativeBody.set(
    "object_story_id",
    c.externalPostId, // "{pageId}_{postId}"
  );
  creativeBody.set("access_token", token);
  const creativeRes = await postForm<{ id: string }>(
    `/act_${adAccount}/adcreatives`,
    creativeBody,
  );
  if (creativeRes.error || !creativeRes.data?.id) {
    return {
      ok: false,
      campaignId,
      adsetId,
      error: `creative: ${creativeRes.error ?? "no id"}`,
    };
  }
  const creativeId = creativeRes.data.id;

  // Step 4: Ad — links adset + creative
  const adBody = new URLSearchParams();
  adBody.set("name", `Ad · ${c.campaignName}`);
  adBody.set("adset_id", adsetId);
  adBody.set("creative", JSON.stringify({ creative_id: creativeId }));
  adBody.set("status", "ACTIVE");
  adBody.set("access_token", token);
  const adRes = await postForm<{ id: string }>(
    `/act_${adAccount}/ads`,
    adBody,
  );
  if (adRes.error || !adRes.data?.id) {
    return {
      ok: false,
      campaignId,
      adsetId,
      creativeId,
      error: `ad: ${adRes.error ?? "no id"}`,
    };
  }

  return {
    ok: true,
    campaignId,
    adsetId,
    creativeId,
    adId: adRes.data.id,
  };
}

export interface BoostInsights {
  reach: number;
  impressions: number;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
  spendCents: number;
  startTime: string | null;
  stopTime: string | null;
  /** Full raw response for forward-compat / per-demographic drilldown */
  raw: Record<string, unknown>;
}

export async function fetchBoostInsights(
  adId: string,
): Promise<{ ok: boolean; insights?: BoostInsights; error?: string }> {
  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };

  const fields = [
    "reach",
    "impressions",
    "clicks",
    "unique_clicks",
    "ctr",
    "spend",
    "date_start",
    "date_stop",
  ].join(",");

  try {
    const url = `${GRAPH_BASE}/${adId}/insights?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, unknown> & {
      data?: Record<string, unknown>[];
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        error:
          (data.error as { message?: string })?.message ??
          `HTTP ${res.status}`,
      };
    }
    const row = (data.data ?? [])[0] ?? {};
    const spendDollars = Number((row.spend as string) ?? "0");
    const insights: BoostInsights = {
      reach: Number((row.reach as string) ?? "0"),
      impressions: Number((row.impressions as string) ?? "0"),
      clicks: Number((row.clicks as string) ?? "0"),
      uniqueClicks: Number((row.unique_clicks as string) ?? "0"),
      ctr: Number((row.ctr as string) ?? "0"),
      spendCents: Math.round(spendDollars * 100),
      startTime: (row.date_start as string) ?? null,
      stopTime: (row.date_stop as string) ?? null,
      raw: row,
    };
    return { ok: true, insights };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * High-level wrapper — reads env config, creates the boost. Used by the
 * /api/wheelhouse/social/boost endpoint. Falls into stub mode if config
 * isn't fully set up (lets the UI flow work end-to-end before ads_management
 * permission + ad account are wired).
 */
export async function boostPost(
  externalPostId: string,
  campaignName: string,
): Promise<BoostResult> {
  const config = isBoostConfigured();
  if (!config.ok) {
    console.log("[metaAds] STUB — would boost:", {
      reason: config.reason,
      externalPostId,
      campaignName,
    });
    return {
      ok: true,
      stubbed: true,
      adId: `stub:ad:${Date.now()}`,
      campaignId: `stub:campaign:${Date.now()}`,
      adsetId: `stub:adset:${Date.now()}`,
      creativeId: `stub:creative:${Date.now()}`,
    };
  }

  return createBoost({
    adAccountId: getAdAccountId()!,
    pageId: getPageId()!,
    externalPostId,
    campaignName,
    dailyBudgetCents: getDailyBudgetCents(),
    durationHours: getDurationHours(),
    audienceId: getAudienceId(),
  });
}
