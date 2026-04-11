import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://port-a-local.vercel.app";

const PRODUCT_LABELS: Record<string, string> = {
  cabana: "Cabana Setup",
  chairs: "Chair & Umbrella Setup",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    phone,
    email,
    product,
    quantity,
    pickupDate,
    returnDate,
    deliveryAddress,
    numDays,
    totalPrice,
    qty,
  } = body;

  if (!name || !phone || !email || !product || !pickupDate || !returnDate || !deliveryAddress || !numDays || !totalPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const productLabel = PRODUCT_LABELS[product] || product;
  const actualQty = qty || quantity || 1;

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: totalPrice * 100, // Stripe uses cents
            product_data: {
              name: `Beach Rental — ${productLabel}`,
              description: `${actualQty} setup${actualQty > 1 ? "s" : ""} · ${numDays} day${numDays !== 1 ? "s" : ""} · ${pickupDate} → ${returnDate} · ${deliveryAddress}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "beach",
        name,
        phone,
        email,
        product,
        quantity: String(actualQty),
        pickupDate,
        returnDate,
        deliveryAddress,
        numDays: String(numDays),
        totalPrice: String(totalPrice),
      },
      success_url: `${APP_URL}/beach/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/beach`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout/Beach] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
