/**
 * SMS Watch List — phone numbers we're actively expecting replies from.
 *
 * Origin: 2026-05-06. Bron Doyle replied to PAL's outbound SMS but the
 * operator phone push (in /api/twilio/sms/inbound) was a fire-and-forget
 * call that Vercel killed before it completed — only the email forward
 * (different code path, completed faster) made it through. The operator
 * never got the notification on their phone.
 *
 * This store solves the *signal* side: when we send outbound to a number
 * we genuinely care about a reply from (a pitch, a follow-up, a question
 * we asked), add it to the watch list. Inbound from a watched number
 * fires an *elevated* operator push — distinct subject prefix, clear
 * context label — so the reply doesn't get lost in the random-stranger
 * stream.
 *
 * The *delivery* side (race condition that lost Bron's push) is fixed
 * separately in the inbound webhook by awaiting the side-effects before
 * returning the TwiML response.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sms_watch_list (
      phone_e164 TEXT PRIMARY KEY,
      context TEXT NOT NULL,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      notify_count INTEGER NOT NULL DEFAULT 0,
      last_notified_at TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS sms_watch_list_expires_idx
    ON sms_watch_list (expires_at)
    WHERE expires_at IS NOT NULL;
  `;
  _schemaReady = true;
}

export interface SmsWatchEntry {
  phoneE164: string;
  context: string;
  addedAt: string;
  expiresAt: string | null;
  notifyCount: number;
  lastNotifiedAt: string | null;
}

/**
 * Add or refresh a watch entry for a phone number.
 *
 * If the number is already on the list, the existing entry's context
 * + expiry get replaced (refresh semantics — re-watching extends the
 * window).
 */
export async function addWatch(
  phoneE164: string,
  context: string,
  ttlHours?: number,
): Promise<void> {
  await ensureSchema();
  const expiresAt = ttlHours
    ? new Date(Date.now() + ttlHours * 3600 * 1000).toISOString()
    : null;
  await sql`
    INSERT INTO sms_watch_list (phone_e164, context, added_at, expires_at)
    VALUES (${phoneE164}, ${context}, NOW(), ${expiresAt})
    ON CONFLICT (phone_e164) DO UPDATE SET
      context = EXCLUDED.context,
      expires_at = EXCLUDED.expires_at,
      added_at = NOW();
  `;
}

/**
 * Check if a phone number has an active watch entry. Returns the entry
 * if it exists and hasn't expired, otherwise null.
 *
 * Auto-cleans expired entries on each call (low overhead — entries are
 * rare and this is the read path that needs them gone).
 */
export async function checkWatch(
  phoneE164: string,
): Promise<SmsWatchEntry | null> {
  await ensureSchema();
  // Best-effort cleanup of stale entries
  await sql`
    DELETE FROM sms_watch_list
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
  `;
  const { rows } = await sql`
    SELECT phone_e164, context, added_at, expires_at, notify_count, last_notified_at
    FROM sms_watch_list
    WHERE phone_e164 = ${phoneE164};
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    phoneE164: r.phone_e164 as string,
    context: r.context as string,
    addedAt: (r.added_at as Date).toISOString(),
    expiresAt: r.expires_at ? (r.expires_at as Date).toISOString() : null,
    notifyCount: r.notify_count as number,
    lastNotifiedAt: r.last_notified_at
      ? (r.last_notified_at as Date).toISOString()
      : null,
  };
}

/** Bump notify_count + last_notified_at when an elevated push fires. */
export async function recordNotification(phoneE164: string): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE sms_watch_list
    SET notify_count = notify_count + 1,
        last_notified_at = NOW()
    WHERE phone_e164 = ${phoneE164};
  `;
}

/** Stop watching a number (explicit removal). */
export async function removeWatch(phoneE164: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM sms_watch_list WHERE phone_e164 = ${phoneE164};`;
}

/** List all current (non-expired) watch entries. For admin UI. */
export async function listActiveWatches(): Promise<SmsWatchEntry[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT phone_e164, context, added_at, expires_at, notify_count, last_notified_at
    FROM sms_watch_list
    WHERE expires_at IS NULL OR expires_at > NOW()
    ORDER BY added_at DESC;
  `;
  return rows.map((r) => ({
    phoneE164: r.phone_e164 as string,
    context: r.context as string,
    addedAt: (r.added_at as Date).toISOString(),
    expiresAt: r.expires_at ? (r.expires_at as Date).toISOString() : null,
    notifyCount: r.notify_count as number,
    lastNotifiedAt: r.last_notified_at
      ? (r.last_notified_at as Date).toISOString()
      : null,
  }));
}
