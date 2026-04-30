/**
 * Beach booking claim store — tracks which vendor claimed each /beach
 * booking. Atomic-claim semantics so a SMS race between vendors
 * resolves cleanly: first INSERT (or first UPDATE with WHERE
 * claimed_by IS NULL) wins.
 *
 * Booking ID is the Stripe Checkout session ID (matches what the
 * /beach/confirm route already uses for idempotency on the email
 * cascade).
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS beach_booking_claims (
      stripe_session_id TEXT PRIMARY KEY,
      claimed_by_slug TEXT,
      claimed_at TIMESTAMPTZ,
      blasted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      customer_phone TEXT,
      customer_name TEXT,
      product TEXT,
      qty INTEGER,
      setup_date TEXT,
      num_days INTEGER,
      notes TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS beach_claims_unclaimed_idx ON beach_booking_claims(claimed_at) WHERE claimed_at IS NULL`;
  // Payout tracking columns (idempotent ALTERs — added 2026-04-29)
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS paid_out_at TIMESTAMPTZ`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS transfer_id TEXT`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS vendor_amount_cents INTEGER`;
  _schemaReady = true;
}

export interface BeachBookingClaim {
  stripeSessionId: string;
  claimedBySlug: string | null;
  claimedAt: string | null;
  blastedAt: string;
  customerPhone: string | null;
  customerName: string | null;
  product: string | null;
  qty: number | null;
  setupDate: string | null;
  numDays: number | null;
  notes: string | null;
  paidOutAt: string | null;
  transferId: string | null;
  vendorAmountCents: number | null;
}

function rowToRec(row: Record<string, unknown>): BeachBookingClaim {
  return {
    stripeSessionId: row.stripe_session_id as string,
    claimedBySlug: (row.claimed_by_slug as string) ?? null,
    claimedAt: row.claimed_at
      ? new Date(row.claimed_at as string).toISOString()
      : null,
    blastedAt: new Date(row.blasted_at as string).toISOString(),
    customerPhone: (row.customer_phone as string) ?? null,
    customerName: (row.customer_name as string) ?? null,
    product: (row.product as string) ?? null,
    qty: row.qty as number | null,
    setupDate: (row.setup_date as string) ?? null,
    numDays: row.num_days as number | null,
    notes: (row.notes as string) ?? null,
    paidOutAt: row.paid_out_at
      ? new Date(row.paid_out_at as string).toISOString()
      : null,
    transferId: (row.transfer_id as string) ?? null,
    vendorAmountCents: row.vendor_amount_cents as number | null,
  };
}

export interface RecordBlastInput {
  stripeSessionId: string;
  customerPhone?: string;
  customerName?: string;
  product?: string;
  qty?: number;
  setupDate?: string;
  numDays?: number;
  vendorAmountCents?: number;
}

/**
 * Insert (or upsert) a claim row at blast time. Idempotent on session ID.
 * Existing rows aren't overwritten — we keep the original blast metadata.
 */
export async function recordBlast(input: RecordBlastInput): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO beach_booking_claims (
      stripe_session_id, customer_phone, customer_name, product, qty,
      setup_date, num_days, vendor_amount_cents
    ) VALUES (
      ${input.stripeSessionId},
      ${input.customerPhone ?? null},
      ${input.customerName ?? null},
      ${input.product ?? null},
      ${input.qty ?? null},
      ${input.setupDate ?? null},
      ${input.numDays ?? null},
      ${input.vendorAmountCents ?? null}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
}

/**
 * Mark a claim as paid out — called after a successful Stripe transfer.
 * Idempotent (will not double-mark if paid_out_at is already set).
 */
export async function markBeachPaidOut(
  stripeSessionId: string,
  transferId: string,
): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rowCount } = await sql`
    UPDATE beach_booking_claims
    SET paid_out_at = ${now},
        transfer_id = ${transferId}
    WHERE stripe_session_id = ${stripeSessionId}
      AND paid_out_at IS NULL
  `;
  return (rowCount ?? 0) > 0;
}

/**
 * Claims that are eligible for auto-payout: claimed by a vendor, not
 * yet paid out, and the 72hr-before-setup refund window has passed
 * (so the booking is non-refundable and PAL can safely transfer).
 *
 * Setup date is stored as YYYY-MM-DD (no timezone). We treat the
 * setup-date as midnight CT (the local timezone) — a booking on
 * 2026-05-09 has a refund cutoff at 2026-05-06 00:00 CT.
 */
export async function listClaimsReadyForPayout(): Promise<BeachBookingClaim[]> {
  try {
    await ensureSchema();
    // 72hr-before-setup-date midnight CT. We use a SQL expression so the
    // cron's clock and the DB's clock agree, and so we can compare cleanly.
    // setup_date format = YYYY-MM-DD — interpret as midnight America/Chicago.
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      WHERE claimed_at IS NOT NULL
        AND paid_out_at IS NULL
        AND vendor_amount_cents IS NOT NULL
        AND vendor_amount_cents > 0
        AND setup_date IS NOT NULL
        AND (setup_date::date AT TIME ZONE 'America/Chicago') - INTERVAL '72 hours' <= NOW()
      ORDER BY blasted_at ASC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[beach-claim-store] listClaimsReadyForPayout failed:", err);
    return [];
  }
}

/**
 * Atomic claim attempt. Returns the record on win (with vendorSlug set);
 * returns null if the booking was already claimed by another vendor.
 *
 * UPDATE ... WHERE claimed_at IS NULL ensures only one vendor wins
 * even under simultaneous SMS race.
 */
export async function attemptClaim(
  stripeSessionId: string,
  vendorSlug: string,
): Promise<BeachBookingClaim | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE beach_booking_claims
    SET claimed_by_slug = ${vendorSlug},
        claimed_at = ${now}
    WHERE stripe_session_id = ${stripeSessionId}
      AND claimed_at IS NULL
  `;
  // Re-read to confirm who actually won (might be us, might be a racer
  // who landed in the same millisecond and won the row-lock).
  const { rows } = await sql`
    SELECT * FROM beach_booking_claims WHERE stripe_session_id = ${stripeSessionId} LIMIT 1
  `;
  const rec = rows[0] ? rowToRec(rows[0]) : null;
  if (rec && rec.claimedBySlug === vendorSlug) return rec;
  return null;
}

/**
 * Most recent UNCLAIMED beach booking — returned to a vendor's CLAIM
 * SMS so we know which booking they're claiming. We use most-recent
 * because the assumption is the vendor's CLAIM follows the most recent
 * blast. Multiple unclaimed bookings is a real edge case; for v1 the
 * vendor would need to specify which one (future: include booking
 * shortcode in the blast SMS).
 */
export async function getMostRecentUnclaimed(): Promise<BeachBookingClaim | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      WHERE claimed_at IS NULL
      ORDER BY blasted_at DESC
      LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Recent claims (claimed or unclaimed) for the admin tool.
 */
export async function listRecentClaims(limit = 30): Promise<BeachBookingClaim[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      ORDER BY blasted_at DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToRec);
  } catch {
    return [];
  }
}
