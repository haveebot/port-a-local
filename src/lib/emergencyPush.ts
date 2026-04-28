/**
 * Emergency event push fan-out.
 *
 * One topic for the whole island: customer-topic / "emergencies".
 * Anyone who taps "Enable emergency alerts" on /emergency subscribes
 * to that single topic — they get pushed:
 *
 *   - on every newly created event (kind = weather, evacuation,
 *     road-closure, water-advisory, fire, general)
 *   - on every running update posted to an active or watching event
 *
 * No tier filtering in v1 — admin posts what matters; subscribers
 * trust PAL's editorial bar. If push fatigue becomes an issue, we
 * can add severity-gating (only critical pushes through, info
 * stays in-app) without breaking the existing subscription contract.
 *
 * Defensive throughout: every send wrapped, expired subs auto-pruned,
 * never throws back to the calling admin route. A push failure must
 * NEVER block an emergency event from being recorded.
 */

import {
  deleteSubscription,
  getSubscriptionsByKind,
  markPushed,
} from "@/data/push-subscriptions-store";
import type {
  EmergencyEvent,
  EmergencyUpdate,
} from "@/data/emergency-store";
import { sendPushToSubscription } from "@/lib/webPush";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

const TOPIC_ID = "emergencies";

/** Fan out a payload to every emergency-topic subscriber. */
async function fanOut(payload: {
  title: string;
  body: string;
  url: string;
  tag: string;
}): Promise<void> {
  try {
    const subs = await getSubscriptionsByKind("customer-topic");
    // Filter to the emergency topic — getSubscriptionsByKind returns
    // every customer-topic subscription regardless of subscriber_id.
    const targetSubs = subs.filter((s) => s.subscriberId === TOPIC_ID);
    if (targetSubs.length === 0) return;

    await Promise.all(
      targetSubs.map(async (sub) => {
        try {
          const subObj = JSON.parse(sub.subscriptionJson);
          const result = await sendPushToSubscription(subObj, payload);
          if (result.expired) {
            await deleteSubscription(sub.id);
          } else if (result.ok) {
            await markPushed(sub.id);
          }
        } catch (err) {
          console.error(
            `[emergency push] failed for sub ${sub.id}:`,
            err,
          );
        }
      }),
    );
  } catch (err) {
    console.error("[emergency push] fan-out failed:", err);
  }
}

/** Fired when a new event is created. */
export async function pushEmergencyEvent(
  event: EmergencyEvent,
): Promise<void> {
  const url = `${APP_URL}/emergency/${encodeURIComponent(event.slug)}`;
  const sevPrefix =
    event.severity === "critical"
      ? "🚨 Critical"
      : event.severity === "warning"
        ? "⚠️ Warning"
        : "ℹ️ Heads-up";
  await fanOut({
    title: `${sevPrefix} · ${event.title}`,
    body: event.summary.slice(0, 180),
    url,
    tag: `emergency-${event.id}`,
  });
}

/** Fired when an update is posted to an existing event. */
export async function pushEmergencyUpdate(
  event: EmergencyEvent,
  update: EmergencyUpdate,
): Promise<void> {
  // Don't push updates on resolved events — those are usually
  // post-mortem cleanup, not actionable info.
  if (event.status === "resolved") return;
  const url = `${APP_URL}/emergency/${encodeURIComponent(event.slug)}`;
  const heading = update.title?.trim() || `New update · ${event.title}`;
  await fanOut({
    title: heading,
    body: update.body.slice(0, 180),
    url,
    tag: `emergency-${event.id}`, // same tag as the event = replaces stale
  });
}
