/**
 * Identify an inbound SMS sender as a booking customer.
 *
 * The stranger path labeled EVERY non-roster number "[unknown ...]" —
 * including customers with a booking on file replying to their own
 * confirmations (live case 2026-07-22: a customer's reply to her
 * day-before confirmation surfaced to the operator as
 * "[unknown +1210... → PAL]"). This helper checks the beach + cart
 * booking tables by last-10-digit phone match so those replies carry
 * booking context instead.
 *
 * Most relevant booking wins: latest setup/pickup date across both
 * surfaces (an upcoming booking naturally sorts above old ones).
 * Fail-open: any DB error returns null and the sender stays "unknown".
 */

import { sql } from "@vercel/postgres";
import { getBeachProductLabel } from "@/data/beach-products";

export interface CustomerBookingContext {
  /** First name + last initial, e.g. "Kelsey H." */
  nameDisplay: string;
  /** e.g. "4 Beach Chairs & Shibumi Shade" or "8-passenger cart" */
  what: string;
  /** ISO YYYY-MM-DD of the setup (beach) / pickup (cart), if recorded */
  date: string | null;
  surface: "beach" | "cart";
}

/** "Kelsey Brooks Hall" → "Kelsey H." (same shape as super-admin pings). */
function displayName(full: string | null): string {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export async function findBookingCustomer(
  phoneE164: string,
): Promise<CustomerBookingContext | null> {
  try {
    const digits = phoneE164.replace(/\D/g, "");
    const p10 = digits.length > 10 ? digits.slice(-10) : digits;
    if (p10.length !== 10) return null;

    // Both tables store customer_phone in varying formats — match on the
    // last 10 digits, same rule the unreplied-leads detector uses.
    const [beach, cart] = await Promise.all([
      sql`
        SELECT customer_name, product, setup_date
        FROM beach_booking_claims
        WHERE customer_phone IS NOT NULL
          AND RIGHT(regexp_replace(customer_phone, '\\D', '', 'g'), 10) = ${p10}
        ORDER BY setup_date DESC NULLS LAST
        LIMIT 1
      `,
      sql`
        SELECT customer_name, cart_size, pickup_date
        FROM cart_bookings
        WHERE customer_phone IS NOT NULL
          AND RIGHT(regexp_replace(customer_phone, '\\D', '', 'g'), 10) = ${p10}
        ORDER BY pickup_date DESC NULLS LAST
        LIMIT 1
      `,
    ]);

    const b = beach.rows[0];
    const c = cart.rows[0];
    if (!b && !c) return null;

    // Latest date wins across surfaces (ISO strings compare correctly);
    // a dateless row loses to a dated one.
    const bDate = (b?.setup_date as string) ?? "";
    const cDate = (c?.pickup_date as string) ?? "";
    if (b && (!c || bDate >= cDate)) {
      return {
        nameDisplay: displayName(b.customer_name as string),
        what: getBeachProductLabel((b.product as string) ?? ""),
        date: (b.setup_date as string) ?? null,
        surface: "beach",
      };
    }
    return {
      nameDisplay: displayName(c.customer_name as string),
      what: c.cart_size ? `${c.cart_size}-passenger cart` : "cart rental",
      date: (c.pickup_date as string) ?? null,
      surface: "cart",
    };
  } catch (err) {
    console.error("[customer-lookup] failed (fail-open):", err);
    return null;
  }
}
