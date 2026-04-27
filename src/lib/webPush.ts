/**
 * Web push helper — server-side notification dispatch via the
 * `web-push` library. Used by `dispatchDriversForOrder` to ping
 * on-duty runners' phones in real-time when a new order lands.
 *
 * VAPID key setup (one-time):
 *   1. Run locally: `npx web-push generate-vapid-keys`
 *   2. Copy the OUTPUT to Vercel project env vars:
 *      - VAPID_PUBLIC_KEY  (the public half — also exposed as
 *        NEXT_PUBLIC_VAPID_PUBLIC_KEY for the client subscribe call)
 *      - VAPID_PRIVATE_KEY (server-only)
 *      - VAPID_SUBJECT     (mailto:hello@theportalocal.com — required
 *        contact for push services)
 *   3. Redeploy.
 *
 * The push code below gracefully no-ops when keys are absent — won't
 * break the dispatch flow, just logs a one-line warning. Production
 * deploy without keys still works for SMS+email; push lights up once
 * keys land.
 */

import webpush, { type PushSubscription } from "web-push";

let _configured = false;
let _configWarned = false;

function ensureConfigured(): boolean {
  if (_configured) return true;
  const publicKey = (process.env.VAPID_PUBLIC_KEY ?? "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY ?? "").trim();
  const subject = (process.env.VAPID_SUBJECT ?? "").trim();
  if (!publicKey || !privateKey || !subject) {
    if (!_configWarned) {
      console.warn(
        "[webPush] VAPID keys not set — push notifications disabled. Run `npx web-push generate-vapid-keys` and add VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT to Vercel env.",
      );
      _configWarned = true;
    }
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  _configured = true;
  return true;
}

export interface RunnerPushPayload {
  /** What shows up on the lock screen */
  title: string;
  /** Subtitle / body line */
  body: string;
  /** Click target — usually the order detail page */
  url: string;
  /** Optional tag — same tag replaces prior notification with same tag */
  tag?: string;
  /** Optional dollar emphasis to render as a big icon-style number */
  dollarBadge?: string;
}

export interface PushResult {
  ok: boolean;
  expired: boolean;
  error?: string;
}

/**
 * Send a single push notification. Returns {expired: true} on 404/410
 * from the push service — caller should clear the stale subscription
 * from the DB. All other failures are logged + returned non-throwing.
 */
export async function sendPushToSubscription(
  subscription: object,
  payload: RunnerPushPayload,
): Promise<PushResult> {
  if (!ensureConfigured()) {
    return { ok: false, expired: false, error: "VAPID not configured" };
  }
  try {
    await webpush.sendNotification(
      subscription as PushSubscription,
      JSON.stringify(payload),
      // Push service quirks: TTL ensures push services don't stockpile
      // stale order alerts. 5 min — if a runner doesn't see it in 5 min
      // it's stale anyway since orders auto-claim fast.
      { TTL: 300 },
    );
    return { ok: true, expired: false };
  } catch (err) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : 0;
    if (statusCode === 404 || statusCode === 410) {
      // Subscription is dead — runner uninstalled the PWA, cleared
      // notification permission, or the push endpoint is gone.
      return { ok: false, expired: true };
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[webPush] send failed:`, msg);
    return { ok: false, expired: false, error: msg };
  }
}
