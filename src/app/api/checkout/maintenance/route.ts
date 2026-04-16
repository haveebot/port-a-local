import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theportalocal.com";

const DISPATCH_FEE = 20; // $20 priority dispatch fee

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, address, serviceType, description, urgency, contactPref } = body;

  if (!name || !phone || !email || !address || !serviceType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: DISPATCH_FEE * 100,
            product_data: {
              name: "Priority Dispatch — Port A Local Maintenance",
              description: `${serviceType} at ${address} — guaranteed response within 4 hours (7AM–8PM)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "maintenance_priority",
        name,
        phone,
        email,
        address,
        serviceType,
        description: description.slice(0, 500), // Stripe metadata limit
        urgency,
        contactPref,
        dispatchFee: String(DISPATCH_FEE),
      },
      success_url: `${APP_URL}/maintenance/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/maintenance`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout/Maintenance] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
