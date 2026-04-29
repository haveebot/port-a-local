/**
 * Cart-vendor SMS blast — outbound helpers for the new-lead fan-out
 * and the opt-in invitation flow.
 *
 * The campaign C2KO2MB at TCR is registered for customer SMS; vendor
 * SMS is handled as B2B with explicit per-vendor opt-in (see
 * cart-vendor-sms-store.ts). Twilio still routes B2B traffic through
 * the same Messaging Service — verified A2P 10DLC sending — so
 * deliverability is the same as customer SMS.
 *
 * Both message types use the same Messaging Service SID and end with
 * STOP keyword for compliance.
 */

import { sendSms } from "./twilioSms";
import { getOptedInSlugs } from "@/data/cart-vendor-sms-store";
import { cartVendors, smsPhoneFor } from "@/data/cart-vendors";

/**
 * The opt-in invitation. One-shot SMS asking a vendor to join the
 * SMS blast. Sent from the Wheelhouse admin tool, one vendor at a time.
 */
export function buildOptInInviteSms(vendorName: string): string {
  return [
    `Port A Local: Hi ${vendorName} — this is Winston with Port A Local (theportalocal.com).`,
    `We blast cart-rental leads to local cart cos when a customer books on PAL — first to claim the lead wins.`,
    `Want to receive these by SMS in addition to email?`,
    `Reply YES to opt in, NO to keep email-only.`,
    `Reply STOP anytime to unsubscribe.`,
  ].join(" ");
}

/**
 * The acknowledgement after a vendor opts in. Confirms they're on
 * the SMS blast list. Optional — Twilio handles double-opt-in if we
 * leave this off, but a confirmation makes the consent trail clean.
 */
export function buildOptInConfirmSms(vendorName: string): string {
  return `Port A Local: Thanks ${vendorName} — you're on the SMS blast. Next cart-rental lead in Port A, you'll get the text. Reply STOP anytime to unsubscribe.`;
}

/**
 * The acknowledgement after a vendor opts out. Sends once on the NO
 * reply. STOP is handled at the carrier level by Twilio (auto-unsub),
 * so this is only fired on the soft NO path.
 */
export function buildOptOutAckSms(vendorName: string): string {
  return `Port A Local: Got it — ${vendorName} stays email-only for cart leads. Thanks for the reply.`;
}

/**
 * The actual lead-blast SMS. Compact format — a vendor needs to know
 * cart size, dates, and how to claim within 5 seconds of glancing at
 * the lock screen.
 *
 * Dates: weekday + month/day for fast skim. Duration in days.
 * No customer info in the blast — that's revealed only after claim.
 */
export interface CartLeadBlastInput {
  cartLabel: string; // "6-Passenger Golf Cart"
  pickupFormatted: string; // "Sun May 17"
  returnFormatted: string; // "Fri May 22"
  numDays: number;
}

export function buildLeadBlastSms(input: CartLeadBlastInput): string {
  const { cartLabel, pickupFormatted, returnFormatted, numDays } = input;
  const dayWord = numDays === 1 ? "day" : "days";
  // Block format per Collie 2026-04-29 — line-spacing makes the SMS skim
  // faster on a vendor's lock screen. Each line carries one fact.
  return [
    `Port A Local: 🛺 NEW CART LEAD`,
    `${cartLabel}, ${pickupFormatted} to ${returnFormatted} (${numDays} ${dayWord}).`,
    `$20 off your standard rate.`,
    `Reply CLAIM to take it (first vendor wins).`,
    `STOP to opt out.`,
  ].join("\n\n");
}

/**
 * Compress a cart label to fit within an SMS-friendly preview.
 * Input: "6-Passenger Golf Cart" → output: "6-pass cart".
 */
export function compactCartLabel(cartLabel: string): string {
  const m = cartLabel.match(/(\d+)-Passenger/i);
  if (m) return `${m[1]}-pass cart`;
  return cartLabel;
}

/**
 * Send the lead blast SMS to every opted-in vendor. Returns the
 * count of messages dispatched. Caller should NOT await individually
 * if dispatching in parallel — instead wrap in Promise.allSettled to
 * tolerate per-vendor failures.
 */
export async function sendLeadBlastSms(
  input: CartLeadBlastInput,
): Promise<number> {
  const optedInSlugs = await getOptedInSlugs();
  if (optedInSlugs.length === 0) return 0;

  const slugSet = new Set(optedInSlugs);
  const targets = cartVendors.filter(
    (v) =>
      v.active &&
      slugSet.has(v.slug) &&
      v.smsCapable !== false &&
      smsPhoneFor(v).trim().length > 0,
  );
  if (targets.length === 0) return 0;

  const body = buildLeadBlastSms(input);
  // Send sequentially with light pacing — A2P 10DLC LOW_VOLUME tier on
  // AT&T is 1.25 msg/sec. Sequential at ~1s pace stays comfortably under.
  let sent = 0;
  for (const vendor of targets) {
    try {
      await sendSms(smsPhoneFor(vendor), body);
      sent++;
    } catch (err) {
      console.error(`[cart-vendor-blast] send failed for ${vendor.slug}:`, err);
    }
    // 800ms gap between sends — fits AT&T 1.25 mps with margin
    if (sent < targets.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return sent;
}
