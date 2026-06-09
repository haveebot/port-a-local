/**
 * Cart booking record — one row per paid cart reservation. The cart
 * equivalent of beach_booking_claims: the durable source of truth for
 * "who booked what, for which dates, and which vendor has it."
 *
 * Why this exists: cart data used to be scattered across Stripe (the
 * payment), cart_rental_first_look_pending (vendor-orchestration, NOT a
 * booking record), and the SMS trail (who actually accepted — especially
 * manual reassignments). That made it impossible to send a vendor an
 * update without reconstructing state by hand (see the Ashlee/Joy
 * reassignment). This table fixes that: every reservation lands here, and
 * the assigned vendor is recorded on accept (or manual reassign).
 *
 * Booking ID is the Stripe Checkout session ID — same idempotency key the
 * /rent/confirm route already uses, and the lead_id on the first-look row.
 *
 * Per-vendor scoping: getCartBookingsForVendor() returns ONLY one vendor's
 * bookings. Vendor-facing updates (SMS/email) MUST source from that — a
 * vendor never sees another vendor's bookings, even when dates overlap.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS cart_bookings (
      stripe_session_id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      cart_size TEXT,
      pickup_date TEXT,
      return_date TEXT,
      num_days INTEGER,
      handoff TEXT,
      reservation_fee_cents INTEGER,
      assigned_vendor_slug TEXT,
      assigned_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      fbclid TEXT,
      notes TEXT
    )
  `;
  // Calendar queries hit pickup_date a lot; vendor queries hit the slug.
  await sql`CREATE INDEX IF NOT EXISTS cart_bookings_pickup_idx ON cart_bookings(pickup_date)`;
  await sql`CREATE INDEX IF NOT EXISTS cart_bookings_vendor_idx ON cart_bookings(assigned_vendor_slug)`;
  _schemaReady = true;
}

export type CartBookingStatus = "open" | "assigned" | "cancelled";

export interface CartBooking {
  stripeSessionId: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  cartSize: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  numDays: number | null;
  handoff: string | null;
  reservationFeeCents: number | null;
  assignedVendorSlug: string | null;
  assignedAt: string | null;
  status: CartBookingStatus;
  createdAt: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  fbclid: string | null;
  notes: string | null;
}

function rowToRec(row: Record<string, unknown>): CartBooking {
  return {
    stripeSessionId: row.stripe_session_id as string,
    customerName: (row.customer_name as string) ?? null,
    customerPhone: (row.customer_phone as string) ?? null,
    customerEmail: (row.customer_email as string) ?? null,
    cartSize: (row.cart_size as string) ?? null,
    pickupDate: (row.pickup_date as string) ?? null,
    returnDate: (row.return_date as string) ?? null,
    numDays: row.num_days as number | null,
    handoff: (row.handoff as string) ?? null,
    reservationFeeCents: row.reservation_fee_cents as number | null,
    assignedVendorSlug: (row.assigned_vendor_slug as string) ?? null,
    assignedAt: row.assigned_at
      ? new Date(row.assigned_at as string).toISOString()
      : null,
    status: (row.status as CartBookingStatus) ?? "open",
    createdAt: new Date(row.created_at as string).toISOString(),
    utmSource: (row.utm_source as string) ?? null,
    utmMedium: (row.utm_medium as string) ?? null,
    utmCampaign: (row.utm_campaign as string) ?? null,
    utmContent: (row.utm_content as string) ?? null,
    fbclid: (row.fbclid as string) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

export interface RecordCartBookingInput {
  stripeSessionId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cartSize?: string;
  pickupDate?: string;
  returnDate?: string;
  numDays?: number;
  handoff?: string;
  reservationFeeCents?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
}

/**
 * Insert a cart booking at payment-confirm time. Idempotent on session ID
 * (re-running /rent/confirm doesn't duplicate). Existing rows aren't
 * overwritten — keeps the original booking + any vendor assignment.
 */
