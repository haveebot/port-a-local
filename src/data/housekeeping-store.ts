/**
 * PAL Housekeeping — booking storage + helpers.
 *
 * Customer books a cleaning at $100/hr (1-hour min, ~1 hr per 1000 sqft).
 * PAL takes the payment via Stripe Checkout, fires an admin email, and
 * (v1) Winston manually coordinates with the cleaning team. (v2) will
 * blast to a marketplace of local cleaners — Stripe Connect payouts,
 * claim-first-wins, same shape as the cart-rental marketplace.
 *
 * Brand placeholder: "Local Girls Cleaning" (a PAL-owned shell entity).
 * Marked for Collie review on the public surfaces. Easy to swap when
 * brand-locked.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS housekeeping_bookings (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      property_address TEXT NOT NULL,
      property_sqft INTEGER NOT NULL,
      estimated_hours NUMERIC(4,2) NOT NULL,
      service_tier TEXT NOT NULL DEFAULT 'standard',
      notes TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      total_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed',
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      paid_at TIMESTAMPTZ,
      cleaner_id TEXT,
      dispatched_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  _schemaReady = true;
}

export type BookingStatus =
  | "placed"
  | "paid"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "canceled";

export interface HousekeepingBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  propertySqft: number;
  estimatedHours: number;
  serviceTier: "standard" | "deep" | "move-out";
  notes: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  totalCents: number;
  status: BookingStatus;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  cleanerId: string | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  placedAt: string;
}

function rowToBooking(row: Record<string, unknown>): HousekeepingBooking {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string,
    propertyAddress: row.property_address as string,
    propertySqft: Number(row.property_sqft),
    estimatedHours: Number(row.estimated_hours),
    serviceTier: row.service_tier as "standard" | "deep" | "move-out",
    notes: (row.notes as string) ?? null,
    preferredDate: (row.preferred_date as string) ?? null,
    preferredTime: (row.preferred_time as string) ?? null,
    totalCents: Number(row.total_cents),
    status: row.status as BookingStatus,
    stripeSessionId: (row.stripe_session_id as string) ?? null,
    stripePaymentIntentId: (row.stripe_payment_intent_id as string) ?? null,
    paidAt: row.paid_at
      ? new Date(row.paid_at as string).toISOString()
      : null,
    cleanerId: (row.cleaner_id as string) ?? null,
    dispatchedAt: row.dispatched_at
      ? new Date(row.dispatched_at as string).toISOString()
      : null,
    completedAt: row.completed_at
      ? new Date(row.completed_at as string).toISOString()
      : null,
    placedAt: new Date(row.placed_at as string).toISOString(),
  };
}

export interface CreateBookingInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  propertySqft: number;
  estimatedHours: number;
  serviceTier?: "standard" | "deep" | "move-out";
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  totalCents: number;
}

function newBookingId(): string {
  return `hk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createHousekeepingBooking(
  input: CreateBookingInput,
): Promise<HousekeepingBooking> {
  await ensureSchema();
  const id = newBookingId();
  await sql`
    INSERT INTO housekeeping_bookings (
      id, customer_name, customer_phone, customer_email,
      property_address, property_sqft, estimated_hours,
      service_tier, notes, preferred_date, preferred_time,
      total_cents
    ) VALUES (
      ${id},
      ${input.customerName},
      ${input.customerPhone},
      ${input.customerEmail},
      ${input.propertyAddress},
      ${input.propertySqft},
      ${input.estimatedHours},
      ${input.serviceTier ?? "standard"},
      ${input.notes ?? null},
      ${input.preferredDate ?? null},
      ${input.preferredTime ?? null},
      ${input.totalCents}
    )
  `;
  const booking = await getHousekeepingBooking(id);
  if (!booking) throw new Error("Booking vanished after insert");
  return booking;
}

export async function getHousekeepingBooking(
  id: string,
): Promise<HousekeepingBooking | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM housekeeping_bookings WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

export async function setHousekeepingStripeSession(
  id: string,
  sessionId: string,
): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE housekeeping_bookings
    SET stripe_session_id = ${sessionId}
    WHERE id = ${id}
  `;
}

export async function markHousekeepingPaid(
  id: string,
  paymentIntentId: string,
): Promise<HousekeepingBooking | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE housekeeping_bookings
    SET status = 'paid',
        stripe_payment_intent_id = ${paymentIntentId},
        paid_at = ${now}
    WHERE id = ${id} AND status = 'placed'
  `;
  return getHousekeepingBooking(id);
}

/* -------------------- Pricing -------------------- */

export const HOUSEKEEPING_HOURLY_RATE_CENTS = 10000; // $100/hr
export const HOUSEKEEPING_MIN_HOURS = 1;
export const HOUSEKEEPING_SQFT_PER_HOUR = 1000;

/**
 * Calculate cleaning hours from sqft.
 *   - 1-hour minimum
 *   - 1 hour per 1000 sqft, rounded up to nearest half-hour
 *
 * Returns hours as a number with .5 increments (1, 1.5, 2, 2.5, ...).
 */
export function estimateCleaningHours(sqft: number): number {
  const raw = sqft / HOUSEKEEPING_SQFT_PER_HOUR;
  // Round up to nearest 0.5
  const rounded = Math.ceil(raw * 2) / 2;
  return Math.max(HOUSEKEEPING_MIN_HOURS, rounded);
}

export function calculateHousekeepingTotalCents(hours: number): number {
  return Math.round(hours * HOUSEKEEPING_HOURLY_RATE_CENTS);
}

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
