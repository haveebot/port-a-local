/**
 * Tracks Twilio Message SIDs that the insider-SMS watcher has already
 * processed, so the cron poller doesn't re-fire push notifications
 * each minute when an old message is still in the recent-history window.
 *
 * Light Postgres usage — one row per processed SID. Periodic cleanup
 * (delete >7 days) keeps the table small but is optional; SIDs are
 * cheap and the index is small.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS insider_sms_seen (
      message_sid TEXT PRIMARY KEY,
      from_phone TEXT,
      seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS insider_sms_seen_at_idx ON insider_sms_seen(seen_at DESC)`;
  _schemaReady = true;
}

/**
 * Returns the subset of input SIDs that have NOT been seen yet.
 * Single round-trip via VALUES + LEFT JOIN to keep the cron tight.
 */
export async function filterUnseen(sids: string[]): Promise<string[]> {
  if (sids.length === 0) return [];
  await ensureSchema();
  const placeholders = sids.map((_, i) => `($${i + 1})`).join(",");
  const { rows } = await sql.query(
    `
    WITH inputs(message_sid) AS (VALUES ${placeholders})
    SELECT inputs.message_sid
    FROM inputs
    LEFT JOIN insider_sms_seen s USING (message_sid)
    WHERE s.message_sid IS NULL
    `,
    sids,
  );
  return rows.map((r) => r.message_sid as string);
}

/** Mark these SIDs as processed. */
export async function markSeen(sids: Array<{ sid: string; from: string }>): Promise<void> {
  if (sids.length === 0) return;
  await ensureSchema();
  for (const { sid, from } of sids) {
    await sql`
      INSERT INTO insider_sms_seen (message_sid, from_phone)
      VALUES (${sid}, ${from})
      ON CONFLICT (message_sid) DO NOTHING
    `;
  }
}
