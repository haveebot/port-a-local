/**
 * Delivery dispatch helpers — used by the Stripe webhook + driver claim
 * + status-transition routes to send SMS and mirror order events into
 * the Wheelhouse.
 */

import {
  findOrCreatePulseThread,
  // We piggyback on the wheelhouse store's createMessage for the
  // Deliveries thread message; threads are auto-created if missing.
} from "@/data/wheelhouse-store";
import { sendSms, sendConsumerSms } from "./twilioSms";
import { getActiveDrivers, getDriver } from "@/data/delivery-drivers";
import { getRestaurant } from "@/data/delivery-restaurants";
import { getOnlineDriverIds } from "@/data/delivery-store";
import type { Order } from "@/data/delivery-types";
import { formatUSD } from "@/data/delivery-pricing";
import { createMessage as createWheelhouseMessage } from "@/data/wheelhouse-store";
import { sql as vercelSql } from "@vercel/postgres";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * Notify every active driver about a new order via SMS AND email
 * (belt-and-suspenders: SMS may be filtered by carriers pre-A2P 10DLC).
 * Driver who taps the claim link first wins.
 */
export async function dispatchDriversForOrder(order: Order): Promise<{
  sentTo: string[];
}> {
  const restaurant = getRestaurant(order.restaurantId);
  // Only dispatch to drivers who are (a) configured + active in
  // delivery-drivers.ts AND (b) currently on-duty per their online toggle.
  const allActive = await getActiveDrivers();
  const onlineIds = new Set(await getOnlineDriverIds());
  const drivers = allActive.filter((d) => onlineIds.has(d.id));
  if (drivers.length === 0) {
    console.warn(
      `[deliver] order ${order.id} has no on-duty drivers (${allActive.length} configured, ${onlineIds.size} on duty)`,
    );
    return { sentTo: [] };
  }
  const itemSummary = order.items
    .map((li) => `${li.quantity}× ${li.itemName}`)
    .join(", ")
    .slice(0, 120);
  // driverPayoutCents already includes 50% markup + 50% delivery + 100% tip.
  const driverPayout = order.driverPayoutCents;
  const sentTo: string[] = [];
  for (const d of drivers) {
    // Login redirect → sets cookie on first tap, then lands on the
    // order detail page. After that, runner stays signed in for 30 days.
    const url = `${APP_URL}/api/deliver/driver/login?t=${encodeURIComponent(d.token)}&next=${encodeURIComponent(`/deliver/driver/${order.id}`)}`;
    const lines = [
      `PAL Delivery — new order`,
      `${restaurant?.name ?? order.restaurantId} → ${order.customer.deliveryAddress}`,
      itemSummary,
      `You earn ${formatUSD(driverPayout)}.`,
      `Claim: ${url}`,
    ];
    const smsBody = lines.join("\n");
    // SMS — may fail silently pre-A2P 10DLC depending on carrier
    try {
      await sendSms(d.phone, smsBody);
    } catch (err) {
      console.error(`[deliver] dispatch SMS to ${d.id} failed:`, err);
    }
    // Email backup — 100% reliable, no carrier filtering
    if (d.email) {
      await sendDriverDispatchEmail({
        to: d.email,
        driverName: d.name,
        restaurantName: restaurant?.name ?? order.restaurantId,
        pickupAddress: restaurant?.pickupAddress ?? "",
        dropAddress: order.customer.deliveryAddress,
        dropNotes: order.customer.deliveryNotes,
        items: itemSummary,
        payoutLabel: formatUSD(driverPayout),
        claimUrl: url,
      });
    }
    sentTo.push(d.id);
  }
  return { sentTo };
}

interface DriverEmailInput {
  to: string;
  driverName: string;
  restaurantName: string;
  pickupAddress: string;
  dropAddress: string;
  dropNotes?: string;
  items: string;
  payoutLabel: string;
  claimUrl: string;
}

