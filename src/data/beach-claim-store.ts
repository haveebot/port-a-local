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
  // Ad attribution columns (added 2026-06-04) — populated from the
  // pal_attrib cookie threaded through Stripe metadata, so every booking
  // carries the campaign that drove it (cost-per-booking reporting).
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS utm_source TEXT`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS utm_medium TEXT`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS utm_campaign TEXT`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS utm_content TEXT`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS fbclid TEXT`;
  // Setup location (the beach spot) — captured from Stripe metadata.deliveryAddress
  // so it's canonical on the booking, not just in Stripe. Added 2026-06-05.
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS setup_location TEXT`;
  // Day-before reminder bookkeeping — sms_consent mirrors the booking opt-in
  // checkbox (so the day-before customer SMS respects consent) + a
  // day_before_sent_at idempotency stamp for the cron. Added 2026-06-05.
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN`;
  await sql`ALTER TABLE beach_booking_claims ADD COLUMN IF NOT EXISTS day_before_sent_at TIMESTAMPTZ`;
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
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  fbclid: string | null;
  setupLocation: string | null;
  smsConsent: boolean | null;
  dayBeforeSentAt: string | null;
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
    utmSource: (row.utm_source as string) ?? null,
    utmMedium: (row.utm_medium as string) ?? null,
    utmCampaign: (row.utm_campaign as string) ?? null,
    utmContent: (row.utm_content as string) ?? null,
    fbclid: (row.fbclid as string) ?? null,
    setupLocation: (row.setup_location as string) ?? null,
    smsConsent: (row.sms_consent as boolean) ?? null,
    dayBeforeSentAt: row.day_before_sent_at
      ? new Date(row.day_before_sent_at as string).toISOString()
      : null,
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
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
  setupLocation?: string;
  smsConsent?: boolean;
}

/**
 * Insert (or upsert) a claim row at blast time. Idempotent on session ID.
 * Existing rows aren't overwritten — we keep the original blast metadata.
 *
 * Returns true when THIS call inserted the row (first confirm for the
 * session), false when the row already existed. Callers use this as the
 * atomic exactly-once gate for confirmation side-effects: a Stripe
 * success-page revisit re-POSTs /api/beach/confirm, and only the call
 * that wins the insert may send SMS/emails/vendor blast (live incident
 * 2026-07-21 — a revisit 18 min later re-texted the customer and
 * re-blasted vendors on an already-claimed booking).
 */
export async function recordBlast(input: RecordBlastInput): Promise<boolean> {
  await ensureSchema();
  const { rowCount } = await sql`
    INSERT INTO beach_booking_claims (
      stripe_session_id, customer_phone, customer_name, product, qty,
      setup_date, num_days, vendor_amount_cents, setup_location, sms_consent,
      utm_source, utm_medium, utm_campaign, utm_content, fbclid
    ) VALUES (
      ${input.stripeSessionId},
      ${input.customerPhone ?? null},
      ${input.customerName ?? null},
      ${input.product ?? null},
      ${input.qty ?? null},
      ${input.setupDate ?? null},
      ${input.numDays ?? null},
      ${input.vendorAmountCents ?? null},
      ${input.setupLocation ?? null},
      ${input.smsConsent ?? null},
      ${input.utmSource ?? null},
      ${input.utmMedium ?? null},
      ${input.utmCampaign ?? null},
      ${input.utmContent ?? null},
      ${input.fbclid ?? null}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
  return (rowCount ?? 0) > 0;
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
 *
 * Freshness guard (2026-07-22): only rows blasted within the last 72h
 * whose setup date hasn't passed are claimable. Without it, a stray
 * CLAIM latches onto weeks-old unclaimed rows — live incident
 * 2026-07-21: a duplicate "Claim" marked a five-week-stale row as
 * claimed, polluting the vendor-owed math. Stale rows now fall through
 * to the existing "no unclaimed beach booking right now" reply.
 */
export async function getMostRecentUnclaimed(): Promise<BeachBookingClaim | null> {
  try {
    await ensureSchema();
    // setup_date is TEXT (ISO "YYYY-MM-DD"); compare as strings, not
    // against a DATE type (same idiom as brons-dashboard).
    const today = new Date().toISOString().slice(0, 10);
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      WHERE claimed_at IS NULL
        AND blasted_at >= NOW() - INTERVAL '72 hours'
        AND (setup_date IS NULL OR setup_date >= ${today})
      ORDER BY blasted_at DESC
      LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Look up a single claim record by Stripe session ID — regardless of
 * whether it's still unclaimed. Used by the inbound CLAIM webhook
 * after a race-lost `attemptClaim` to find out who actually won, so we
 * can decide whether the would-be claimer is a teammate of the winner.
 */
export async function getClaim(
  stripeSessionId: string,
): Promise<BeachBookingClaim | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      WHERE stripe_session_id = ${stripeSessionId}
      LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

export interface BookingsBySourceRow {
  utmSource: string | null;
  utmCampaign: string | null;
  bookings: number;
  vendorRevenueCents: number;
}

/**
 * Bookings grouped by ad source/campaign over the last `sinceDays`. The
 * ground-truth conversion side of cost-per-booking: pair `bookings`
 * against per-campaign ad spend (from /api/wheelhouse/ads/list) to see
 * what each campaign actually costs to produce a paid setup.
 *
 * Rows with null utm_source/utm_campaign are organic/direct or pre-date
 * attribution capture — surfaced as their own bucket, not dropped.
 */
export async function getBookingsBySource(
  sinceDays = 30,
): Promise<BookingsBySourceRow[]> {
  const days = Math.max(1, Math.floor(sinceDays));
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT
        utm_source,
        utm_campaign,
        COUNT(*)::int AS bookings,
        COALESCE(SUM(vendor_amount_cents), 0)::int AS vendor_revenue_cents
      FROM beach_booking_claims
      WHERE blasted_at > NOW() - make_interval(days => ${days})
      GROUP BY utm_source, utm_campaign
      ORDER BY bookings DESC
    `;
    return rows.map((r) => ({
      utmSource: (r.utm_source as string) ?? null,
      utmCampaign: (r.utm_campaign as string) ?? null,
      bookings: r.bookings as number,
      vendorRevenueCents: r.vendor_revenue_cents as number,
    }));
  } catch (err) {
    console.error("[beach-claim-store] getBookingsBySource failed:", err);
    return [];
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

/**
 * Claimed beach bookings whose setup is on `setupDate` (YYYY-MM-DD) and that
 * haven't had their day-before comms sent yet. Drives the day-before cron.
 */
export async function getClaimsForSetupDate(
  setupDate: string,
): Promise<BeachBookingClaim[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM beach_booking_claims
      WHERE setup_date = ${setupDate}
        AND claimed_by_slug IS NOT NULL
        AND day_before_sent_at IS NULL
      ORDER BY blasted_at ASC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[beach-claim-store] getClaimsForSetupDate failed:", err);
    return [];
  }
}

/**
 * Set (or clear, with null) the operator-entered customer note on a booking —
 * post-booking details the customer tells us (arrival time, gate code, "look
 * for the blue tent"). Rendered into every subsequent vendor-facing comm.
 */
export async function setClaimNote(
  stripeSessionId: string,
  note: string | null,
): Promise<boolean> {
  try {
    await ensureSchema();
    const { rowCount } = await sql`
      UPDATE beach_booking_claims
      SET notes = ${note}
      WHERE stripe_session_id = ${stripeSessionId}
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[beach-claim-store] setClaimNote failed:", err);
    return false;
  }
}

/** Stamp a booking's day-before comms as sent (cron idempotency). */
export async function markDayBeforeSent(stripeSessionId: string): Promise<void> {
  try {
    await ensureSchema();
    await sql`
      UPDATE beach_booking_claims
      SET day_before_sent_at = NOW()
      WHERE stripe_session_id = ${stripeSessionId}
    `;
  } catch (err) {
    console.error("[beach-claim-store] markDayBeforeSent failed:", err);
  }
}
