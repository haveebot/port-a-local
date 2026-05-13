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
 *
 * 2026-05-09: keyword UX softened — outbound copy now says "Reply
 * ACCEPT to take it, or PASS to release it" instead of "Reply CLAIM."
 * Inbound webhook still accepts CLAIM as a synonym for ACCEPT for
 * backward compat with vendors who learned the old keyword.
 *
 * 2026-05-09: split into two fan-out paths:
 *   - sendFirstLookSms()  — sends to a single priority vendor's phones
 *   - sendOpenBlastSms()  — sends to every vendor EXCEPT first-look
 *                            vendors (they had their shot already)
 *   - sendLeadBlastSms()  — kept as alias for sendOpenBlastSms() for
 *                            callers that don't care about the split
 */

import { sendSms } from "./twilioSms";
import { getOptedOutSlugs } from "@/data/cart-vendor-sms-store";
import {
  cartVendors,
  smsPhonesFor,
  type CartVendor,
} from "@/data/cart-vendors";

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
 * No customer info in the blast — that's revealed only after ACCEPT.
 */
export interface CartLeadBlastInput {
  cartLabel: string; // "6-Passenger Golf Cart"
  pickupFormatted: string; // "Sun May 17"
  returnFormatted: string; // "Fri May 22"
  numDays: number;
  // Customer's pickup/delivery choice — surfaced in the lead body so the
  // vendor knows what they're committing to before they ACCEPT. Vendor is
  // required to honor it.
  handoff: "delivery" | "pickup";
}

function handoffLine(h: "delivery" | "pickup"): string {
  return h === "pickup"
    ? `Customer chose: PICKUP at your shop.`
    : `Customer chose: DELIVERY to their address.`;
}

export function buildLeadBlastSms(input: CartLeadBlastInput): string {
  const { cartLabel, pickupFormatted, returnFormatted, numDays, handoff } = input;
  const dayWord = numDays === 1 ? "day" : "days";
  // Block format per Collie 2026-04-29 — line-spacing makes the SMS skim
  // faster on a vendor's lock screen. Each line carries one fact.
  return [
    `Port A Local: 🛺 NEW CART LEAD`,
    `${cartLabel}, ${pickupFormatted} to ${returnFormatted} (${numDays} ${dayWord}).`,
    handoffLine(handoff),
    `$20 off your standard rate.`,
    `Reply ACCEPT to take it, or PASS to release it.`,
    `STOP to opt out.`,
  ].join("\n\n");
}

/**
 * The first-look variant — same body as the open blast plus a one-line
 * preamble that signals "you have a head start window before the rest
 * of the directory sees this." Intentionally subtle — keeps the surface
 * familiar so the lock-screen scan time stays fast.
 */
export function buildFirstLookLeadSms(
  input: CartLeadBlastInput & { windowMinutes: number },
): string {
  const { windowMinutes, ...rest } = input;
  const dayWord = rest.numDays === 1 ? "day" : "days";
  return [
    `Port A Local: 🛺 PRIORITY CART LEAD (${windowMinutes}-min head start)`,
    `${rest.cartLabel}, ${rest.pickupFormatted} to ${rest.returnFormatted} (${rest.numDays} ${dayWord}).`,
    handoffLine(rest.handoff),
    `$20 off your standard rate.`,
    `Reply ACCEPT to take it, or PASS to release it to the rest of the directory.`,
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
 * Send the first-look SMS to all of a single priority vendor's
 * SMS-capable phones. Used when a lead arrives and the vendor has
 * `firstLookMinutes > 0` configured.
 *
 * Returns the count of messages dispatched (one per phone number).
 */
export async function sendFirstLookSms(
  vendor: CartVendor,
  input: CartLeadBlastInput & { windowMinutes: number },
): Promise<number> {
  const phones = smsPhonesFor(vendor);
  if (phones.length === 0) return 0;

  const body = buildFirstLookLeadSms(input);
  let sent = 0;
  for (const phone of phones) {
    try {
      await sendSms(phone, body);
      sent++;
    } catch (err) {
      console.error(
        `[first-look-blast] send failed for ${vendor.slug} ${phone}:`,
        err,
      );
    }
    // 800ms pacing — same as open blast for A2P 10DLC throttle margin
    if (sent < phones.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return sent;
}

/**
 * Send the lead blast SMS to every opted-in vendor — the OPEN-BLAST
 * phase. Excludes vendors in `excludeSlugs` (used to skip first-look
 * vendors that already had their priority window). Returns the count of
 * messages dispatched.
 *
 * NOTE: A vendor with multiple SMS-capable phones receives one SMS per
 * phone — one alert per number on file. That mirrors the multi-recipient
 * model of the lead-blast email (one email per address).
 */
export async function sendOpenBlastSms(
  input: CartLeadBlastInput,
  opts: { excludeSlugs?: string[] } = {},
): Promise<number> {
  // Per Winston's policy 2026-04-29: every cart vendor in the directory
  // is default opt-in. Blast targets all active vendors with at least one
  // SMS-capable phone EXCEPT those who manually opted out (STOP / NO reply
  // tracked in cart_vendor_sms_consents.status='opted_out').
  const optedOutSlugs = await getOptedOutSlugs();
  const excludeSet = new Set([
    ...optedOutSlugs,
    ...(opts.excludeSlugs ?? []),
  ]);
  const targets = cartVendors.filter(
    (v) =>
      v.active &&
      !excludeSet.has(v.slug) &&
      smsPhonesFor(v).length > 0,
  );
  if (targets.length === 0) return 0;

  const body = buildLeadBlastSms(input);
  let sent = 0;
  for (const vendor of targets) {
    const phones = smsPhonesFor(vendor);
    for (const phone of phones) {
      try {
        await sendSms(phone, body);
        sent++;
      } catch (err) {
        console.error(
          `[cart-vendor-blast] send failed for ${vendor.slug} ${phone}:`,
          err,
        );
      }
      // 800ms gap between sends — fits AT&T 1.25 mps with margin
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return sent;
}

/**
 * Backward-compat alias — older callers may import `sendLeadBlastSms`.
 * New code should use `sendOpenBlastSms` for clarity. Both target the
 * same fan-out (all active SMS-capable vendors not in the exclude set).
 */
export const sendLeadBlastSms = sendOpenBlastSms;
