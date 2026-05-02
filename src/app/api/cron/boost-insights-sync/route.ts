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
 * Vercel Cron: boost insights sync
 * Schedule: hourly (configured in vercel.json)
 *
 * For every social post with boost_status='active' and boost_created_at
 * > 1hr ago, pull current insights from Marketing API. Mark 'complete'
 * once boost_created_at is past the configured duration.
 *
 * Auth: Vercel CRON_SECRET bearer.
 */

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("authorization") ?? "";
  return got === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

    // date_preset=today is required — Meta's default returns data:[] for
    // fresh ads. For 24h boosts that span midnight CT, today won't include
    // yesterday's portion, but cron also flips status='complete' soon after
    // duration ends, so the gap is at most one cron tick.
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
