import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getBeachProduct,
  dailyTotalCents,
} from "@/data/beach-products";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theportalocal.com";

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
    qty,
    smsConsent,
  } = body;

  // Validate required fields. Note: we INTENTIONALLY ignore any
  // totalPrice / vendorBaseCentsPerDay / palFeeCentsPerDay the client
  // sends — those are computed server-side from the trusted catalog
  // so a manipulated request body can't underpay.
  if (!name || !phone || !email || !product || !pickupDate || !returnDate || !deliveryAddress || !numDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const catalog = getBeachProduct(product);
  if (!catalog) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const days = Number(numDays);
  const actualQty = Number(qty || quantity || 1);
  if (!Number.isFinite(days) || days < 1 || days > 60) {
    return NextResponse.json({ error: "Invalid numDays" }, { status: 400 });
  }
  if (!Number.isFinite(actualQty) || actualQty < 1 || actualQty > 20) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  // SERVER-COMPUTED amounts. Never trust client.
  const totalCents = dailyTotalCents(catalog) * days * actualQty;
  const vendorTotalCents = catalog.vendorBaseCents * days * actualQty;
  const palFeeTotalCents = catalog.palFeeCents * days * actualQty;

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: totalCents,
            product_data: {
              name: `Beach Rental — ${catalog.label}`,
              description: `${actualQty} setup${actualQty > 1 ? "s" : ""} · ${days} day${days !== 1 ? "s" : ""} · ${pickupDate} → ${returnDate} · ${deliveryAddress} · Free cancellation up to 72 hours before setup date`,
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
        numDays: String(days),
        totalPrice: String(totalCents / 100),
        smsConsent: smsConsent ? "true" : "false",
        vendor_total_cents: String(vendorTotalCents),
        pal_fee_total_cents: String(palFeeTotalCents),
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
