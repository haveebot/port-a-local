/**
 * PAL Delivery — post-payment email helpers.
 *
 * These fire AFTER Stripe payment confirms (from the success page or
 * the Stripe webhook), so we never email admin for orders that
 * errored out before payment. Two emails per paid order:
 *
 *   1. Admin "PAID" notification — to admin@ + hello@ with full
 *      details + economics breakdown
 *   2. Customer confirmation — to the customer's email if provided,
 *      friendly "your order is in" with summary + what to expect
 *
 * Both are idempotent-safe (Resend handles duplicate-send tolerance).
 */

import { formatUSD } from "@/data/delivery-pricing";
import { getRestaurant } from "@/data/delivery-restaurants";
import type { Order } from "@/data/delivery-types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(opts: {
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[deliver email] RESEND_API_KEY not set — skip");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: opts.to,
        reply_to: opts.replyTo,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("[deliver email] resend non-200:", await res.text());
    }
  } catch (err) {
    console.error("[deliver email] send failed:", err);
  }
}

/** Admin "PAID" notification — full order detail + economics breakdown */
export async function sendAdminPaidEmail(order: Order): Promise<void> {
  const restaurant = getRestaurant(order.restaurantId);
  const subject = `💸 PAL Delivery PAID — ${restaurant?.name ?? order.restaurantId} → ${order.customer.name}`;
  const itemsHtml = order.items
    .map(
      (li) =>
        `<li>${li.quantity}× ${escapeHtml(li.itemName)} — ${formatUSD(li.customerPriceCents * li.quantity)}</li>`,
    )
    .join("");
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #1f7a4d; margin: 0 0 4px;">
        PAL Delivery · PAID
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${escapeHtml(restaurant?.name ?? "")}</h2>

      <p style="margin: 0 0 4px;"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Customer</h3>
      <p style="margin: 0;">${escapeHtml(order.customer.name)} · <a href="tel:${escapeHtml(order.customer.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(order.customer.phone)}</a>${order.customer.email ? ` · <a href="mailto:${escapeHtml(order.customer.email)}">${escapeHtml(order.customer.email)}</a>` : ""}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Drop</h3>
      <p style="margin: 0;">${escapeHtml(order.customer.deliveryAddress)}</p>
      ${order.customer.deliveryNotes ? `<p style="margin: 4px 0 0; color: #555; font-style: italic;">Notes: ${escapeHtml(order.customer.deliveryNotes)}</p>` : ""}

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Pickup</h3>
      <p style="margin: 0;">${escapeHtml(restaurant?.pickupAddress ?? "")}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Items</h3>
      <ul style="margin: 0; padding-left: 20px;">${itemsHtml}</ul>

      <p style="margin: 16px 0 0;"><strong>Subtotal:</strong> ${formatUSD(order.subtotalCents)} · <strong>Tip:</strong> ${formatUSD(order.tipCents)} · <strong>Total charged:</strong> ${formatUSD(order.totalCents)}</p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #4a5568; margin: 0 0 6px;">Economics</p>
      <p style="margin: 0; font-size: 13px;">Restaurant gets at pickup: <strong>${formatUSD(order.restaurantCostCents)}</strong></p>
      <p style="margin: 0; font-size: 13px;">Driver Venmo: <strong>${formatUSD(order.driverPayoutCents)}</strong> (50% markup + 50% delivery + tip)</p>
      <p style="margin: 0; font-size: 13px;">PAL net: <strong style="color:#1f7a4d;">${formatUSD(order.palNetCents)}</strong></p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        Customer has paid in full. Drive to the restaurant, place the order,
        deliver, then text the customer with ETA.
      </p>
    </div>
  `;
  const text =
    `PAL Delivery PAID — ${order.customer.name}\n\n` +
    `Restaurant: ${restaurant?.name}\nOrder ID: ${order.id}\n\n` +
    `Customer: ${order.customer.name} · ${order.customer.phone}` +
    (order.customer.email ? ` · ${order.customer.email}` : "") +
    `\nDrop: ${order.customer.deliveryAddress}` +
    (order.customer.deliveryNotes ? `\nNotes: ${order.customer.deliveryNotes}` : "") +
    `\nPickup: ${restaurant?.pickupAddress}\n\n` +
    `Items:\n${order.items.map((li) => `  - ${li.quantity}× ${li.itemName} — ${formatUSD(li.customerPriceCents * li.quantity)}`).join("\n")}\n\n` +
    `Subtotal: ${formatUSD(order.subtotalCents)} · Tip: ${formatUSD(order.tipCents)} · Total charged: ${formatUSD(order.totalCents)}\n\n` +
    `Economics:\n  Restaurant: ${formatUSD(order.restaurantCostCents)}\n  Driver Venmo: ${formatUSD(order.driverPayoutCents)}\n  PAL net: ${formatUSD(order.palNetCents)}`;
  await sendResendEmail({
    to: ["admin@theportalocal.com", "hello@theportalocal.com"],
    replyTo: order.customer.email ?? undefined,
    subject,
    html,
    text,
  });
}

/** Customer "out for delivery" email — fires when runner taps Picked up */
export async function sendCustomerPickedUpEmail(order: Order): Promise<void> {
  if (!order.customer.email) return;
  const restaurant = getRestaurant(order.restaurantId);
  const subject = `On the way — your ${restaurant?.name ?? "order"}`;
  const trackUrl = `https://theportalocal.com/deliver/success/${order.id}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        Port A Local · Delivery
      </p>
      <h2 style="margin: 0 0 12px; font-family: Georgia, serif;">Your runner&apos;s on the way, ${escapeHtml(order.customer.name.split(" ")[0])}.</h2>
      <p>Just picked up at ${escapeHtml(restaurant?.name ?? "the restaurant")}. Heading to your spot now.</p>
      <p style="margin: 16px 0;"><strong>Drop:</strong> ${escapeHtml(order.customer.deliveryAddress)}</p>
      <p style="margin: 24px 0;">
        <a href="${trackUrl}" style="display:inline-block; padding:12px 22px; background:#0b1120; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Track your order →
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />
      <p style="font-size: 13px;">Issue with your order? Reply to this email — we read every one.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `On the way, ${order.customer.name.split(" ")[0]}.\n\n` +
    `Your runner just picked up at ${restaurant?.name ?? "the restaurant"} and is heading to:\n${order.customer.deliveryAddress}\n\n` +
    `Track: ${trackUrl}\n\n— The Port A Local`;
  await sendResendEmail({
    to: [order.customer.email],
    subject,
    html,
    text,
  });
}

