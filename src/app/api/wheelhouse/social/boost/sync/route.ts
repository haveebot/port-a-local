import { NextRequest, NextResponse } from "next/server";
import {
  getActiveBoosts,
  markBoostInsights,
  markBoostFailed,
} from "@/data/social-post-store";
import { fetchBoostInsights, isBoostConfigured } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Manual boost-insights sync — same logic as the hourly cron, but bearer-
 * gated through the Wheelhouse middleware so an operator can trigger an
 * immediate refresh from the UI instead of waiting for the next :30 tick.
 *
 *   POST /api/wheelhouse/social/boost/sync
 *
 * Returns the same structured payload as the cron for parity. Lets us see
 * fresh insights the moment a boost spins up — important when iterating on
 * targeting/creative/budget and you want the feedback loop tight.
 *
 * Auth: Wheelhouse middleware (cookie/bearer).
 */
export async function POST(_req: NextRequest) {
  const config = isBoostConfigured();
  if (!config.ok) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: config.reason,
    });
  }

  const durationHours = Number(process.env.META_BOOST_DURATION_HOURS ?? "24");
  const completionMs = durationHours * 60 * 60 * 1000;

  const boosts = await getActiveBoosts();
  const results: {
    id: number;
    adId: string | null;
    status: "synced" | "completed" | "error";
    error?: string;
    insights?: Record<string, unknown>;
  }[] = [];

  for (const post of boosts) {
    if (!post.boostAdId) continue;

    const result = await fetchBoostInsights(post.boostAdId, "today");
    if (!result.ok || !result.insights) {
      await markBoostFailed(
        post.id,
        result.error ?? "insights fetch failed",
      );
      results.push({
        id: post.id,
        adId: post.boostAdId,
        status: "error",
        error: result.error,
      });
      continue;
    }

    const ageMs = post.boostCreatedAt
      ? Date.now() - new Date(post.boostCreatedAt).getTime()
      : 0;
    const isComplete = ageMs >= completionMs;

    await markBoostInsights({
      id: post.id,
      status: isComplete ? "complete" : "active",
      insights: result.insights as unknown as Record<string, unknown>,
      spendCents: result.insights.spendCents,
    });

    results.push({
      id: post.id,
      adId: post.boostAdId,
      status: isComplete ? "completed" : "synced",
      insights: result.insights as unknown as Record<string, unknown>,
    });
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    completed: results.filter((r) => r.status === "completed").length,
    synced: results.filter((r) => r.status === "synced").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  });
}
