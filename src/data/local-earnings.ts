/**
 * Aggregates "money paid to local Port A folks via PAL" across the
 * verticals where PAL routes funds via Stripe Connect (or holds funds
 * for manual payout).
 *
 * Used by the homepage runner tile + /deliver/runners page to show
 * REAL money flowing — honest social proof per Winston rule
 * 2026-04-29: marketing surfaces should use real demand-side metrics
 * + real local-earnings totals, never fabricated leaderboards.
 *
 * Verticals included (where PAL has visibility):
 *   - Delivery runners (delivery_driver_transfers)
 *   - Beach setup vendors (beach_booking_claims with paid_out_at)
 *   - Locals sell-mode vendors (locals_purchases with emails_sent_at)
 *
 * Excluded by design:
 *   - Cart rentals — vendor takes payment off-platform; PAL only
 *     sees the $10/day reservation fee on its side
 *   - Maintenance — vendor charges customer separately for the work
 *
 * Window: this-week, this-month, all-time (CT day boundaries — close
 * enough; sub-day-precision not needed for headline marketing stats).
 */

import { sql } from "@vercel/postgres";

export interface LocalEarnings {
  delivery: {
    weekCents: number;
    monthCents: number;
    allTimeCents: number;
    deliveriesPaidOutWeek: number;
    deliveriesPaidOutAllTime: number;
  };
  beach: {
    weekCents: number;
    monthCents: number;
    allTimeCents: number;
    bookingsPaidOutAllTime: number;
  };
  locals: {
    weekCents: number;
    monthCents: number;
    allTimeCents: number;
    salesAllTime: number;
  };
  totals: {
    weekCents: number;
    monthCents: number;
    allTimeCents: number;
  };
  /** Friendly cold-start hint when totals are tiny */
  isColdStart: boolean;
}

const ZERO: LocalEarnings = {
  delivery: { weekCents: 0, monthCents: 0, allTimeCents: 0, deliveriesPaidOutWeek: 0, deliveriesPaidOutAllTime: 0 },
  beach: { weekCents: 0, monthCents: 0, allTimeCents: 0, bookingsPaidOutAllTime: 0 },
  locals: { weekCents: 0, monthCents: 0, allTimeCents: 0, salesAllTime: 0 },
  totals: { weekCents: 0, monthCents: 0, allTimeCents: 0 },
  isColdStart: true,
};

export async function getLocalEarnings(): Promise<LocalEarnings> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Delivery — runner payouts via Stripe Connect transfers
  let delivery = ZERO.delivery;
  try {
    const [{ rows: w }, { rows: m }, { rows: a }] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_cents)::int, 0) AS sum, COUNT(*)::int AS n
          FROM delivery_driver_transfers WHERE created_at > ${sevenDaysAgo}`,
      sql`SELECT COALESCE(SUM(amount_cents)::int, 0) AS sum
          FROM delivery_driver_transfers WHERE created_at > ${thirtyDaysAgo}`,
      sql`SELECT COALESCE(SUM(amount_cents)::int, 0) AS sum, COUNT(*)::int AS n
          FROM delivery_driver_transfers`,
    ]);
    delivery = {
      weekCents: Number(w[0]?.sum ?? 0),
      monthCents: Number(m[0]?.sum ?? 0),
      allTimeCents: Number(a[0]?.sum ?? 0),
      deliveriesPaidOutWeek: Number(w[0]?.n ?? 0),
      deliveriesPaidOutAllTime: Number(a[0]?.n ?? 0),
    };
  } catch {
    /* table may not exist yet on a fresh deploy — leave at zero */
  }

  // Beach — vendor portion paid out via Stripe Connect (settled bookings)
  let beach = ZERO.beach;
  try {
    const [{ rows: w }, { rows: m }, { rows: a }] = await Promise.all([
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum
          FROM beach_booking_claims WHERE paid_out_at IS NOT NULL AND paid_out_at > ${sevenDaysAgo}`,
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum
          FROM beach_booking_claims WHERE paid_out_at IS NOT NULL AND paid_out_at > ${thirtyDaysAgo}`,
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum, COUNT(*)::int AS n
          FROM beach_booking_claims WHERE paid_out_at IS NOT NULL`,
    ]);
    beach = {
      weekCents: Number(w[0]?.sum ?? 0),
      monthCents: Number(m[0]?.sum ?? 0),
      allTimeCents: Number(a[0]?.sum ?? 0),
      bookingsPaidOutAllTime: Number(a[0]?.n ?? 0),
    };
  } catch {
    /* table may not exist yet — leave at zero */
  }

  // Locals sell-mode — vendor portion of completed purchases
  let locals = ZERO.locals;
  try {
    const [{ rows: w }, { rows: m }, { rows: a }] = await Promise.all([
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum
          FROM locals_purchases WHERE emails_sent_at IS NOT NULL AND emails_sent_at > ${sevenDaysAgo}`,
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum
          FROM locals_purchases WHERE emails_sent_at IS NOT NULL AND emails_sent_at > ${thirtyDaysAgo}`,
      sql`SELECT COALESCE(SUM(vendor_amount_cents)::int, 0) AS sum, COUNT(*)::int AS n
          FROM locals_purchases WHERE emails_sent_at IS NOT NULL`,
    ]);
    locals = {
      weekCents: Number(w[0]?.sum ?? 0),
      monthCents: Number(m[0]?.sum ?? 0),
      allTimeCents: Number(a[0]?.sum ?? 0),
      salesAllTime: Number(a[0]?.n ?? 0),
    };
  } catch {
    /* table may not exist yet — leave at zero */
  }

  const totals = {
    weekCents: delivery.weekCents + beach.weekCents + locals.weekCents,
    monthCents: delivery.monthCents + beach.monthCents + locals.monthCents,
    allTimeCents: delivery.allTimeCents + beach.allTimeCents + locals.allTimeCents,
  };
  const isColdStart = totals.allTimeCents < 10000; // < $100 all-time

  return { delivery, beach, locals, totals, isColdStart };
}

export function fmtUsd(cents: number): string {
  if (cents === 0) return "$0";
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}
