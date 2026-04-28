/**
 * Wheelhouse → push notifications.
 *
 * Phase 1 (this file): when a thread transitions into
 * `awaiting:<participant>`, fire an email notification to that
 * participant so they don't have to poll via the orient command.
 * Email is the durable channel — works without Twilio A2P clearance,
 * lands in a readable inbox, doesn't get rate-limited like SMS.
 *
 * Phase 2 (later): SMS via Twilio for high-priority threads (subset
 * of participants opt in by adding their phone to env). Web push for
 * subscribers with the PAL PWA installed.
 *
 * Participant ID → email mapping is config-driven via env vars so
 * we can extend without code changes:
 *
 *   WHEELHOUSE_NOTIFY_WINSTON     = winstonciv@gmail.com
 *   WHEELHOUSE_NOTIFY_COLLIE      = collie.breah@gmail.com
 *   WHEELHOUSE_NOTIFY_NICK        = nickbmerrill@gmail.com
 *   WHEELHOUSE_NOTIFY_WINSTON_CLAUDE = admin@theportalocal.com
 *   WHEELHOUSE_NOTIFY_COLLIE_CLAUDE  = admin@theportalocal.com
 *   WHEELHOUSE_NOTIFY_NICK_CLAUDE    = admin@theportalocal.com
 *
 * Defaults below cover the standard PAL roster; env override wins
 * if set, env-empty disables push for that participant (silent no-op).
 */

import type { Thread } from "@/data/wheelhouse-types";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

const DEFAULT_NOTIFY: Record<string, string> = {
  winston: "winstonciv@gmail.com",
  collie: "collie.breah@gmail.com",
  nick: "nickbmerrill@gmail.com",
  "winston-claude": "admin@theportalocal.com",
  "collie-claude": "admin@theportalocal.com",
  "nick-claude": "admin@theportalocal.com",
};

function emailForParticipant(participantId: string): string | null {
  const envKey = `WHEELHOUSE_NOTIFY_${participantId.toUpperCase().replace(/-/g, "_")}`;
  const envVal = process.env[envKey];
  if (envVal !== undefined) {
    // Empty string = explicit opt-out
    return envVal.trim() || null;
  }
  return DEFAULT_NOTIFY[participantId] ?? null;
}

/**
 * Given a thread that just transitioned into a new state, fire the
 * appropriate push if the new state is awaiting:<somebody>.
 *
 * Idempotent + defensive: any error logged + swallowed; a failed
 * push must NEVER block the actual transition or the request that
 * triggered it.
 */
export async function pushOnThreadTransition(
  thread: Thread | null,
  oldState?: string,
): Promise<void> {
  try {
    if (!thread) return;
    const state = thread.state;
    if (typeof state !== "string" || !state.startsWith("awaiting:")) return;
    if (oldState === state) return;

    const participantId = state.slice("awaiting:".length);
    if (!participantId) return;

    // Don't notify a Claude variant of itself — Claude pulls via
    // orient on the next turn anyway. (Email lands in admin@ but
    // it's noise in the inbox during active sessions.)
    // ...actually keep this enabled; Claude reading admin@ is exactly
    // how this becomes useful. If volume is overwhelming, set
    // WHEELHOUSE_NOTIFY_<CLAUDE_ID>= (empty) to opt out.

    const recipient = emailForParticipant(participantId);
    if (!recipient) {
      console.warn(
        `[wheelhouse push] no email mapping for participant '${participantId}' — skip`,
      );
      return;
    }

    await sendAwaitingEmail({
      recipient,
      participantId,
      thread,
    });
  } catch (err) {
    console.error("[wheelhouse push] failed:", err);
  }
}

interface AwaitingEmailInput {
  recipient: string;
  participantId: string;
  thread: Thread;
}

async function sendAwaitingEmail(i: AwaitingEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[wheelhouse push] RESEND_API_KEY missing — skip");
    return;
  }
  const threadUrl = `${APP_URL}/wheelhouse/${encodeURIComponent(i.thread.id)}`;
  const subject = `[Wheelhouse · awaiting you] ${i.thread.title}`;
  const tags = Array.isArray(i.thread.tags)
    ? (i.thread.tags as string[]).filter(Boolean).slice(0, 6).join(" · ")
    : "";

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.55; max-width: 560px;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        The Wheelhouse · awaiting ${escapeHtml(i.participantId)}
      </p>
      <h2 style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 22px;">${escapeHtml(i.thread.title)}</h2>
      ${tags ? `<p style="margin: 0 0 16px; font-size: 12px; color: #5b4d3a; font-family: monospace;">${escapeHtml(tags)}</p>` : ""}
      <p style="margin: 0 0 20px; font-size: 14px;">
        A thread in the Wheelhouse just flipped action onto you. Open the thread to see the latest message and decide what's next.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${threadUrl}" style="display:inline-block; padding:12px 22px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:14px;">
          Open thread →
        </a>
      </p>
      <p style="font-size: 11px; color: #888; margin: 0;">
        — The Port A Local · Wheelhouse push
      </p>
      <p style="font-size: 10px; color: #aaa; margin: 8px 0 0;">
        Thread ID: <code>${escapeHtml(i.thread.id)}</code>
      </p>
    </div>
  `;
  const text =
    `[Wheelhouse · awaiting ${i.participantId}] ${i.thread.title}\n\n` +
    (tags ? `Tags: ${tags}\n\n` : "") +
    `A Wheelhouse thread just flipped action onto you.\n\n` +
    `Open: ${threadUrl}\n\n` +
    `Thread ID: ${i.thread.id}\n\n` +
    `— The Port A Local · Wheelhouse push`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Wheelhouse <bookings@theportalocal.com>",
        to: [i.recipient],
        reply_to: "hello@theportalocal.com",
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    console.error("[wheelhouse push] email failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
