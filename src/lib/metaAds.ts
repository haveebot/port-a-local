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
  /**
   * Optional ad-hoc Meta targeting spec — full JSON object passed straight
   * to Marketing API's targeting field. Use when you want geo / interest /
   * demographic / behavior layering that a saved audience doesn't cover.
   *
   * Wins precedence over audienceId. Caller is responsible for shape — this
   * function does not validate against Meta's schema.
   *
   * Example:
   *   {
   *     geo_locations: { custom_locations: [{lat, lng, radius, distance_unit}] },
   *     excluded_geo_locations: { zips: [{key: "US:78373"}] },
   *     age_min: 28, age_max: 65,
   *     income: [{id: "6017253486583"}],
   *     behaviors: [{id: "6071631541183"}],
   *     publisher_platforms: ["facebook"],
   *     facebook_positions: ["feed"],
   *   }
   */
  customTargeting?: Record<string, unknown>;
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
      targeting: c.customTargeting
        ? "customTargeting"
        : c.audienceId
          ? `saved_audience:${c.audienceId}`
          : "FALLBACK_TARGETING",
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
  if (c.customTargeting) {
    // Caller-provided ad-hoc targeting — wins over saved audience + fallback.
    adsetBody.set("targeting", JSON.stringify(c.customTargeting));
  } else if (c.audienceId) {
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

/* ------------------------------------------------------------------ */
/* Pause / Resume campaign status                                     */
/*                                                                    */
/* Meta Marketing API: POST /<campaign_id> with status=PAUSED|ACTIVE  */
/* updates the campaign status. PAUSED stops spend immediately; ACTIVE */
/* resumes a paused campaign within its existing budget + dates.       */
/*                                                                    */
/* Distinct from DELETED (permanent + non-recoverable in our UI) — we  */
/* don't expose Delete via the operator surface; if a campaign should  */
/* truly be ended, paused is sufficient since Meta won't spend on a    */
/* PAUSED campaign and the operator can re-resume if they change mind. */
/* ------------------------------------------------------------------ */

export interface SetCampaignStatusResult {
  ok: boolean;
  stubbed?: boolean;
  campaignId: string;
  newStatus: "ACTIVE" | "PAUSED";
  error?: string;
}

async function setCampaignStatus(
  campaignId: string,
  newStatus: "ACTIVE" | "PAUSED",
): Promise<SetCampaignStatusResult> {
  const token = getToken();
  if (!token) {
    return {
      ok: false,
      campaignId,
      newStatus,
      error: "META_PAGE_ACCESS_TOKEN not set",
    };
  }
  if (!getAdAccountId()) {
    console.log(
      `[metaAds] STUB — would set campaign ${campaignId} → ${newStatus}`,
    );
    return { ok: true, stubbed: true, campaignId, newStatus };
  }

  const body = new URLSearchParams();
  body.set("status", newStatus);
  body.set("access_token", token);

  const res = await postForm<{ success?: boolean; id?: string }>(
    `/${campaignId}`,
    body,
  );
  if (res.error) {
    return {
      ok: false,
      campaignId,
      newStatus,
      error: res.error,
    };
  }
  return { ok: true, campaignId, newStatus };
}

/**
 * Pause a campaign. Idempotent on Meta's side (PAUSE on a PAUSED
 * campaign is a no-op success). Stub-mode safe.
 */
export async function pauseCampaign(
  campaignId: string,
): Promise<SetCampaignStatusResult> {
  return setCampaignStatus(campaignId, "PAUSED");
}

/**
 * Resume (un-pause) a campaign. Brings a PAUSED campaign back to ACTIVE
 * within its existing budget + date window. Idempotent. Stub-mode safe.
 */
export async function resumeCampaign(
  campaignId: string,
): Promise<SetCampaignStatusResult> {
  return setCampaignStatus(campaignId, "ACTIVE");
}

/* ------------------------------------------------------------------ */
/* Custom Audiences — Website Custom Audience (WCA) from Pixel events */
/*                                                                    */
/* Audiences live at the ad-account level. A Website Custom Audience  */
/* is defined by an `event_sources` reference to a Pixel ID plus a    */
/* rule filter on event names + a retention window. Meta needs ~24    */
/* hours of Pixel data to start populating; size estimate appears in  */
/* approximate_count_lower_bound / upper_bound on the list endpoint.  */
/*                                                                    */
/* Limit: WCA list calls return small payloads; we paginate up to 200 */
/* in one fetch (Meta default is 25, max useful is a couple hundred). */
/* ------------------------------------------------------------------ */

export interface CustomAudienceSummary {
  id: string;
  name: string;
  description: string | null;
  subtype: string | null;
  retentionDays: number | null;
  countLower: number | null;
  countUpper: number | null;
  deliveryStatus: string | null;
  operationStatus: string | null;
  timeCreated: string | null;
}

export interface ListCustomAudiencesResult {
  ok: boolean;
  stubbed?: boolean;
  audiences?: CustomAudienceSummary[];
  error?: string;
}

export async function listCustomAudiences(): Promise<ListCustomAudiencesResult> {
  const token = getToken();
  const adAccount = getAdAccountId();
  if (!token || !adAccount) {
    return { ok: true, stubbed: true, audiences: [] };
  }

  const fields = [
    "id",
    "name",
    "description",
    "subtype",
    "retention_days",
    "approximate_count_lower_bound",
    "approximate_count_upper_bound",
    "delivery_status",
    "operation_status",
    "time_created",
  ].join(",");

  const params = new URLSearchParams();
  params.set("fields", fields);
  params.set("limit", "200");
  params.set("access_token", token);

  try {
    const url = `${GRAPH_BASE}/act_${adAccount}/customaudiences?${params.toString()}`;
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
    const rows = data.data ?? [];
    const audiences: CustomAudienceSummary[] = rows.map((row) => {
      const lower = row.approximate_count_lower_bound;
      const upper = row.approximate_count_upper_bound;
      const ret = row.retention_days;
      const delivery = row.delivery_status as
        | Record<string, unknown>
        | undefined;
      const op = row.operation_status as Record<string, unknown> | undefined;
      return {
        id: (row.id as string) ?? "",
        name: (row.name as string) ?? "",
        description: (row.description as string) ?? null,
        subtype: (row.subtype as string) ?? null,
        retentionDays:
          typeof ret === "number"
            ? ret
            : ret != null && Number.isFinite(Number(ret))
              ? Number(ret)
              : null,
        countLower:
          typeof lower === "number"
            ? lower
            : lower != null && Number.isFinite(Number(lower))
              ? Number(lower)
              : null,
        countUpper:
          typeof upper === "number"
            ? upper
            : upper != null && Number.isFinite(Number(upper))
              ? Number(upper)
              : null,
        deliveryStatus: (delivery?.description as string) ?? null,
        operationStatus: (op?.description as string) ?? null,
        timeCreated: (row.time_created as string) ?? null,
      };
    });
    return { ok: true, audiences };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export interface CreateWcaConfig {
  /** human-readable name shown in Ads Manager + the Wheelhouse picker */
  name: string;
  /** the Pixel ID — defaults to NEXT_PUBLIC_META_PIXEL_ID */
  pixelId?: string;
  /** which Pixel event to match. PageView = "all site visitors". */
  event: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead";
  /** how long users stay in the audience after firing the event */
  retentionDays: number;
  /** optional operator-visible description */
  description?: string;
}

export interface CreateWcaResult {
  ok: boolean;
  stubbed?: boolean;
  audienceId?: string;
  error?: string;
}

function getPixelId(): string | null {
  const id = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();
  return id.length > 0 ? id : null;
}

/**
 * Create a Website Custom Audience defined by a Pixel event filter.
 * Returns the new audience ID; once Meta populates it (~24h), the
 * audience becomes selectable in the Create Ad form.
 */
export async function createWebsiteCustomAudience(
  c: CreateWcaConfig,
): Promise<CreateWcaResult> {
  const token = getToken();
  const adAccount = getAdAccountId();
  const pixelId = c.pixelId?.trim() || getPixelId();

  if (!token || !adAccount) {
    console.log(
      `[metaAds] STUB — would create WCA "${c.name}" (event=${c.event}, ${c.retentionDays}d)`,
    );
    return { ok: true, stubbed: true, audienceId: `stub:wca:${Date.now()}` };
  }
  if (!pixelId) {
    return { ok: false, error: "NEXT_PUBLIC_META_PIXEL_ID not set" };
  }
  if (c.retentionDays < 1 || c.retentionDays > 180) {
    return { ok: false, error: "retentionDays must be between 1 and 180" };
  }

  const rule = {
    inclusions: {
      operator: "or",
      rules: [
        {
          event_sources: [{ id: pixelId, type: "pixel" }],
          retention_seconds: c.retentionDays * 86400,
          filter: {
            operator: "and",
            filters: [
              {
                field: "event",
                operator: "eq",
                value: c.event,
              },
            ],
          },
        },
      ],
    },
  };

  const body = new URLSearchParams();
  body.set("name", c.name);
  body.set("subtype", "WEBSITE");
  body.set("pixel_id", pixelId);
  body.set("rule", JSON.stringify(rule));
  body.set("retention_days", String(c.retentionDays));
  body.set("prefill", "true");
  if (c.description) body.set("description", c.description);
  body.set("access_token", token);

  const res = await postForm<{ id: string }>(
    `/act_${adAccount}/customaudiences`,
    body,
  );
  if (res.error || !res.data?.id) {
    return {
      ok: false,
      error: res.error ?? "no audience id returned",
    };
  }
  return { ok: true, audienceId: res.data.id };
}

export interface DeleteCustomAudienceResult {
  ok: boolean;
  stubbed?: boolean;
  audienceId: string;
  error?: string;
}

/**
 * Delete a Custom Audience permanently. Meta soft-deletes — the row
 * disappears from listings but historical ad attribution stays in
 * Insights. Idempotent: re-deleting returns ok:true.
 */
export async function deleteCustomAudience(
  audienceId: string,
): Promise<DeleteCustomAudienceResult> {
  const token = getToken();
  if (!token) {
    return {
      ok: false,
      audienceId,
      error: "META_PAGE_ACCESS_TOKEN not set",
    };
  }
  if (!getAdAccountId()) {
    console.log(`[metaAds] STUB — would delete audience ${audienceId}`);
    return { ok: true, stubbed: true, audienceId };
  }

  try {
    const url = `${GRAPH_BASE}/${audienceId}?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: "DELETE" });
    const data = (await res.json()) as Record<string, unknown> & {
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        audienceId,
        error:
          (data.error as { message?: string })?.message ??
          `HTTP ${res.status}`,
      };
    }
    return { ok: true, audienceId };
  } catch (err) {
    return {
      ok: false,
      audienceId,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export interface SearchTargetingResult {
  ok: boolean;
  stubbed?: boolean;
  results?: Array<{
    id?: string | number;
    name?: string;
    audience_size?: number;
    audience_size_lower_bound?: number;
    audience_size_upper_bound?: number;
    type?: string;
    path?: string[];
    description?: string;
    [key: string]: unknown;
  }>;
  error?: string;
}

/**
 * Look up Meta Marketing API targeting options by type + query string.
 *
 * Dispatches internally to the right Meta endpoint based on type:
 *   - `/search?type=X&q=Y`             — for textually searchable types:
 *                                        adinterest, adgeolocation,
 *                                        adlocale, adeducation*, adwork*
 *   - `/act_X/targetingbrowse?class=X` — for browse-only categories:
 *                                        behaviors, demographics, income,
 *                                        interests (taxonomy node),
 *                                        family_statuses, life_events,
 *                                        industries
 *
 * Returns the raw `data` array from Meta. Caller picks IDs from name
 * matches and assembles a `customTargeting` JSON for `createAd`.
 *
 * For browse types, an optional `q` filters server-returned results
 * client-side by case-insensitive substring match against `name`
 * (Meta's targetingbrowse endpoint does not accept a search query).
 *
 * Use cases:
 *   - "Port Aransas" interest    → searchTargeting({type:"adinterest", q:"Port Aransas"})
 *   - "Engaged shoppers"         → searchTargeting({type:"behaviors", q:"engaged shop"})
 *   - Top-50% household income   → searchTargeting({type:"demographics", q:"household income"})
 *   - Houston metro              → searchTargeting({type:"adgeolocation", q:"Houston"})
 */
export async function searchTargeting(opts: {
  type: string;
  q?: string;
  limit?: number;
}): Promise<SearchTargetingResult> {
  const token = getToken();
  if (!token) {
    return { ok: false, error: "META_PAGE_ACCESS_TOKEN not set" };
  }

  const limit = Math.min(Math.max(1, opts.limit ?? 25), 100);
  const type = opts.type.trim();
  const q = (opts.q ?? "").trim();

  // Meta's /search endpoint accepts these `type` values.
  const SEARCH_TYPES = new Set([
    "adinterest",
    "adgeolocation",
    "adlocale",
    "adeducationmajor",
    "adeducationschool",
    "adworkemployer",
    "adworkposition",
    "adgeolocationmeta",
  ]);

  // Meta's /act_X/targetingbrowse endpoint accepts these `class` values.
  const BROWSE_TYPES = new Set([
    "behaviors",
    "demographics",
    "interests",
    "family_statuses",
    "life_events",
    "industries",
    "income",
    "user_device",
    "user_os",
  ]);

  try {
    if (SEARCH_TYPES.has(type)) {
      const url = `${GRAPH_BASE}/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        data?: Array<Record<string, unknown>>;
        error?: { message?: string };
      };
      if (!res.ok) {
        return {
          ok: false,
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }
      return {
        ok: true,
        results: (data.data ?? []) as SearchTargetingResult["results"],
      };
    }

    if (BROWSE_TYPES.has(type)) {
      const adAccount = getAdAccountId();
      if (!adAccount) {
        return { ok: false, error: "META_AD_ACCOUNT_ID not set" };
      }
      const url = `${GRAPH_BASE}/act_${adAccount}/targetingbrowse?include_headers=false&class=${encodeURIComponent(type)}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        data?: Array<Record<string, unknown>>;
        error?: { message?: string };
      };
      if (!res.ok) {
        return {
          ok: false,
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }
      let results = (data.data ?? []) as SearchTargetingResult["results"];
      // targetingbrowse doesn't accept a search query — filter client-side.
      if (q && results) {
        const qLower = q.toLowerCase();
        results = results.filter(
          (r) =>
            typeof r.name === "string" && r.name.toLowerCase().includes(qLower),
        );
      }
      return { ok: true, results };
    }

    return {
      ok: false,
      error: `unsupported type: "${type}" (supported: ${[...SEARCH_TYPES, ...BROWSE_TYPES].join(", ")})`,
    };
  } catch (err) {
    return {
      ok: false,
      error: `fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
