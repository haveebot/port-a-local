/**
 * Restaurant push fan-out. Fires when a delivery order pays out
 * for a given restaurant — staff get an instant OS-level alert
 * so they can start prepping without watching admin@ inbox.
 *
 * Targeted (not blast): only the order's own restaurant gets
 * the push, keyed on restaurantId the staff subscribed under
 * via /deliver/restaurant/[slug]/notify.
 */

import {
  deleteSubscription,
  getSubscriptionsFor,
  markPushed,
} from "@/data/push-subscriptions-store";
import { sendPushToSubscription } from "@/lib/webPush";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

export interface NewDeliveryOrderPushInput {
  restaurantId: string;
  restaurantName: string;
  orderId: string;
  itemSummary: string; // e.g. "3 items · $24.50"
  customerName: string;
}

export async function pushNewDeliveryOrder(
  input: NewDeliveryOrderPushInput,
): Promise<void> {
  try {
    const subs = await getSubscriptionsFor(
      "restaurant",
      input.restaurantId,
    );
    if (subs.length === 0) return;

    const url = `${APP_URL}/deliver/order/${encodeURIComponent(input.orderId)}`;
    const payload = {
      title: `New PAL order · ${input.restaurantName}`,
      body: `${input.itemSummary} for ${input.customerName}. Start prep when ready.`,
      url,
      tag: `delivery-order-${input.orderId}`,
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
            `[restaurant push] failed for sub ${sub.id}:`,
            err,
          );
        }
      }),
    );
  } catch (err) {
    console.error("[restaurant push] fan-out failed:", err);
  }
}
