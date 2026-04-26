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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-03-25.dahlia",
  });
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
  };
  const order = await createOrder(orderInput);

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
