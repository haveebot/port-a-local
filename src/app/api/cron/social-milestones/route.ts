import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { events, type EventDetails } from "@/data/events";
import {
  queuePost,
  type PostChannel,
  type TriggerType,
} from "@/data/social-post-store";
import {
  eventMilestoneDraft,
  eventTodayDraft,
  eventWrapDraft,
} from "@/lib/socialPostTemplates";
import { startOfTodayCTMs } from "@/lib/eventMilestones";
import { isMetaConfigured } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: event milestone auto-queue
 * Schedule: daily at 13:00 UTC (~8am CDT) — configured in vercel.json
 *
 * For each published event in events.ts, computes 30/14/7/1d/today/wrap
 * fire dates. If a fire date falls inside today's Central-Time day, drafts
 * a milestone post via socialPostTemplates and queues it (FB always; IG if
 * Meta IG is configured). Operator reviews + sends from /wheelhouse/social.
 *
 * Idempotency: queuePost dedups on (trigger_type, trigger_ref, channel) for
 * pending+sent rows, so re-runs in the same day don't double-queue. We also
 * scan for legacy "manual" rows tagged "<kind>:<slug>" so a hand-queued
 * milestone (like the Kite 7d that was stocked manually) isn't duplicated.
 *
 * Auth: Vercel CRON_SECRET bearer.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface MilestonePlan {
  event: EventDetails;
  triggerType: TriggerType;
  fireMs: number;
}

/**
 * Compute every milestone for every published event whose fire time
 * lands inside today's Central-Time day.
 */
function todaysMilestones(): MilestonePlan[] {
  const floor = startOfTodayCTMs();
  const ceil = floor + MS_PER_DAY;
  const out: MilestonePlan[] = [];
  for (const event of events) {
    if (!event.published) continue;
    const start = new Date(event.startISO).getTime();
    const end = new Date(event.endISO).getTime();
    const preDays: Array<[TriggerType, number]> = [
      ["event_milestone_30d", 30],
      ["event_milestone_14d", 14],
      ["event_milestone_7d", 7],
      ["event_milestone_1d", 1],
    ];
    for (const [triggerType, daysBefore] of preDays) {
      const fire = start - daysBefore * MS_PER_DAY;
      if (fire >= floor && fire < ceil) {
        out.push({ event, triggerType, fireMs: fire });
      }
    }
    if (start >= floor && start < ceil) {
      out.push({ event, triggerType: "event_today", fireMs: start });
    }
    const wrapFire = end + MS_PER_DAY;
    if (wrapFire >= floor && wrapFire < ceil) {
      out.push({ event, triggerType: "event_wrap", fireMs: wrapFire });
    }
  }
  return out;
}

/**
 * Loose dedup — true if any pending/sent row exists for this event slug
 * + channel that represents the same milestone, even if it was queued
 * with trigger_type='manual' and a "<kind>:<slug>" trigger_ref tag.
 */
async function alreadyHandled(
  triggerType: TriggerType,
  eventSlug: string,
  channel: PostChannel,
): Promise<boolean> {
  const manualTag = `${triggerType}:${eventSlug}`;
  const result = await sql`
    SELECT 1 FROM social_post_queue
    WHERE channel = ${channel}
      AND status IN ('pending', 'sent')
      AND (
        (trigger_type = ${triggerType} AND trigger_ref = ${eventSlug})
        OR
        (trigger_type = 'manual' AND trigger_ref = ${manualTag})
      )
    LIMIT 1
  `;
  return result.rows.length > 0;
}

function draftFor(plan: MilestonePlan) {
  const { event, triggerType } = plan;
  if (triggerType === "event_today") return eventTodayDraft(event);
  if (triggerType === "event_wrap") return eventWrapDraft(event);
  const daysOut =
    triggerType === "event_milestone_30d"
      ? 30
      : triggerType === "event_milestone_14d"
        ? 14
        : triggerType === "event_milestone_7d"
          ? 7
          : 1;
  return eventMilestoneDraft(event, daysOut as 30 | 14 | 7 | 1);
}

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const meta = isMetaConfigured();
  const channels: PostChannel[] = ["facebook"];
  if (meta.ig) channels.push("instagram");

  const plans = todaysMilestones();
  const results: Array<{
    event: string;
    kind: TriggerType;
    channel: PostChannel;
    status: "queued" | "skipped";
    postId?: number;
    reason?: string;
  }> = [];

  for (const plan of plans) {
    const drafts = draftFor(plan);
    for (const channel of channels) {
      const exists = await alreadyHandled(
        plan.triggerType,
        plan.event.slug,
        channel,
      );
      if (exists) {
        results.push({
          event: plan.event.slug,
          kind: plan.triggerType,
          channel,
          status: "skipped",
          reason: "already-queued-or-sent",
        });
        continue;
      }
      const caption = channel === "facebook" ? drafts.facebook : drafts.instagram;
      const link =
        channel === "facebook"
          ? `https://theportalocal.com/events/${plan.event.slug}`
          : null;
      const post = await queuePost({
        triggerType: plan.triggerType,
        triggerRef: plan.event.slug,
        channel,
        caption,
        linkUrl: link,
        scheduledFor: new Date(plan.fireMs),
      });
      results.push({
        event: plan.event.slug,
        kind: plan.triggerType,
        channel,
        status: "queued",
        postId: post.id,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    today_ct_midnight: new Date(startOfTodayCTMs()).toISOString(),
    plans_found: plans.length,
    queued: results.filter((r) => r.status === "queued").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  });
}
