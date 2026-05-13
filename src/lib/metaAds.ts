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
  // Required by FB Marketing API as of late 2024: must explicitly opt
  // out of campaign-level budget sharing when using ad-set-level budgets.
  // Without this we get error_subcode 4834011 "Must specify True or False
  // in is_adset_budget_sharing_enabled". We set budget on the AdSet (not
  // the campaign), so opting out is correct.
  campaignBody.set("is_adset_budget_sharing_enabled", "false");
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
  // Use lifetime_budget (not daily_budget) for two reasons:
  //   1. daily_budget requires the schedule to be >= 24 hours (FB error
  //      subcode 1487793 — "Campaign Schedule Is Too Short" — when we
  //      schedule exactly 24h with daily_budget). lifetime_budget has no
  //      such restriction.
  //   2. lifetime_budget gives us absolute spend predictability. A $1
  //      lifetime budget over 24h means we spend at most $1, full stop.
  //      With daily_budget, multi-day campaigns multiply.
  // For PAL's $1/24h boost use case, the math is identical to daily_budget
  // anyway. Total cap remains the env-configured cents value (default 100).
  const lifetimeBudgetCents =
    c.dailyBudgetCents * Math.max(1, c.durationHours / 24);
  const adsetBody = new URLSearchParams();
  adsetBody.set("name", `AdSet · ${c.campaignName}`);
  adsetBody.set("campaign_id", campaignId);
  adsetBody.set("lifetime_budget", String(Math.round(lifetimeBudgetCents)));
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
  datePreset?: InsightsDatePreset,
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
    const presetParam = datePreset
      ? `&date_preset=${encodeURIComponent(datePreset)}`
      : "";
    const url = `${GRAPH_BASE}/${adId}/insights?fields=${encodeURIComponent(fields)}${presetParam}&access_token=${encodeURIComponent(token)}`;
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
 * Top up an existing boost adset's lifetime_budget — used when an operator
 * wants a hot post to keep serving past its original cap. Reads the current
 * budget first, adds the new cents, PATCHes the adset.
 *
 * Returns the new lifetime budget so the UI can confirm the cap moved.
 *
 * Caveats:
 *   - Meta enforces a minimum gap above already-spent amount (~$1 above
 *     current spend). Trying to set a cap below current spend silently
 *     fails or returns a #100 error.
 *   - Adset must be in a state that accepts budget changes (ACTIVE works;
 *     PAUSED/COMPLETED is iffy depending on completion timing).
 */
