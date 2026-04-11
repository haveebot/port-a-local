import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://port-a-local.vercel.app";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    phone,
    email,
    cartSize,
    pickupDate,
    returnDate,
    delivery,
    deliveryAddress,
    numDays,
    reservationFee,
  } = body;

  if (!name || !phone || !email || !cartSize || !pickupDate || !returnDate || !numDays || !reservationFee) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: reservationFee * 100, // Stripe uses cents
            product_data: {
              name: `Golf Cart Reservation — ${cartSize}-Passenger`,
              description: `${numDays} day${numDays !== 1 ? "s" : ""} · ${pickupDate} → ${returnDate}${delivery === "delivery" ? ` · Delivery to ${deliveryAddress}` : " · Self-Pickup"}`,
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
        delivery,
        deliveryAddress: deliveryAddress || "",
        numDays: String(numDays),
        reservationFee: String(reservationFee),
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
