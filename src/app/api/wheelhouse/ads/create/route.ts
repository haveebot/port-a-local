import { NextRequest, NextResponse } from "next/server";
import { getById } from "@/data/social-post-store";
import {
  createAd,
  AD_DAILY_BUDGET_CAP_CENTS,
  AD_DURATION_CAP_HOURS,
  type AdObjective,
} from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Create a dedicated Meta ad campaign for an existing FB post.
 *
 *   POST /api/wheelhouse/ads/create
 *     body: {
 *       objective: "OUTCOME_TRAFFIC" | "OUTCOME_AWARENESS" |
 *                  "OUTCOME_ENGAGEMENT" | "OUTCOME_LEADS",
 *       campaignName: string,
 *       externalPostId: string,            // "{pageId}_{postId}" from FB
 *       dailyBudgetCents: number,          // 1..AD_DAILY_BUDGET_CAP_CENTS
 *       durationDays: number,              // 1..30
 *       audienceId?: string | null,        // optional saved-audience ID
 *       sourcePostId?: number              // social_post_queue.id, optional —
 *                                          // helps server verify the post is
 *                                          // sent & has a real externalPostId
 *     }
 *
 *   Returns: { ok, stubbed?, campaignId?, adsetId?, creativeId?, adId?, error? }
 *
 * Distinct from /api/wheelhouse/social/boost: that's the simplified
 * Boost path (fixed objective + $5/day cap). This is the parameterized
 * Ad path (operator picks objective, larger caps).
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */

const VALID_OBJECTIVES: ReadonlySet<AdObjective> = new Set<AdObjective>([
  "OUTCOME_TRAFFIC",
  "OUTCOME_AWARENESS",
  "OUTCOME_ENGAGEMENT",
  "OUTCOME_LEADS",
]);

interface CreateAdBody {
  objective?: string;
  campaignName?: string;
  externalPostId?: string;
  dailyBudgetCents?: number;
  durationDays?: number;
  audienceId?: string | null;
  /** Optional: social_post_queue.id so the server can re-verify the post. */
  sourcePostId?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateAdBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // --- Validate inputs (server-side authority, even if UI already did) ---
  const objective = body.objective as AdObjective | undefined;
  if (!objective || !VALID_OBJECTIVES.has(objective)) {
    return NextResponse.json(
      { error: "invalid_objective", detail: "Must be one of OUTCOME_TRAFFIC, OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS." },
      { status: 400 },
    );
  }

  const campaignName = (body.campaignName ?? "").trim();
  if (!campaignName) {
    return NextResponse.json(
      { error: "missing_campaign_name" },
      { status: 400 },
    );
  }
  if (campaignName.length > 200) {
    return NextResponse.json(
      { error: "campaign_name_too_long", maxChars: 200 },
      { status: 400 },
    );
  }

  let externalPostId = (body.externalPostId ?? "").trim();
  if (!externalPostId) {
    return NextResponse.json(
      { error: "missing_external_post_id" },
      { status: 400 },
    );
  }

  // If a sourcePostId is supplied, look it up to verify it's a real sent
  // post (not a stub) and that its externalPostId matches what was passed.
  // Belt + suspenders — the form pre-fills from sent posts, but a manual
  // POST shouldn't be able to bypass this.
  if (body.sourcePostId && Number.isFinite(body.sourcePostId)) {
    const post = await getById(Number(body.sourcePostId));
    if (!post) {
      return NextResponse.json(
        { error: "source_post_not_found" },
        { status: 404 },
      );
    }
    if (post.status !== "sent" || !post.externalPostId) {
      return NextResponse.json(
        {
          error: "source_post_not_eligible",
          detail: "Post must be sent (status=sent) with an externalPostId.",
        },
        { status: 409 },
      );
    }
    if (post.externalPostId.startsWith("stub:")) {
      return NextResponse.json(
        {
          error: "source_post_was_stubbed",
          detail:
            "This post was published in stub mode — no real FB post exists to advertise.",
        },
        { status: 409 },
      );
    }
    // Trust the server's record over the body if they disagree.
    externalPostId = post.externalPostId;
  }

  const dailyBudgetCents = Number(body.dailyBudgetCents);
  if (
    !Number.isFinite(dailyBudgetCents) ||
    dailyBudgetCents < 1 ||
    dailyBudgetCents > AD_DAILY_BUDGET_CAP_CENTS
  ) {
    return NextResponse.json(
      {
        error: "invalid_daily_budget",
        detail: `Must be 1..${AD_DAILY_BUDGET_CAP_CENTS} cents.`,
      },
      { status: 400 },
    );
  }

  const durationDays = Number(body.durationDays);
  if (
    !Number.isFinite(durationDays) ||
    durationDays < 1 ||
    durationDays > AD_DURATION_CAP_HOURS / 24
  ) {
    return NextResponse.json(
      {
        error: "invalid_duration_days",
        detail: `Must be 1..${AD_DURATION_CAP_HOURS / 24} days.`,
      },
      { status: 400 },
    );
  }
  const durationHours = Math.round(durationDays * 24);

  const audienceId =
    typeof body.audienceId === "string" && body.audienceId.trim().length > 0
      ? body.audienceId.trim()
      : null;

  // createAd handles stub-mode short-circuit internally when
  // META_AD_ACCOUNT_ID is unset — same pattern as boostPost.
  // Pass empty strings for adAccountId + pageId in stub mode; createAd
  // ignores them on the stub path. In live mode the env vars must be set.
  const adAccountIdRaw = (process.env.META_AD_ACCOUNT_ID ?? "").trim();
  const adAccountId = adAccountIdRaw.startsWith("act_")
    ? adAccountIdRaw.slice(4)
    : adAccountIdRaw;
  const pageId = (process.env.META_PAGE_ID ?? "").trim();

  const result = await createAd({
    adAccountId,
    pageId,
    externalPostId,
    campaignName,
    objective,
    dailyBudgetCents: Math.round(dailyBudgetCents),
    durationHours,
    audienceId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "unknown_error" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    stubbed: !!result.stubbed,
    campaignId: result.campaignId,
    adsetId: result.adsetId,
    creativeId: result.creativeId,
    adId: result.adId,
  });
}
