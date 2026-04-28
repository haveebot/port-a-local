/**
 * Cart-vendor push fan-out. Fires when a new cart booking lands —
 * every cart vendor with a registered web-push subscription gets
 * an instant OS-level alert. First to claim wins (matches the
 * existing email-blast model).
 *
 * Vendors don't opt in by signing up — the moment they subscribe
 * via /rent/vendor/[slug]/notify they're in the network. Opt-out
 * is at the network-membership level (hide from the directory) or
 * by uninstalling the PAL PWA. The push system fans the lead to
 * every subscribed device — vendors are part of the open marketplace.
 */

import {
  deleteSubscription,
  getSubscriptionsByKind,
  markPushed,
} from "@/data/push-subscriptions-store";
import { sendPushToSubscription } from "@/lib/webPush";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

export interface NewCartBookingPushInput {
  customerName: string;
  cartLabel: string;
  pickupDate: string; // formatted (e.g., "Friday, July 10, 2026")
  returnDate: string;
  numDays: number;
}

/**
 * Push a new-booking alert to every subscribed cart vendor. Defensive:
 * never throws, never blocks the booking pipeline. Stale subscriptions
 * (404/410 from push service) are pruned automatically.
 */
export async function pushNewCartBooking(
  input: NewCartBookingPushInput,
): Promise<void> {
  try {
    const subs = await getSubscriptionsByKind("cart-vendor");
    if (subs.length === 0) return;

    const url = `${APP_URL}/rent`;
    const payload = {
      title: `New cart lead · ${input.numDays}d`,
      body: `${input.cartLabel} · ${input.pickupDate} → ${input.returnDate}. First to claim wins. Check email for details.`,
      url,
      tag: `cart-booking-${Date.now()}`,
    };

    await Promise.all(
      subs.map(async (sub) => {
        try {
          const subObj = JSON.parse(sub.subscriptionJson);
          const result = await sendPushToSubscription(subObj, payload);
          if (result.expired) {
            await deleteSubscription(sub.id);
          } else if (result.ok) {
            await markPushed(sub.id);
          }
        } catch (err) {
          console.error(
            `[cart-vendor push] failed for sub ${sub.id}:`,
            err,
          );
        }
      }),
    );
  } catch (err) {
    console.error("[cart-vendor push] fan-out failed:", err);
  }
}