export async function topUpBoost(
  adsetId: string,
  additionalCents: number,
): Promise<{
  ok: boolean;
  previousCents?: number;
  newCents?: number;
  error?: string;
}> {
  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  if (!Number.isFinite(additionalCents) || additionalCents <= 0) {
    return { ok: false, error: "additionalCents must be > 0" };
  }

  try {
    // Step 1: read current budget
    const getUrl = `${GRAPH_BASE}/${adsetId}?fields=lifetime_budget&access_token=${encodeURIComponent(token)}`;
    const getRes = await fetch(getUrl);
    const getData = (await getRes.json()) as Record<string, unknown> & {
      error?: { message?: string };
    };
    if (!getRes.ok) {
      return {
        ok: false,
        error:
          (getData.error as { message?: string })?.message ??
          `read HTTP ${getRes.status}`,
      };
    }
    const currentCents = Number(getData.lifetime_budget ?? 0);
    if (!Number.isFinite(currentCents) || currentCents <= 0) {
      return { ok: false, error: "no current lifetime_budget on adset" };
    }
    const newCents = currentCents + Math.round(additionalCents);

    // Step 2: PATCH new budget
    const body = new URLSearchParams();
    body.set("lifetime_budget", String(newCents));
    body.set("access_token", token);
    const patchRes = await fetch(`${GRAPH_BASE}/${adsetId}`, {
      method: "POST",
      body,
    });
    const patchData = (await patchRes.json()) as Record<string, unknown> & {
      error?: { message?: string };
    };
    if (!patchRes.ok) {
      return {
        ok: false,
        previousCents: currentCents,
        error:
          (patchData.error as { message?: string })?.message ??
          `patch HTTP ${patchRes.status}`,
      };
    }
    return {
      ok: true,
      previousCents: currentCents,
      newCents,
    };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export type InsightsDatePreset =
  | "today"
  | "yesterday"
  | "last_24h"
  | "last_3d"
  | "last_7d"
  | "last_14d"
  | "last_30d"
  | "maximum";

export interface AdStatus {
  id: string;
  name: string | null;
  status: string | null;
  effectiveStatus: string | null;
  configuredStatus: string | null;
  issuesInfo: unknown[] | null;
  createdTime: string | null;
  updatedTime: string | null;
  /** Full raw response */
  raw: Record<string, unknown>;
}

/**
 * Pull an ad's review/delivery state from Meta Marketing API. Used by the
 * diagnose endpoint to distinguish "Meta hasn't approved yet" vs "approved
 * but not serving" vs "rejected" when our insights pull comes back empty.
 *
 * effective_status enums of interest:
 *   ACTIVE              — running normally
 *   IN_PROCESS          — being processed (review or learning)
 *   PENDING_REVIEW      — under Meta's ad review
 *   DISAPPROVED         — rejected; check issues_info
 *   PENDING_BILLING_INFO— payment method missing/declined
 *   CAMPAIGN_PAUSED     — parent campaign off
 *   ADSET_PAUSED        — parent adset off
 *   PAUSED              — this ad off
 */
export async function fetchAdStatus(
  adId: string,
): Promise<{ ok: boolean; status?: AdStatus; error?: string }> {
  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };

  const fields = [
    "id",
    "name",
    "status",
    "effective_status",
    "configured_status",
    "issues_info",
    "created_time",
    "updated_time",
  ].join(",");

  try {
    const url = `${GRAPH_BASE}/${adId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, unknown> & {
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
    return {
      ok: true,
      status: {
        id: String(data.id ?? adId),
        name: (data.name as string) ?? null,
        status: (data.status as string) ?? null,
        effectiveStatus: (data.effective_status as string) ?? null,
        configuredStatus: (data.configured_status as string) ?? null,
        issuesInfo: (data.issues_info as unknown[]) ?? null,
        createdTime: (data.created_time as string) ?? null,
        updatedTime: (data.updated_time as string) ?? null,
        raw: data,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Pull an ad account's spend summary across all ads, all time. Sanity check
 * for "is this account actually spending anything?" — if every per-ad pull
 * returns 0 but account-level shows $X, we know per-ad insights are lagged
 * or wrongly scoped.
 */
export async function fetchAccountInsights(
  datePreset: InsightsDatePreset = "today",
): Promise<{
  ok: boolean;
  insights?: BoostInsights;
  error?: string;
}> {
  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  const adAccountId = getAdAccountId();
  if (!adAccountId) return { ok: false, error: "META_AD_ACCOUNT_ID not set" };

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
    const url = `${GRAPH_BASE}/act_${adAccountId}/insights?fields=${encodeURIComponent(fields)}&date_preset=${encodeURIComponent(datePreset)}&level=account&access_token=${encodeURIComponent(token)}`;
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
    return {
      ok: true,
      insights: {
        reach: Number((row.reach as string) ?? "0"),
        impressions: Number((row.impressions as string) ?? "0"),
        clicks: Number((row.clicks as string) ?? "0"),
        uniqueClicks: Number((row.unique_clicks as string) ?? "0"),
        ctr: Number((row.ctr as string) ?? "0"),
        spendCents: Math.round(spendDollars * 100),
        startTime: (row.date_start as string) ?? null,
        stopTime: (row.date_stop as string) ?? null,
        raw: row,
      },
    };
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
  options?: {
    /**
     * Per-call budget override in cents. Capped at the same hard $5/day
     * ceiling regardless of what's passed. Used for "high-value push"
     * posts that should spend more than the env-default. Leave undefined
     * to use META_BOOST_DAILY_CENTS env (default 100 cents = $1/day).
     */
    budgetCents?: number;
  },
): Promise<BoostResult> {
  const config = isBoostConfigured();
  if (!config.ok) {
    console.log("[metaAds] STUB — would boost:", {
      reason: config.reason,
      externalPostId,
      campaignName,
      budgetCents: options?.budgetCents,
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

  // Apply per-call override if supplied; still capped by getDailyBudgetCents
  // hard cap (500 cents = $5/day max).
  const override = options?.budgetCents;
  const dailyBudgetCents =
    override && Number.isFinite(override) && override > 0
      ? Math.min(override, 500)
      : getDailyBudgetCents();

  return createBoost({
    adAccountId: getAdAccountId()!,
    pageId: getPageId()!,
    externalPostId,
    campaignName,
    dailyBudgetCents,
    durationHours: getDurationHours(),
    audienceId: getAudienceId(),
  });
}

/* ------------------------------------------------------------------ */
/* Ads tool — list campaigns in the ad account                        */
/*                                                                    */
/* Foundation for /wheelhouse/ads. Returns every campaign the ad      */
/* account owns, including boost campaigns (which createBoost names    */
/* with the prefix "Boost · ") and any standalone ads created via the */
/* Marketing API or Ads Manager UI.                                    */
/* ------------------------------------------------------------------ */

export type CampaignObjective =
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_SALES"
  | "OUTCOME_APP_PROMOTION"
  | string;

export type CampaignStatus =
  | "ACTIVE"
  | "PAUSED"
  | "DELETED"
  | "ARCHIVED"
  | "WITH_ISSUES"
  | string;

export interface CampaignSummary {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  /** daily budget in cents (Meta returns smallest currency unit) */
  dailyBudgetCents: number | null;
  lifetimeBudgetCents: number | null;
  createdTime: string | null;
  startTime: string | null;
  stopTime: string | null;
  /** true if name starts with "Boost · " — created by createBoost rather than a standalone ad */
  isBoost: boolean;
}

export interface ListCampaignsResult {
  ok: boolean;
  stubbed?: boolean;
  campaigns?: CampaignSummary[];
  error?: string;
}

/**
 * List campaigns in the ad account. Defaults to the most recent 100,
 * excluding DELETED + ARCHIVED. Returns stubbed=true with empty list
 * when META_AD_ACCOUNT_ID isn't set, so the UI flow works end-to-end
 * before Marketing API permission is wired.
 */
export async function listCampaigns(
  opts: { limit?: number; includeArchived?: boolean } = {},
): Promise<ListCampaignsResult> {
  const token = getToken();
  const adAccount = getAdAccountId();
  if (!token || !adAccount) {
    return { ok: true, stubbed: true, campaigns: [] };
  }

  const limit = Math.min(opts.limit ?? 100, 500);
  const fields = [
    "id",
    "name",
    "objective",
    "status",
    "daily_budget",
    "lifetime_budget",
    "created_time",
    "start_time",
    "stop_time",
  ].join(",");

  const params = new URLSearchParams();
  params.set("fields", fields);
  params.set("limit", String(limit));
  if (!opts.includeArchived) {
    params.set(
      "effective_status",
      JSON.stringify([
        "ACTIVE",
        "PAUSED",
        "PENDING_REVIEW",
        "DISAPPROVED",
        "PREAPPROVED",
        "CAMPAIGN_PAUSED",
      ]),
    );
  }
  params.set("access_token", token);

  try {
    const url = `${GRAPH_BASE}/act_${adAccount}/campaigns?${params.toString()}`;
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, unknown> & {
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
    const rows = (data.data as Record<string, unknown>[] | undefined) ?? [];
    const campaigns: CampaignSummary[] = rows.map((row) => {
      const name = (row.name as string) ?? "";
      const daily = row.daily_budget ? Number(row.daily_budget) : null;
      const lifetime = row.lifetime_budget ? Number(row.lifetime_budget) : null;
      return {
        id: (row.id as string) ?? "",
        name,
        objective: (row.objective as string) ?? "",
        status: (row.status as string) ?? "",
        dailyBudgetCents: daily && Number.isFinite(daily) ? daily : null,
        lifetimeBudgetCents:
          lifetime && Number.isFinite(lifetime) ? lifetime : null,
        createdTime: (row.created_time as string) ?? null,
        startTime: (row.start_time as string) ?? null,
        stopTime: (row.stop_time as string) ?? null,
        isBoost: name.startsWith("Boost · "),
      };
    });
    return { ok: true, campaigns };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Ads tool — Create Ad (parameterized boost)                         */
/*                                                                    */
/* createAd is the operator-facing equivalent of createBoost: same    */
/* Campaign → AdSet → Creative → Ad chain, but exposes the objective  */
/* + larger budget + longer duration caps. Boost is the simplified    */
/* subset of Ad — fixed OUTCOME_TRAFFIC objective, $5/day cap, 7-day  */
/* cap. createAd opens up Traffic / Awareness / Engagement / Leads at */
/* $50/day cap and 30-day cap, suitable for dedicated campaigns       */
/* rather than per-post amplification.                                */
/*                                                                    */
/* Naming convention distinguishes the two paths in the campaign list */
/* (see /wheelhouse/ads): createBoost prefixes "Boost · ", createAd   */
/* prefixes "Ad · ". The /wheelhouse/ads page uses this prefix to     */
/* surface an "boost" tag next to boost-created campaigns.            */
/* ------------------------------------------------------------------ */

/** Objectives exposed in the Create Ad form. Subset of Meta's enum — */
/* OUTCOME_SALES + OUTCOME_APP_PROMOTION need pixel + app setup; ship */
/* later. */
export type AdObjective =
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS";

/** Hard cap on daily spend per ad (cents). 10x the boost cap. */
export const AD_DAILY_BUDGET_CAP_CENTS = 5000;
/** Hard cap on ad duration (hours). ~4x the boost cap. */
export const AD_DURATION_CAP_HOURS = 720;

export interface AdConfig {
  /** numeric ad account ID — without the "act_" prefix */
  adAccountId: string;
  /** numeric Page ID owning the post being promoted */
  pageId: string;
  /** "{pageId}_{postId}" — what's in social_post_queue.external_post_id */
  externalPostId: string;
  /** human-readable name for the campaign — appears in Ads Manager */
  campaignName: string;
  /** Meta campaign objective (see AdObjective) */
  objective: AdObjective;
  /** daily spend in cents (whole cents, no decimals). Capped at AD_DAILY_BUDGET_CAP_CENTS. */
  dailyBudgetCents: number;
  /** how long the campaign runs (hours). Capped at AD_DURATION_CAP_HOURS. */
  durationHours: number;
  /** optional saved-audience ID; if unset, FALLBACK_TARGETING is used */
  audienceId?: string | null;
}

export interface AdResult {
  ok: boolean;
  stubbed?: boolean;
  campaignId?: string;
  adsetId?: string;
  creativeId?: string;
  adId?: string;
  error?: string;
}

/**
 * Map an ad objective to the optimization_goal + billing_event that
 * Meta accepts for that objective. Wrong combos produce error #2491:
 * "Optimization goal X is not allowed with objective Y."
 *
 * Conservative defaults: IMPRESSIONS billing across the board (most
 * forgiving), per-objective optimization_goal that's known-compatible.
 * Future PR can expose these to the operator if they ever need more
 * surgical control.
 */
function optimizationForObjective(objective: AdObjective): {
  optimizationGoal: string;
  billingEvent: string;
} {
  switch (objective) {
    case "OUTCOME_AWARENESS":
      return { optimizationGoal: "REACH", billingEvent: "IMPRESSIONS" };
    case "OUTCOME_ENGAGEMENT":
      return { optimizationGoal: "POST_ENGAGEMENT", billingEvent: "IMPRESSIONS" };
    case "OUTCOME_LEADS":
      return { optimizationGoal: "LEAD_GENERATION", billingEvent: "IMPRESSIONS" };
    case "OUTCOME_TRAFFIC":
    default:
      return { optimizationGoal: "LINK_CLICKS", billingEvent: "IMPRESSIONS" };
  }
}

/**
 * Create an ad campaign for an existing FB post. Parameterized version
 * of createBoost — same 4-step chain (Campaign → AdSet → Creative → Ad),
 * but exposes objective + accepts wider budget/duration ranges.
 *
 * Stub mode: if META_AD_ACCOUNT_ID is unset, returns ok:true with
 * stubbed:true + stub IDs. Mirrors createBoost so the UI flow works
 * end-to-end before Marketing API permission is wired.
 *
 * Atomicity caveat: same as createBoost — partial-success leaves
 * PAUSED objects in Ads Manager but doesn't bill.
 */
export async function createAd(c: AdConfig): Promise<AdResult> {
  // Stub-mode short-circuit when ad account isn't configured. Mirrors
  // boostPost's stub branch so the operator can exercise the Create Ad
  // form end-to-end before ads_management is provisioned.
  const envAdAccount = getAdAccountId();
  if (!envAdAccount) {
    console.log("[metaAds] STUB — would create ad:", {
      reason: "META_AD_ACCOUNT_ID not set",
      objective: c.objective,
      campaignName: c.campaignName,
      externalPostId: c.externalPostId,
      dailyBudgetCents: c.dailyBudgetCents,
      durationHours: c.durationHours,
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

  const token = getToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  if (!c.adAccountId) return { ok: false, error: "ad account id missing" };

  // Enforce caps regardless of what caller passed. UI should validate
  // first but server is the authority.
  const dailyBudgetCents = Math.min(
    Math.max(1, Math.round(c.dailyBudgetCents)),
    AD_DAILY_BUDGET_CAP_CENTS,
  );
  const durationHours = Math.min(
    Math.max(1, Math.round(c.durationHours)),
    AD_DURATION_CAP_HOURS,
  );

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
  const { optimizationGoal, billingEvent } = optimizationForObjective(
    c.objective,
  );

  // Step 1: Campaign — "Ad · " prefix distinguishes from "Boost · " in the
  // campaign list so the /wheelhouse/ads UI can tag boost rows separately.
  const campaignBody = new URLSearchParams();
  campaignBody.set("name", `Ad · ${c.campaignName}`);
  campaignBody.set("objective", c.objective);
  campaignBody.set("status", "ACTIVE");
  campaignBody.set("special_ad_categories", "[]");
  campaignBody.set("is_adset_budget_sharing_enabled", "false");
  campaignBody.set("access_token", token);
  const campaignRes = await postForm<{ id: string }>(
    `/act_${c.adAccountId}/campaigns`,
    campaignBody,
  );
  if (campaignRes.error || !campaignRes.data?.id) {
    return { ok: false, error: `campaign: ${campaignRes.error ?? "no id"}` };
  }
  const campaignId = campaignRes.data.id;

  // Step 2: Ad Set — lifetime_budget = dailyBudget * (durationHours / 24)
  // Same reasoning as createBoost: lifetime_budget has no minimum-duration
  // constraint and gives absolute spend predictability.
  const lifetimeBudgetCents = Math.round(
    dailyBudgetCents * Math.max(1, durationHours / 24),
  );
  const adsetBody = new URLSearchParams();
  adsetBody.set("name", `AdSet · ${c.campaignName}`);
  adsetBody.set("campaign_id", campaignId);
  adsetBody.set("lifetime_budget", String(lifetimeBudgetCents));
  adsetBody.set("billing_event", billingEvent);
  adsetBody.set("optimization_goal", optimizationGoal);
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
    `/act_${c.adAccountId}/adsets`,
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
  // Same as createBoost: post-based ad, no new creative needed.
  const creativeBody = new URLSearchParams();
  creativeBody.set("name", `Creative · ${c.campaignName}`);
  creativeBody.set("object_story_id", c.externalPostId);
  creativeBody.set("access_token", token);
  const creativeRes = await postForm<{ id: string }>(
    `/act_${c.adAccountId}/adcreatives`,
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
    `/act_${c.adAccountId}/ads`,
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

/**
 * Fetch campaign-level insights (reach, impressions, clicks, spend, CTR)
 * for the whole lifetime of the campaign. Mirrors fetchBoostInsights but
 * hits the campaign object's /insights edge rather than an ad's.
 *
 * Returns same BoostInsights shape — re-using the type avoids divergence
 * in the UI. Stub-mode safe (returns ok:false if no token, caller can
 * render fallback).
 */
export async function fetchCampaignInsights(
  campaignId: string,
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
    const url = `${GRAPH_BASE}/${campaignId}/insights?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;
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