export async function recordCartBooking(
  input: RecordCartBookingInput,
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO cart_bookings (
      stripe_session_id, customer_name, customer_phone, customer_email,
      cart_size, pickup_date, return_date, num_days, handoff,
      reservation_fee_cents,
      utm_source, utm_medium, utm_campaign, utm_content, fbclid
    ) VALUES (
      ${input.stripeSessionId},
      ${input.customerName ?? null},
      ${input.customerPhone ?? null},
      ${input.customerEmail ?? null},
      ${input.cartSize ?? null},
      ${input.pickupDate ?? null},
      ${input.returnDate ?? null},
      ${input.numDays ?? null},
      ${input.handoff ?? null},
      ${input.reservationFeeCents ?? null},
      ${input.utmSource ?? null},
      ${input.utmMedium ?? null},
      ${input.utmCampaign ?? null},
      ${input.utmContent ?? null},
      ${input.fbclid ?? null}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
}

/**
 * Assign (or reassign) the vendor that owns a booking. Called when a
 * vendor ACCEPTs the first-look, and by the operator-facing reassign path
 * (the Ashlee→Joy case). Idempotent-ish: always sets the current owner.
 * Creates a minimal row if the booking somehow isn't recorded yet (so a
 * manual reassign never silently no-ops).
 */
export async function assignCartVendor(
  stripeSessionId: string,
  vendorSlug: string,
): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rowCount } = await sql`
    UPDATE cart_bookings
    SET assigned_vendor_slug = ${vendorSlug},
        assigned_at = ${now},
        status = 'assigned'
    WHERE stripe_session_id = ${stripeSessionId}
  `;
  if ((rowCount ?? 0) > 0) return true;
  // No row yet — insert a stub so the assignment is never lost.
  await sql`
    INSERT INTO cart_bookings (stripe_session_id, assigned_vendor_slug, assigned_at, status)
    VALUES (${stripeSessionId}, ${vendorSlug}, ${now}, 'assigned')
    ON CONFLICT (stripe_session_id)
    DO UPDATE SET assigned_vendor_slug = ${vendorSlug}, assigned_at = ${now}, status = 'assigned'
  `;
  return true;
}

/**
 * Set (or clear, with null) the operator-entered customer note on a booking —
 * the cart twin of beach-claim-store.setClaimNote. Rendered into every
 * subsequent vendor-facing comm.
 */
export async function setCartBookingNote(
  stripeSessionId: string,
  note: string | null,
): Promise<boolean> {
  try {
    await ensureSchema();
    const { rowCount } = await sql`
      UPDATE cart_bookings
      SET notes = ${note}
      WHERE stripe_session_id = ${stripeSessionId}
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[cart-booking-store] setCartBookingNote failed:", err);
    return false;
  }
}

/** Single booking by session id. */
export async function getCartBooking(
  stripeSessionId: string,
): Promise<CartBooking | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_bookings WHERE stripe_session_id = ${stripeSessionId} LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

/**
 * All cart bookings (for the unified rentals calendar). Optional
 * upcoming-only filter for the operator view.
 */
export async function listCartBookings(
  opts: { upcomingOnly?: boolean; limit?: number } = {},
): Promise<CartBooking[]> {
  try {
    await ensureSchema();
    const limit = Math.min(opts.limit ?? 200, 500);
    const { rows } = opts.upcomingOnly
      ? await sql`
          SELECT * FROM cart_bookings
          WHERE return_date IS NULL OR return_date >= to_char(NOW() AT TIME ZONE 'America/Chicago', 'YYYY-MM-DD')
          ORDER BY pickup_date ASC NULLS LAST LIMIT ${limit}
        `
      : await sql`
          SELECT * FROM cart_bookings
          ORDER BY pickup_date DESC NULLS LAST LIMIT ${limit}
        `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[cart-booking-store] listCartBookings failed:", err);
    return [];
  }
}

/**
 * ONLY the given vendor's bookings. This is the scoped accessor every
 * vendor-facing update (SMS/email) must use — a vendor never receives
 * another vendor's bookings, even when dates overlap.
 */
export async function getCartBookingsForVendor(
  vendorSlug: string,
  opts: { upcomingOnly?: boolean } = {},
): Promise<CartBooking[]> {
  try {
    await ensureSchema();
    const { rows } = opts.upcomingOnly
      ? await sql`
          SELECT * FROM cart_bookings
          WHERE assigned_vendor_slug = ${vendorSlug}
            AND (return_date IS NULL OR return_date >= to_char(NOW() AT TIME ZONE 'America/Chicago', 'YYYY-MM-DD'))
          ORDER BY pickup_date ASC NULLS LAST
        `
      : await sql`
          SELECT * FROM cart_bookings
          WHERE assigned_vendor_slug = ${vendorSlug}
          ORDER BY pickup_date DESC NULLS LAST
        `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[cart-booking-store] getCartBookingsForVendor failed:", err);
    return [];
  }
}