async function sendDriverDispatchEmail(i: DriverEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  // Plain ASCII subject avoids Gmail's emoji-flag spam heuristics for new
  // sender domains. Add emoji back once theportalocal.com has rep.
  const subject = `New PAL Delivery order — ${i.payoutLabel} from ${i.restaurantName}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        PAL Delivery · Driver dispatch
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">Hey ${i.driverName} — first to claim wins.</h2>

      <p style="margin: 0 0 4px;"><strong>You earn:</strong> <span style="color:#1f7a4d; font-weight:bold;">${i.payoutLabel}</span></p>
      <p style="margin: 0 0 4px;"><strong>Pickup:</strong> ${i.restaurantName} — ${i.pickupAddress}</p>
      <p style="margin: 0 0 4px;"><strong>Drop:</strong> ${i.dropAddress}</p>
      ${i.dropNotes ? `<p style="margin: 0; color:#555; font-style: italic;">Notes: ${i.dropNotes}</p>` : ""}
      <p style="margin: 12px 0;"><strong>Order:</strong> ${i.items}</p>

      <p style="margin: 24px 0;">
        <a href="${i.claimUrl}" style="display:inline-block; padding:14px 24px; background:#e8656f; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Claim this delivery →
        </a>
      </p>

      <p style="font-size: 12px; color: #888;">
        First runner to tap wins. If someone else got it, the link will tell you.
      </p>
    </div>
  `;
  const text = `PAL Delivery — new order\n\n${i.restaurantName} → ${i.dropAddress}\n${i.items}\n\nYou earn ${i.payoutLabel}\n\nClaim: ${i.claimUrl}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: [i.to],
        // Reply-to a real human inbox so replies don't bounce. Helps
        // sender reputation too — Gmail favors mail with a real reply path.
        reply_to: "hello@theportalocal.com",
        subject,
        html,
        text,
        // X-Entity-Ref-ID makes Gmail group these as transactional rather
        // than promotional. Different bucket, less likely to be flagged.
        headers: {
          "X-Entity-Ref-ID": `pal-deliver-dispatch`,
        },
      }),
    });
    if (!res.ok) {
      console.error("[deliver dispatch email]", await res.text());
    }
  } catch (err) {
    console.error("[deliver dispatch email] send failed:", err);
  }
}

/** Notify customer that their order was claimed by a driver */
export async function notifyCustomerClaimed(
  order: Order,
  driverName: string,
  smsConsent: boolean,
): Promise<void> {
  const restaurant = getRestaurant(order.restaurantId);
  const url = `${APP_URL}/deliver/success/${order.id}`;
  const body =
    `PAL Delivery: ${driverName} is heading to ${restaurant?.name ?? "the restaurant"} ` +
    `to pick up your order. Track: ${url}`;
  await sendConsumerSms(order.customer.phone, body, smsConsent);
}

export async function notifyCustomerPickedUp(
  order: Order,
  smsConsent: boolean,
): Promise<void> {
  const url = `${APP_URL}/deliver/success/${order.id}`;
  const body =
    `PAL Delivery: Your order is on the way. ETA based on PA traffic. Track: ${url}`;
  await sendConsumerSms(order.customer.phone, body, smsConsent);
}

export async function notifyCustomerDelivered(
  order: Order,
  smsConsent: boolean,
): Promise<void> {
  const body =
    `PAL Delivery: Delivered. Thanks for trying us — reply with feedback any time.`;
  await sendConsumerSms(order.customer.phone, body, smsConsent);
}

/* -------------------- Wheelhouse mirror -------------------- */

const DELIVERIES_TAG = "deliveries";
const DELIVERIES_TITLE = "PAL Deliveries — order log";

/**
 * Find-or-create the pinned Deliveries thread (mirrors the Pulse thread
 * pattern). Each order appends one update message at each lifecycle
 * transition. Activity ticker surfaces them automatically.
 */
async function findOrCreateDeliveriesThread(): Promise<string> {
  const { rows } = await vercelSql`
    SELECT id FROM wheelhouse_threads
    WHERE tags ? ${DELIVERIES_TAG}
    ORDER BY created_at ASC
    LIMIT 1
  `;
  if (rows[0]) return rows[0].id as string;

  const id = `thread-deliveries-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const participants = [
    "winston",
    "collie",
    "nick",
    "winston-claude",
    "collie-claude",
    "nick-claude",
  ];
  await vercelSql`
    INSERT INTO wheelhouse_threads (
      id, title, tags, state, participants, author_id,
      created_at, updated_at, context, pinned
    ) VALUES (
      ${id},
      ${DELIVERIES_TITLE},
      ${JSON.stringify([DELIVERIES_TAG])}::jsonb,
      'open',
      ${JSON.stringify(participants)}::jsonb,
      'winston-claude',
      ${now},
      ${now},
      NULL,
      true
    )
  `;
  return id;
}

export async function mirrorToWheelhouse(
  order: Order,
  event:
    | "placed"
    | "paid"
    | "claimed"
    | "picked_up"
    | "delivered",
): Promise<void> {
  try {
    const threadId = await findOrCreateDeliveriesThread();
    const restaurant = getRestaurant(order.restaurantId);
    const driver = order.driverId
      ? await getDriver(order.driverId)
      : null;
    const itemList = order.items
      .map((li) => `${li.quantity}× ${li.itemName}`)
      .join(", ");

    const title = (() => {
      switch (event) {
        case "placed":
          return `New order — ${restaurant?.name}`;
        case "paid":
          return `Paid · dispatched — ${restaurant?.name}`;
        case "claimed":
          return `Claimed by ${driver?.name ?? order.driverId} — ${restaurant?.name}`;
        case "picked_up":
          return `Picked up — ${restaurant?.name}`;
        case "delivered":
          return `Delivered — ${restaurant?.name}`;
      }
    })();

    const body = [
      `**${title}**`,
      "",
      `**Order:** ${order.id}`,
      `**Customer:** ${order.customer.name} · ${order.customer.phone}`,
      `**Drop:** ${order.customer.deliveryAddress}`,
      order.customer.deliveryNotes ? `**Notes:** ${order.customer.deliveryNotes}` : "",
      "",
      `**Items:** ${itemList}`,
      `**Total:** ${formatUSD(order.totalCents)} (tip ${formatUSD(order.tipCents)})`,
    ]
      .filter(Boolean)
      .join("\n");

    await createWheelhouseMessage({
      threadId,
      authorId: "winston-claude",
      type: event === "delivered" ? "decision" : "update",
      body,
    });
  } catch (err) {
    // Mirror failures should never block the delivery — log and move on
    console.error("[deliver] wheelhouse mirror failed:", err);
  }
}