/** Customer "delivered" email — fires when runner taps Delivered */
export async function sendCustomerDeliveredEmail(order: Order): Promise<void> {
  if (!order.customer.email) return;
  const restaurant = getRestaurant(order.restaurantId);
  const subject = `Delivered — enjoy your ${restaurant?.name ?? "order"}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #1f7a4d; margin: 0 0 4px;">
        Port A Local · Delivered ✓
      </p>
      <h2 style="margin: 0 0 12px; font-family: Georgia, serif;">Done deal, ${escapeHtml(order.customer.name.split(" ")[0])}.</h2>
      <p>Your ${escapeHtml(restaurant?.name ?? "order")} is at <strong>${escapeHtml(order.customer.deliveryAddress)}</strong>.</p>
      ${order.customer.deliveryNotes ? `<p style="margin: 8px 0 0; color:#555; font-style: italic;">Note we passed to the runner: ${escapeHtml(order.customer.deliveryNotes)}</p>` : ""}

      <p style="margin: 24px 0 12px;"><strong>Total charged:</strong> ${formatUSD(order.totalCents)}</p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 14px;">Was the experience good? Bad? Anything we should fix?</p>
      <p style="font-size: 14px;">Hit reply — we read every one. PAL Delivery is brand-new and we&apos;re tuning it on every order.</p>

      <p style="font-size: 13px; margin-top: 24px;">Thanks for trying us. See you next round.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Done deal, ${order.customer.name.split(" ")[0]}.\n\n` +
    `Your ${restaurant?.name ?? "order"} is at ${order.customer.deliveryAddress}.\n` +
    (order.customer.deliveryNotes ? `Note we passed to the runner: ${order.customer.deliveryNotes}\n` : "") +
    `\nTotal charged: ${formatUSD(order.totalCents)}\n\n` +
    `Was the experience good? Bad? Anything we should fix? Hit reply — we read every one.\n\n` +
    `Thanks for trying us. See you next round.\n\n` +
    `— The Port A Local`;
  await sendResendEmail({
    to: [order.customer.email],
    subject,
    html,
    text,
  });
}

