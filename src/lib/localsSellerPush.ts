/**
 * Locals seller push fan-out. Fires when a sell-mode listing
 * just closed a sale on Stripe — the seller gets an instant
 * OS-level alert so they can move on fulfillment without
 * checking email.
 *
 * Targeted (not blast): only the listing's own seller gets
 * the push, keyed on the offerId the seller subscribed under
 * via /locals/vendor/[offerId].
 */

import {
  deleteSubscription,
  getSubscriptionsFor,
  markPushed,
} from "@/data/push-subscriptions-store";
import { sendPushToSubscription } from "@/lib/webPush";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

export interface NewLocalsSalePushInput {
  offerId: string;
  listingTitle: string;
  vendorAmountCents: number;
  customerName: string;
  /** Magic-link signature (sig param) so the alert deep-links to the
   * seller's own portal. */
  vendorPortalSig: string;
}

export async function pushNewLocalsSale(
  input: NewLocalsSalePushInput,
): Promise<void> {
  try {
    const subs = await getSubscriptionsFor("locals-seller", input.offerId);
    if (subs.length === 0) return;

    const url = `${APP_URL}/locals/vendor/${encodeURIComponent(input.offerId)}?s=${encodeURIComponent(input.vendorPortalSig)}`;
    const dollars = (input.vendorAmountCents / 100).toFixed(2);
    const payload = {
      title: `Sale closed · $${dollars}`,
      body: `${input.listingTitle} — ${input.customerName} just paid. Reach out to fulfill.`,
      url,
      tag: `locals-sale-${input.offerId}-${Date.now()}`,
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
            `[locals-seller push] failed for sub ${sub.id}:`,
            err,
          );
        }
      }),
    );
  } catch (err) {
    console.error("[locals-seller push] fan-out failed:", err);
  }
}
