/**
 * Beach vendor SMS — fan-out blast on a paid /beach booking, plus
 * the per-event acks (claim won, claim lost, customer-with-vendor).
 *
 * Same pacing pattern as the cart-vendor blast (sequential 800ms gap
 * to stay under AT&T 1.25 mps for A2P 10DLC LOW_VOLUME tier).
 */

import { sendSms } from "./twilioSms";
import {
  beachVendors,
  beachVendorPhone,
  getBlastableBeachVendors,
  type BeachVendor,
} from "@/data/beach-vendors";

export interface BeachLeadInput {
  product: string; // "cabana" | "chairs"
  qty: number;
  setupDateFormatted: string; // e.g. "Sat May 10"
  numDays: number;
  customerName: string;
  // Pull-down friendly short ID — last 6 of session ID — for vendor reference
  shortId: string;
}

function dayWord(n: number): string {
  return n === 1 ? "day" : "days";
}

function productLabel(product: string, qty: number): string {
  if (product === "cabana") {
    return `${qty} cabana${qty === 1 ? "" : "s"}`;
  }
  if (product === "chairs") {
    // /beach defines "chairs" = "Two chairs and a beach umbrella"
    return `${qty} chair-set${qty === 1 ? "" : "s"} (2 chairs + umbrella each)`;
  }
  return `${qty} × ${product}`;
}

/**
 * The lead-blast SMS sent to every active beach vendor when a booking
 * is paid. Block format same as cart vendor lead per Collie revisions
 * 2026-04-29 — line-spaced for fast lock-screen skim.
 */
export function buildBeachLeadSms(input: BeachLeadInput): string {
  const { product, qty, setupDateFormatted, numDays, shortId } = input;
  return [
    `Port A Local: 🏖️ NEW BEACH BOOKING`,
    `${productLabel(product, qty)} for ${setupDateFormatted} (${numDays} ${dayWord(numDays)}).`,
    `Reply CLAIM to take it (first vendor wins).`,
    `Booking ref: ${shortId}`,
    `STOP to opt out.`,
  ].join("\n\n");
}

/**
 * Fan out the lead-blast SMS to every active beach vendor.
 * Returns the count of messages successfully dispatched.
 */
export async function sendBeachLeadBlast(input: BeachLeadInput): Promise<number> {
  const targets = getBlastableBeachVendors();
  if (targets.length === 0) return 0;

  const body = buildBeachLeadSms(input);
  let sent = 0;
  for (const vendor of targets) {
    const phone = beachVendorPhone(vendor);
    if (!phone) continue;
    try {
      await sendSms(phone, body);
      sent++;
    } catch (err) {
      console.error(`[beach-vendor-blast] send failed for ${vendor.slug}:`, err);
    }
    if (sent < targets.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return sent;
}

/** Confirmation SMS to the vendor who won the claim. */
export function buildClaimWonSms(
  vendor: BeachVendor,
  customerName: string,
  customerPhone: string,
  product: string,
  qty: number,
  setupDateFormatted: string,
): string {
  return [
    `Port A Local: ✅ CLAIM CONFIRMED`,
    `${vendor.name}, you've got it: ${productLabel(product, qty)} for ${setupDateFormatted}.`,
    `Customer: ${customerName} - ${customerPhone}`,
    `They'll get a text shortly with your name. Reach out to them to coordinate setup logistics.`,
  ].join("\n\n");
}

/** SMS to the other vendors letting them know it was claimed. */
export function buildClaimLostSms(
  product: string,
  qty: number,
  winnerName: string,
): string {
  return `Port A Local: That ${productLabel(product, qty)} booking just got claimed by ${winnerName}. Thanks for the quick eye - next one's still up for grabs.`;
}

/** SMS to the customer letting them know who's coming. */
export function buildCustomerVendorAssignedSms(
  vendorName: string,
  product: string,
  qty: number,
  setupDateFormatted: string,
): string {
  return [
    `Port A Local: ${vendorName} will set up your ${productLabel(product, qty)} on ${setupDateFormatted}.`,
    `${vendorName} will be in touch before the date with delivery + pickup logistics.`,
    `Questions? Reply to this number or hello@theportalocal.com.`,
  ].join("\n\n");
}

/** Notify everyone after a successful claim. Best-effort; doesn't throw. */
export async function notifyClaimResolution(input: {
  winner: BeachVendor;
  customerName: string;
  customerPhone: string;
  product: string;
  qty: number;
  setupDateFormatted: string;
}): Promise<void> {
  const { winner, customerName, customerPhone, product, qty, setupDateFormatted } = input;

  // 1) Confirm to winner
  const winnerPhone = beachVendorPhone(winner);
  if (winnerPhone) {
    sendSms(
      winnerPhone,
      buildClaimWonSms(winner, customerName, customerPhone, product, qty, setupDateFormatted),
    ).catch((err) => console.error("[beach-vendor-blast] winner-confirm failed:", err));
  }

  // 2) Notify other active vendors
  const others = getBlastableBeachVendors().filter((v) => v.slug !== winner.slug);
  let i = 0;
  for (const v of others) {
    const phone = beachVendorPhone(v);
    if (!phone) continue;
    try {
      await sendSms(phone, buildClaimLostSms(product, qty, winner.name));
    } catch (err) {
      console.error(`[beach-vendor-blast] claim-lost send failed for ${v.slug}:`, err);
    }
    i++;
    if (i < others.length) await new Promise((r) => setTimeout(r, 800));
  }

  // 3) Notify customer with vendor info (consent-gated by /beach form)
  if (customerPhone) {
    sendSms(
      customerPhone,
      buildCustomerVendorAssignedSms(winner.name, product, qty, setupDateFormatted),
    ).catch((err) => console.error("[beach-vendor-blast] customer-notify failed:", err));
  }
}

// Re-export type for convenience
export type { BeachVendor };
