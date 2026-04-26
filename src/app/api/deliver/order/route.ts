import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createOrder,
  type CreateOrderInput,
} from "@/data/delivery-store";
import {
  CartError,
  formatUSD,
  priceCart,
  type CartItemInput,
} from "@/data/delivery-pricing";
import { getRestaurant, isOpenNow } from "@/data/delivery-restaurants";
import { isDeliveryLive } from "@/data/delivery-launch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-03-25.dahlia",
  });
}

interface OrderEmailInput {
  orderId: string;
  restaurantName: string;
  pickupAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  lineItems: string[];
  subtotal: string;
  tip: string;
  total: string;
  /** When true, customer was charged; when false, beta path (no charge yet) */
  paid: boolean;
  /** Economics breakdown for ops awareness */
  restaurantCost: string;
  driverPayout: string;
  palNet: string;
}

async function sendOrderEmail(i: OrderEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[deliver] RESEND_API_KEY not set — skipping admin email");
    return;
  }
  const tag = i.paid ? "PAID" : "Request (no charge)";
  const subject = `PAL Delivery — ${tag} — ${i.restaurantName} → ${i.customerName}`;
  const itemsHtml = i.lineItems.map((l) => `<li>${l}</li>`).join("");
  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a2433; line-height: 1.5;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: ${i.paid ? "#1f7a4d" : "#C84A2C"}; margin: 0 0 4px;">
        PAL Delivery · ${tag}
      </p>
      <h2 style="margin: 0 0 16px; font-family: Georgia, serif;">${i.restaurantName}</h2>

      <p style="margin: 0 0 4px;"><strong>Order ID:</strong> ${i.orderId}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Customer</h3>
      <p style="margin: 0;">${i.customerName} · <a href="tel:${i.customerPhone.replace(/[^\d+]/g, "")}">${i.customerPhone}</a>${i.customerEmail ? ` · <a href="mailto:${i.customerEmail}">${i.customerEmail}</a>` : ""}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Drop</h3>
      <p style="margin: 0;">${i.deliveryAddress}</p>
      ${i.deliveryNotes ? `<p style="margin: 4px 0 0; color: #555; font-style: italic;">Notes: ${i.deliveryNotes}</p>` : ""}

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Pickup at</h3>
      <p style="margin: 0;">${i.pickupAddress}</p>

      <h3 style="margin: 20px 0 6px; font-size: 14px;">Items</h3>
      <ul style="margin: 0; padding-left: 20px;">${itemsHtml}</ul>

      <p style="margin: 16px 0 0;"><strong>Subtotal:</strong> ${i.subtotal} · <strong>Tip:</strong> ${i.tip} · <strong>${i.paid ? "Total charged" : "Total (would be)"}:</strong> ${i.total}</p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #4a5568; margin: 0 0 6px;">
        Economics
      </p>
      <p style="margin: 0; font-size: 13px;">
        Restaurant gets at pickup: <strong>${i.restaurantCost}</strong>
      </p>
      <p style="margin: 0; font-size: 13px;">
        Driver Venmo: <strong>${i.driverPayout}</strong> (50% markup + 50% delivery + tip)
      </p>
      <p style="margin: 0; font-size: 13px;">
        PAL net: <strong style="color:#1f7a4d;">${i.palNet}</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e5dcc7; margin: 24px 0;" />

      <p style="font-size: 12px; color: #555;">
        ${i.paid
          ? "Customer has paid in full. Drive to the restaurant, place the order, deliver, then text the customer with ETA."
          : "Customer has NOT been charged. Reach out by phone/SMS to confirm fulfillment, then take payment manually."}
      </p>

      <p style="font-size: 11px; color: #888; margin-top: 16px;">
        — PAL Delivery automation
      </p>
    </div>
  `;
  const text =
    `PAL Delivery ${tag} — ${i.customerName}\n\n` +
    `Restaurant: ${i.restaurantName}\nOrder ID: ${i.orderId}\n\n` +
    `Customer: ${i.customerName} · ${i.customerPhone}` +
    (i.customerEmail ? ` · ${i.customerEmail}` : "") +
    `\nDrop: ${i.deliveryAddress}` +
    (i.deliveryNotes ? `\nNotes: ${i.deliveryNotes}` : "") +
    `\nPickup: ${i.pickupAddress}\n\n` +
    `Items:\n${i.lineItems.map((l) => `  - ${l}`).join("\n")}\n\n` +
    `Subtotal: ${i.subtotal} · Tip: ${i.tip} · ${i.paid ? "Total charged" : "Total (would be)"}: ${i.total}\n\n` +
    `Economics:\n  Restaurant: ${i.restaurantCost}\n  Driver Venmo: ${i.driverPayout}\n  PAL net: ${i.palNet}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PAL Delivery <bookings@theportalocal.com>",
        to: ["admin@theportalocal.com", "hello@theportalocal.com"],
        reply_to: i.customerEmail,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[deliver] resend non-200:", await res.text());
    }
  } catch (err) {
    console.error("[deliver] email send failed:", err);
  }
}

interface OrderRequestBody {
  restaurantSlug: string;
  items: CartItemInput[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    deliveryNotes?: string;
  };
  tipCents: number;
}

/**
 * POST /api/deliver/order
 *
 * Creates a pending order, opens a Stripe Checkout Session, returns the
 * session URL. Client redirects there. Stripe webhook confirms payment
 * and triggers driver dispatch.
 */