/** Customer confirmation email — fires after payment confirms */
export async function sendCustomerConfirmationEmail(
  order: Order,
): Promise<void> {
  if (!order.customer.email) return;
  const restaurant = getRestaurant(order.restaurantId);
  const subject = `Your PAL Delivery order is in — ${restaurant?.name ?? "Port Aransas"}`;
  const itemsHtml = order.items
    .map(
      (li) =>
        `<li>${li.quantity}× ${escapeHtml(li.itemName)} — ${formatUSD(li.customerPriceCents * li.quantity)}</li>`,
    )
    .join("");
  const trackUrl = `https://theportalocal.com/deliver/success/${order.id}`;
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px;">
        Port A Local · Delivery
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">Got it, ${escapeHtml(order.customer.name.split(" ")[0])} — your ${escapeHtml(restaurant?.name ?? "order")} is in.</h2>

      <p>We're matching it with a runner now. You'll get a text at every step:</p>
      <ol style="margin: 12px 0; padding-left: 20px;">
        <li>When a runner claims it</li>
        <li>When they've picked it up at the restaurant</li>
        <li>When it's at your door</li>
      </ol>

      <h3 style="margin: 24px 0 6px; font-size: 14px;">Your order</h3>
      <ul style="margin: 0; padding-left: 20px;">${itemsHtml}</ul>

      <p style="margin: 12px 0;">
        <strong>Drop:</strong> ${escapeHtml(order.customer.deliveryAddress)}<br/>
        ${order.customer.deliveryNotes ? `<span style="color:#555; font-style:italic;">Notes: ${escapeHtml(order.customer.deliveryNotes)}</span><br/>` : ""}
        <strong>Total charged:</strong> ${formatUSD(order.totalCents)}
      </p>

      <p style="margin: 24px 0;">
        <a href="${trackUrl}" style="display:inline-block; padding:12px 22px; background:#0b1120; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Track your order →
        </a>
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 13px;">Issues with your order? Reply to this email — we read every one.</p>
      <p style="font-size: 11px; color: #888; margin-top: 16px;">— The Port A Local</p>
    </div>
  `;
  const text =
    `Got it, ${order.customer.name.split(" ")[0]} — your ${restaurant?.name ?? "order"} is in.\n\n` +
    `We're matching it with a runner now. You'll get a text at every step.\n\n` +
    `Order:\n${order.items.map((li) => `  ${li.quantity}× ${li.itemName} — ${formatUSD(li.customerPriceCents * li.quantity)}`).join("\n")}\n\n` +
    `Drop: ${order.customer.deliveryAddress}\n` +
    (order.customer.deliveryNotes ? `Notes: ${order.customer.deliveryNotes}\n` : "") +
    `Total charged: ${formatUSD(order.totalCents)}\n\n` +
    `Track: ${trackUrl}\n\n` +
    `Issues? Just reply — we read every one.\n\n` +
    `— The Port A Local`;
  await sendResendEmail({
    to: [order.customer.email],
    subject,
    html,
    text,
  });
}
