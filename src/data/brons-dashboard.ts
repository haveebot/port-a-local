/**
 * Bron's team dashboard — scoped data layer (bronsbeach.com).
 *
 * Serves ONLY Bron's own beach-fulfillment data. Never exposes PAL's cut,
 * other vendors' jobs, or the historical rental ledger. Design rules (per
 * operator direction 2026-07-16):
 *
 *  - Payout view shows Bron's OWED DOLLARS only — never PAL's percentage.
 *  - The owed counter STARTS at the agreed opening balance ($1,142) and only
 *    grows with NEW fulfilled work from the agreement date forward. The
 *    historical rental line-items are NOT shown (the $1,142 is agreed flat,
 *    independent of that data — do not itemize or reconcile it here).
 *  - Customer contact (name / phone / exact location) is GATED: withheld until
 *    ~24h before the setup date, so Bron's can't harvest a forward-looking
 *    customer list. Mirrors the cart-vendor 24–48h contact-release rule.
 *  - The Beach Rig product is Tyler's, not Bron's — excluded entirely.
 */

import { sql } from "@vercel/postgres";
import { beachVendors } from "./beach-vendors";

/** Agreed opening balance — everything owed up to the agreement date, flat. */
export const BRONS_OPENING_OWED_CENTS = 114_200; // $1,142.00 (agreed 2026-07-16)
/** Only work on/after this date counts toward the going-forward counter. */
export const BRONS_AGREEMENT_DATE = "2026-07-16";
/** Contact PII unlocks this many hours before setup. */
const CONTACT_GATE_HOURS = 24;
/** Product slug Bron's does NOT run — never shown to them. */
const EXCLUDED_PRODUCT = "beach-rig";

/** The vendor slugs that belong to Bron's crew (team === "brons"). */
const BRONS_SLUGS: string[] = beachVendors
  .filter((v) => v.team === "brons")
  .map((v) => v.slug);

export interface BronsJob {
  bookingId: string;
  setupDate: string | null;
  numDays: number | null;
  product: string | null;
  qty: number | null;
  /** Bron's payout for this job, in cents. */
  payoutCents: number;
  status: "upcoming" | "fulfilled" | "paid";
  /** True once we're inside the 24h window and contact is released. */
  contactUnlocked: boolean;
  /** Null until contactUnlocked — do not surface before the gate opens. */
  customerName: string | null;
  customerPhone: string | null;
  setupLocation: string | null;
}

/** Is the setup within the contact-release window (or already past)? */
function isContactUnlocked(setupDate: string | null): boolean {
  if (!setupDate) return false;
  const setupMs = new Date(`${setupDate}T00:00:00`).getTime();
  if (Number.isNaN(setupMs)) return false;
  return setupMs - Date.now() <= CONTACT_GATE_HOURS * 3_600_000;
}

/**
 * Amount currently owed to Bron's, in cents:
 *   opening balance ($1,142) + forward jobs' payouts not yet paid out.
 * Paid-out forward jobs (paidOutAt set) drop off automatically.
 */
export async function getBronsOwedCents(): Promise<number> {
  const { rows } = await sql`
    SELECT COALESCE(SUM(vendor_amount_cents), 0)::int AS owed
    FROM beach_booking_claims
    WHERE claimed_by_slug = ANY(${BRONS_SLUGS as unknown as string})
      AND product IS DISTINCT FROM ${EXCLUDED_PRODUCT}
      AND setup_date >= ${BRONS_AGREEMENT_DATE}
      AND paid_out_at IS NULL
      AND vendor_amount_cents IS NOT NULL
  `;
  const forwardUnpaid = (rows[0]?.owed as number) ?? 0;
  return BRONS_OPENING_OWED_CENTS + forwardUnpaid;
}

/**
 * Bron's going-forward jobs (agreement date onward). History is never returned.
 * Contact fields are masked until the 24h gate opens.
 */
export async function getBronsJobs(): Promise<BronsJob[]> {
  const { rows } = await sql`
    SELECT stripe_session_id, setup_date, num_days, product, qty,
           vendor_amount_cents, paid_out_at, claimed_at,
           customer_name, customer_phone, setup_location
    FROM beach_booking_claims
    WHERE claimed_by_slug = ANY(${BRONS_SLUGS as unknown as string})
      AND product IS DISTINCT FROM ${EXCLUDED_PRODUCT}
      AND setup_date >= ${BRONS_AGREEMENT_DATE}
    ORDER BY setup_date ASC
  `;

  return rows.map((r): BronsJob => {
    const setupDate = (r.setup_date as string) ?? null;
    const unlocked = isContactUnlocked(setupDate);
    const paidOut = Boolean(r.paid_out_at);
    const claimed = Boolean(r.claimed_at);
    return {
      bookingId: r.stripe_session_id as string,
      setupDate,
      numDays: (r.num_days as number) ?? null,
      product: (r.product as string) ?? null,
      qty: (r.qty as number) ?? null,
      payoutCents: (r.vendor_amount_cents as number) ?? 0,
      status: paidOut ? "paid" : claimed ? "fulfilled" : "upcoming",
      contactUnlocked: unlocked,
      customerName: unlocked ? ((r.customer_name as string) ?? null) : null,
      customerPhone: unlocked ? ((r.customer_phone as string) ?? null) : null,
      setupLocation: unlocked ? ((r.setup_location as string) ?? null) : null,
    };
  });
}
