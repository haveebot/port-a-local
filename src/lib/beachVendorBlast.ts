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
import {
  getBeachProduct,
  productSmsLabel,
  addonsSmsSummary,
  type BeachAddonSelection,
} from "@/data/beach-products";

/**
 * Active vendors filtered by per-product routing. If the product specifies
 * a `vendorSlugs` allowlist, only those vendors are returned (intersected
 * with the active+smsCapable filter); otherwise all active vendors.
 */
function vendorsForProduct(productSlug: string): BeachVendor[] {
  const active = getBlastableBeachVendors();
  const spec = getBeachProduct(productSlug);
  if (!spec?.vendorSlugs?.length) return active;
  const allowed = new Set(spec.vendorSlugs);
  return active.filter((v) => allowed.has(v.slug));
}

export interface BeachLeadInput {
  /** Slug from BEACH_PRODUCTS in @/data/beach-products. */
  product: string;
  qty: number;
  /** Optional add-on selection — slug → qty. Empty/missing = no add-ons. */
  addons?: BeachAddonSelection;
  setupDateFormatted: string; // e.g. "Sat May 10"
  numDays: number;
  customerName: string;
  // Pull-down friendly short ID — last 6 of session ID — for vendor reference
  shortId: string;
}

function dayWord(n: number): string {
  return n === 1 ? "day" : "days";
}

/**
 * The lead-blast SMS sent to every active beach vendor when a booking
 * is paid. Block format same as cart vendor lead per Collie revisions
 * 2026-04-29 — line-spaced for fast lock-screen skim.
 */
export function buildBeachLeadSms(input: BeachLeadInput): string {
  const { product, qty, addons, setupDateFormatted, numDays, shortId } = input;
  const addonsLine = addons ? addonsSmsSummary(addons) : "";
  const itemLine = addonsLine
    ? `${productSmsLabel(product, qty)} + ${addonsLine}`
    : productSmsLabel(product, qty);
  return [
    `Port A Local: 🏖️ NEW BEACH BOOKING`,
    `${itemLine} for ${setupDateFormatted} (${numDays} ${dayWord(numDays)}).`,
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
  const targets = vendorsForProduct(input.product);
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

/** Confirmation SMS to the vendor who won the claim.
 *
 * Customer NAME is included for the vendor's reservation listing. Customer
 * contact info is intentionally NOT in this message — PAL is the listed
 * provider and handles all customer comms. The vendor's role ends at the
 * setup; there's no customer-facing vendor identity. */
export function buildClaimWonSms(
  vendor: BeachVendor,
  customerName: string,
  product: string,
  qty: number,
  setupDateFormatted: string,
): string {
  return [
    `Port A Local: ✅ CLAIM CONFIRMED`,
    `${vendor.name}, you've got it: ${productSmsLabel(product, qty)} for ${setupDateFormatted}.`,
    `Booking name: ${customerName}`,
    `Port A Local handles all customer comms — we'll send you setup details before the date. Reply here if you need anything from us.`,
  ].join("\n\n");
}

/** SMS to the other vendors letting them know it was claimed. */
export function buildClaimLostSms(winnerName: string): string {
  return `Port A Local: Claimed for Bron's by ${winnerName}`;
}

/** Notify everyone after a successful claim. Best-effort; doesn't throw.
 *
 * Customer receives NO claim-side SMS — PAL is the listed provider and the
 * customer has no visibility into the internal CLAIM routing. Their only
 * beach-booking touch points are the Stripe-success confirmation (sent at
 * checkout) and the day-before arrival reminder (sent separately). */
export async function notifyClaimResolution(input: {
  winner: BeachVendor;
  customerName: string;
  product: string;
  qty: number;
  setupDateFormatted: string;
}): Promise<void> {
  const { winner, customerName, product, qty, setupDateFormatted } = input;

  // 1) Confirm to winner
  const winnerPhone = beachVendorPhone(winner);
  if (winnerPhone) {
    sendSms(
      winnerPhone,
      buildClaimWonSms(winner, customerName, product, qty, setupDateFormatted),
    ).catch((err) => console.error("[beach-vendor-blast] winner-confirm failed:", err));
  }

  // 2) Notify other vendors who were on the original blast for this product.
  //    Wrong-product vendors (e.g. Bron's on a Beach Rig claim, or Tyler on
  //    a chairs claim) never received the lead, so they shouldn't get the
  //    claim-lost SMS either.
  const others = vendorsForProduct(product).filter((v) => v.slug !== winner.slug);
  let i = 0;
  for (const v of others) {
    const phone = beachVendorPhone(v);
    if (!phone) continue;
    try {
      await sendSms(phone, buildClaimLostSms(winner.name));
    } catch (err) {
      console.error(`[beach-vendor-blast] claim-lost send failed for ${v.slug}:`, err);
    }
    i++;
    if (i < others.length) await new Promise((r) => setTimeout(r, 800));
  }
}

// Re-export type for convenience
export type { BeachVendor };
