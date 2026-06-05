/**
 * Beach day-before comms — the recurring counterpart to the booking-time
 * confirmation. For a setup happening tomorrow, the claiming crew gets a
 * formal setup reminder and the customer gets a confirmation. Fired by the
 * /api/cron/beach-day-before cron (and reusable for a manual one-off).
 *
 * Comms discipline (locked 2026-06-05): vendor SMS never carries the
 * customer's phone/contact — only the setup spot (job-info) + a first-name +
 * last-initial reference; PAL stays the comms channel. Customer SMS never
 * names the vendor (PAL is the listed provider).
 */

import { sendSms, sendConsumerSms } from "./twilioSms";
import {
  beachVendors,
  beachVendorPhone,
  findBeachVendorBySlug,
  beachVendorsAreTeammates,
} from "@/data/beach-vendors";
import { productSmsLabel } from "@/data/beach-products";
import { formatCustomerDisplay } from "./superAdminPing";
import {
  markDayBeforeSent,
  type BeachBookingClaim,
} from "@/data/beach-claim-store";

function fmtSetupDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Formal day-before reminder to the crew — setup spot, no customer contact. */
export function buildVendorDayBeforeSms(
  itemLabel: string,
  setupDateFormatted: string,
  customerName: string,
  setupLocation?: string | null,
): string {
  const lines = [
    `Port A Local — Beach Setup Reminder`,
    `Confirming tomorrow's setup, ${setupDateFormatted}: ${itemLabel}.`,
    `Booking name: ${formatCustomerDisplay(customerName) ?? customerName}`,
  ];
  if (setupLocation) lines.push(`Setup location: ${setupLocation}`);
  lines.push(
    `Port A Local manages all customer communication — please reach out with any questions or needs.`,
  );
  return lines.join("\n\n");
}

/** Day-before confirmation to the customer — the vendor is never named. */
export function buildCustomerDayBeforeSms(
  itemLabel: string,
  setupDateFormatted: string,
  setupLocation?: string | null,
): string {
  const lines = [
    `Port A Local — Your beach setup is tomorrow`,
    `Confirmed for ${setupDateFormatted}: ${itemLabel}.`,
  ];
  if (setupLocation) lines.push(`Setup location: ${setupLocation}`);
  lines.push(
    `Your local crew will have everything ready for you. Reply here if your plans change or you need anything.`,
  );
  lines.push(`Reply STOP to opt out.`);
  return lines.join("\n\n");
}

export interface DayBeforeResult {
  sessionId: string;
  vendor: string | null;
  vendorSent: number;
  customerAttempted: boolean;
}

/**
 * Send both day-before comms for one claimed beach booking, then stamp it
 * sent. Best-effort; never throws. Vendor reminder fans out to the whole
 * claiming crew (team); customer SMS is consent-gated.
 */
export async function sendBeachDayBeforeComms(
  claim: BeachBookingClaim,
): Promise<DayBeforeResult> {
  const itemLabel = claim.product
    ? productSmsLabel(claim.product, claim.qty ?? 1)
    : "beach setup";
  const dateFormatted = claim.setupDate
    ? fmtSetupDate(claim.setupDate)
    : "your scheduled date";

  // --- Vendor reminder → the claiming crew (whole team) ---
  let vendorSent = 0;
  const winner = claim.claimedBySlug
    ? findBeachVendorBySlug(claim.claimedBySlug)
    : null;
  if (winner) {
    const crew = beachVendors.filter(
      (v) =>
        v.active &&
        v.smsCapable !== false &&
        (v.slug === winner.slug || beachVendorsAreTeammates(v, winner)),
    );
    const vMsg = buildVendorDayBeforeSms(
      itemLabel,
      dateFormatted,
      claim.customerName ?? "Customer",
      claim.setupLocation,
    );
    for (const v of crew) {
      const phone = beachVendorPhone(v);
      if (!phone) continue;
      try {
        await sendSms(phone, vMsg);
        vendorSent++;
      } catch (err) {
        console.error("[beach-day-before] vendor send failed:", err);
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  // --- Customer confirmation (consent-gated; vendor never named) ---
  let customerAttempted = false;
  if (claim.customerPhone) {
    const cMsg = buildCustomerDayBeforeSms(
      itemLabel,
      dateFormatted,
      claim.setupLocation,
    );
    try {
      await sendConsumerSms(claim.customerPhone, cMsg, claim.smsConsent);
      customerAttempted = true;
    } catch (err) {
      console.error("[beach-day-before] customer send failed:", err);
    }
  }

  await markDayBeforeSent(claim.stripeSessionId);
  return {
    sessionId: claim.stripeSessionId,
    vendor: claim.claimedBySlug,
    vendorSent,
    customerAttempted,
  };
}
