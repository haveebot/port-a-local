import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
    cartSize,
    pickupDate,
    returnDate,
    numDays,
    smsConsent,
    handoff,
  } = body;

  // Customer's handoff choice — required. Vendor must honor it. Default to
  // delivery if absent (the form initial state) to keep backward compat with
  // any in-flight checkout sessions that predate the field.
  const handoffNormalized: "delivery" | "pickup" =
    handoff === "pickup" ? "pickup" : "delivery";

  // Note: any reservationFee in the body is INTENTIONALLY ignored. The fee is
  // computed server-side ($10/day) so a manipulated client can't underpay.
  if (!name || !phone || !email || !cartSize || !pickupDate || !returnDate || !numDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const days = Number(numDays);
  if (!Number.isFinite(days) || days < 1 || days > 60) {
    return NextResponse.json({ error: "Invalid numDays" }, { status: 400 });
  }
  const RESERVATION_FEE_CENTS_PER_DAY = 1000; // $10/day, source of truth
  const reservationFeeCents = days * RESERVATION_FEE_CENTS_PER_DAY;

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: reservationFeeCents,
            product_data: {
              name: `Golf Cart Reservation — ${cartSize}-Passenger`,
              description: `${days} day${days !== 1 ? "s" : ""} · ${pickupDate} → ${returnDate} · Pickup in Port Aransas`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "rent",
        name,
        phone,
        email,
        cartSize,
        pickupDate,
        returnDate,
        numDays: String(days),
        reservationFee: String(reservationFeeCents / 100),
        smsConsent: smsConsent ? "true" : "false",
        handoff: handoffNormalized,
      },
      success_url: `${APP_URL}/rent/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/rent`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout/Rent] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
