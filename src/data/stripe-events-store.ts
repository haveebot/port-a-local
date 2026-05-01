/**
 * Tracks Stripe webhook event IDs that have already been processed,
 * ensuring idempotency for webhook handlers.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;

  // Best-effort check: If POSTGRES_URL is not set, we treat the store as non-functional
  // but allow the webhook to proceed without failing.
  if (!process.env.POSTGRES_URL) {
    console.warn("POSTGRES_URL not set. Stripe event store will operate in mock mode.");
    _schemaReady = true;
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS stripe_webhook_events (
      event_id TEXT PRIMARY KEY,
      processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  _schemaReady = true;
}

/**
 * Checks if a given Stripe event ID has already been processed.
 * Returns false if the database connection is unavailable.
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  await ensureSchema();
  if (!process.env.POSTGRES_URL) {
    return false; // Treat as not processed if connection is missing
  }

  const { rows } = await sql.query(
    `SELECT 1 FROM stripe_webhook_events WHERE event_id = $1`,
    [eventId],
  );
  return rows.length > 0;
}

/**
 * Marks a Stripe event ID as processed.
 * Returns void if the database connection is unavailable.
 */
export async function markEventProcessed(eventId: string): Promise<void> {
  await ensureSchema();
  if (!process.env.POSTGRES_URL) {
    return; // Do nothing if connection is missing
  }

  // Use INSERT ... ON CONFLICT DO NOTHING to ensure idempotency on the write itself
  await sql`
    INSERT INTO stripe_webhook_events (event_id)
    VALUES (${eventId})
    ON CONFLICT (event_id) DO NOTHING
  `;
}