export async function POST(req: NextRequest) {
  let body: OrderRequestBody;
  try {
    body = (await req.json()) as OrderRequestBody;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { restaurantSlug, items, customer, tipCents } = body;
  if (
    !restaurantSlug ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !customer?.name?.trim() ||
    !customer?.phone?.trim() ||
    !customer?.deliveryAddress?.trim()
  ) {
    return NextResponse.json(
      { error: "Missing restaurant / items / name / phone / delivery address." },
      { status: 400 },
    );
  }

  const restaurant = getRestaurant(restaurantSlug);
  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurant not found or not active." },
      { status: 404 },
    );
  }
  if (!isOpenNow(restaurant)) {
    return NextResponse.json(
      {
        error: `${restaurant.name} isn't accepting orders right now. Check back during their delivery hours.`,
      },
      { status: 409 },
    );
  }

  let priced;
  try {
    priced = priceCart(items, tipCents ?? 0);
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (priced.restaurantId !== restaurant.id) {
    return NextResponse.json(
      { error: "Cart contains items from a different restaurant." },
      { status: 400 },
    );
  }

  // Create the order in the database FIRST so we have an id to embed in
  // the Stripe session metadata (the webhook needs to find this row).
  const orderInput: CreateOrderInput = {
    restaurantId: priced.restaurantId,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || undefined,
      deliveryAddress: customer.deliveryAddress.trim(),
      deliveryNotes: customer.deliveryNotes?.trim() || undefined,
    },
    items: priced.lineItems,
    subtotalCents: priced.subtotalCents,
    deliveryFeeCents: priced.deliveryFeeCents,
    serviceFeeCents: priced.serviceFeeCents,
    tipCents: priced.tipCents,
    taxCents: priced.taxCents,
    totalCents: priced.totalCents,
    restaurantCostCents: priced.restaurantCostCents,
    driverPayoutCents: priced.driverPayoutCents,
    palNetCents: priced.palNetCents,
  };
  const order = await createOrder(orderInput);

  // ALWAYS email admin at order creation — instant ping regardless of
  // payment outcome. Stripe webhook (when configured) will follow up
  // with a "PAID" email post-payment via the success-page Stripe verify
  // path. Live without webhook still works because we already have the
  // intake notification in admin@.
  const live = isDeliveryLive();
  const emailInput = {
    orderId: order.id,
    restaurantName: restaurant.name,
    pickupAddress: restaurant.pickupAddress,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    deliveryAddress: order.customer.deliveryAddress,
    deliveryNotes: order.customer.deliveryNotes,
    lineItems: order.items.map(
      (li) =>
        `${li.quantity}× ${li.itemName} — ${formatUSD(li.customerPriceCents * li.quantity)}`,
    ),
    subtotal: formatUSD(priced.subtotalCents),
    tip: formatUSD(priced.tipCents),
    total: formatUSD(priced.totalCents),
    restaurantCost: formatUSD(priced.restaurantCostCents),
    driverPayout: formatUSD(priced.driverPayoutCents),
    palNet: formatUSD(priced.palNetCents),
  };

  if (!live) {
    // BETA path — no Stripe, just intake notification
    await sendOrderEmail({ ...emailInput, paid: false });
    return NextResponse.json({
      orderId: order.id,
      beta: true,
      redirectUrl: `/deliver/success/${order.id}?beta=1`,
    });
  }

  // LIVE path — fire intake email immediately, then open Stripe Checkout.
  // Customer redirects to success page, which verifies Stripe + sends a
  // "PAID" follow-up email + marks order paid in DB.
  await sendOrderEmail({ ...emailInput, paid: false });

  // Open Stripe Checkout
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customer.email?.trim() || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: priced.subtotalCents,
          product_data: {
            name: `${restaurant.name} — order`,
            description: priced.lineItems
              .map((li) => `${li.quantity}× ${li.itemName}`)
              .join(" · ")
              .slice(0, 240),
          },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          unit_amount: priced.deliveryFeeCents,
          product_data: { name: "Delivery fee" },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          unit_amount: priced.serviceFeeCents,
          product_data: { name: "Service fee" },
        },
        quantity: 1,
      },
      ...(priced.tipCents > 0
        ? [
            {
              price_data: {
                currency: "usd",
                unit_amount: priced.tipCents,
                product_data: { name: "Driver tip" },
              },
              quantity: 1,
            },
          ]
        : []),
      {
        price_data: {
          currency: "usd",
          unit_amount: priced.taxCents,
          product_data: { name: `Sales tax (${(0.0825 * 100).toFixed(2)}%)` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "deliver",
      orderId: order.id,
      restaurantId: restaurant.id,
    },
    success_url: `${APP_URL}/deliver/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/deliver/${restaurant.slug}?canceled=1`,
  });

  // Persist the session id so webhook can find this order via session lookup
  if (session.id) {
    // Reuse markOrderPaid pattern is overkill — just update with session id
    // by calling the store. For minimal v1, do an inline UPDATE here.
    const { sql } = await import("@vercel/postgres");
    await sql`
      UPDATE delivery_orders SET checkout_session_id = ${session.id}
      WHERE id = ${order.id}
    `;
  }

  return NextResponse.json({
    orderId: order.id,
    checkoutUrl: session.url,
    total: formatUSD(priced.totalCents),
  });
}
