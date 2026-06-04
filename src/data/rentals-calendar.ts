/**
 * Unified rentals calendar — reads BOTH revenue streams (beach_booking_claims
 * + cart_bookings) into one shape for the /wheelhouse/rentals view and its
 * vendor-update actions.
 *
 * Per the per-vendor scoping rule: any vendor-facing update is built from a
 * single rental (and therefore a single vendor). The message + phone
 * resolvers here only ever touch one rental's assigned vendor — a vendor
 * never receives another vendor's booking, even on overlapping dates.
 */

import { listRecentClaims } from "@/data/beach-claim-store";
import { listCartBookings } from "@/data/cart-booking-store";
import {
  findBeachVendorBySlug,
  beachVendorPhone,
} from "@/data/beach-vendors";
import { cartVendors, smsPhonesFor } from "@/data/cart-vendors";
import { productSmsLabel } from "@/data/beach-products";
import { formatCustomerDisplay } from "@/lib/superAdminPing";

export type RentalSource = "beach" | "cart";

export interface UnifiedRental {
  source: RentalSource;
  sessionId: string;
  customerName: string | null;
  /** first name + last initial — what a vendor sees */
  customerDisplay: string | null;
  itemLabel: string;
  /** YYYY-MM-DD — the calendar date (beach setup / cart pickup) */
  startDate: string | null;
  /** YYYY-MM-DD — cart return; equals startDate for beach */
  endDate: string | null;
  numDays: number | null;
  /** cart only: "delivery" | "pickup" */
  handoff: string | null;
  vendorSlug: string | null;
  vendorName: string | null;
  status: "assigned" | "open";
}

function cartVendorName(slug: string): string {
  return cartVendors.find((v) => v.slug === slug)?.name ?? slug;
}
function beachVendorName(slug: string): string {
  return findBeachVendorBySlug(slug)?.name ?? slug;
}

/** Pretty date for a YYYY-MM-DD string → "Thursday June 11". */
export function fmtRentalDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** All rentals (beach + cart), sorted by start date ascending. */
export async function listRentals(): Promise<UnifiedRental[]> {
  const [beach, cart] = await Promise.all([
    listRecentClaims(60).catch(() => []),
    listCartBookings({ limit: 120 }).catch(() => []),
  ]);

  const rentals: UnifiedRental[] = [];
  for (const c of beach) {
    rentals.push({
      source: "beach",
      sessionId: c.stripeSessionId,
      customerName: c.customerName,
      customerDisplay: formatCustomerDisplay(c.customerName) ?? c.customerName,
      itemLabel: c.product ? productSmsLabel(c.product, c.qty ?? 1) : "Beach setup",
      startDate: c.setupDate,
      endDate: c.setupDate,
      numDays: c.numDays,
      handoff: null,
      vendorSlug: c.claimedBySlug,
      vendorName: c.claimedBySlug ? beachVendorName(c.claimedBySlug) : null,
      status: c.claimedBySlug ? "assigned" : "open",
    });
  }
  for (const b of cart) {
    rentals.push({
      source: "cart",
      sessionId: b.stripeSessionId,
      customerName: b.customerName,
      customerDisplay: formatCustomerDisplay(b.customerName) ?? b.customerName,
      itemLabel: b.cartSize ? `${b.cartSize}-Passenger Golf Cart` : "Golf cart",
      startDate: b.pickupDate,
      endDate: b.returnDate,
      numDays: b.numDays,
      handoff: b.handoff,
      vendorSlug: b.assignedVendorSlug,
      vendorName: b.assignedVendorSlug ? cartVendorName(b.assignedVendorSlug) : null,
      status: b.assignedVendorSlug ? "assigned" : "open",
    });
  }

  rentals.sort((a, b) =>
    (a.startDate ?? "9999-99-99").localeCompare(b.startDate ?? "9999-99-99"),
  );
  return rentals;
}

/** Resolve the assigned vendor's SMS-capable phone(s) for ONE rental. */
export function vendorPhonesForRental(r: UnifiedRental): string[] {
  if (!r.vendorSlug) return [];
  if (r.source === "beach") {
    const v = findBeachVendorBySlug(r.vendorSlug);
    const phone = v ? beachVendorPhone(v) : "";
    return phone ? [phone] : [];
  }
  const v = cartVendors.find((cv) => cv.slug === r.vendorSlug);
  return v ? smsPhonesFor(v) : [];
}

/** Build the vendor-facing update SMS for ONE rental (scoped to its vendor). */
export function buildVendorUpdateSms(r: UnifiedRental): string {
  const lines: string[] = [
    `Port A Local: 📋 Booking update — ${r.itemLabel}`,
    `Booking name: ${r.customerDisplay ?? "Customer"}`,
  ];
  if (r.source === "cart") {
    lines.push(`Date: ${fmtRentalDate(r.startDate)}`);
    if (r.endDate && r.endDate !== r.startDate) {
      lines.push(`Return: ${fmtRentalDate(r.endDate)}`);
    }
    if (r.handoff) {
      lines.push(`Method: Customer chose ${r.handoff} ${r.handoff === "pickup" ? "at your shop" : "to their address"}`);
    }
    lines.push(
      `We'll confirm the reservation with you 24–48 hours before the trip — PAL handles all customer comms until then. Reply here with any questions.`,
    );
  } else {
    lines.push(`Setup: ${fmtRentalDate(r.startDate)}`);
    lines.push(
      `We'll send setup details before the date — PAL handles all customer comms until then. Reply here with any questions.`,
    );
  }
  return lines.join("\n\n");
}
