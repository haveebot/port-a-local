import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  calculateHousekeepingTotalCents,
  createHousekeepingBooking,
  estimateCleaningHours,
  setHousekeepingStripeSession,
  formatUSD,
} from "@/data/housekeeping-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

function getStripeKey(): string | undefined {
  // Reuses STRIPE_SECRET_KEY (PAL platform) — no /housekeeping override
  // because it shares the same Stripe account.
  return (process.env.STRIPE_SECRET_KEY ?? "").trim() || undefined;
}

function getStripe(): Stripe {
  const key = getStripeKey();
  if (!key) throw new Error("STRIPE_SECRET_KEY missing for /housekeeping");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

/**
 * POST /api/housekeeping
 *
 * Customer-facing booking endpoint. Validates input, prices the
 * cleaning, creates a DB row, then mints a Stripe Checkout session
 * for the customer to pay. Returns the Stripe URL for redirect.
 *
 * Pricing: $100/hr, 1-hour minimum, 1 hr per 1000 sqft (rounded up
 * to nearest 0.5 hr).
 */
export async function POST(req: NextRequest) {
  let body: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    propertyAddress?: string;
    propertySqft?: number;
    serviceTier?: "standard" | "deep" | "move-out";
    notes?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const customerName = (body.customerName ?? "").trim();
  const customerPhone = (body.customerPhone ?? "").trim();
  const customerEmail = (body.customerEmail ?? "").trim();
  const propertyAddress = (body.propertyAddress ?? "").trim();
  const propertySqft = Number(body.propertySqft ?? 0);

  if (
    customerName.length < 2 ||
    customerPhone.replace(/\D/g, "").length < 10 ||
    !customerEmail.includes("@") ||
    propertyAddress.length < 5 ||
    !Number.isFinite(propertySqft) ||
    propertySqft < 200 ||
    propertySqft > 20000
  ) {
    return NextResponse.json(
      {
        error:
          "Need full name, phone, email, property address, and a realistic square footage (200–20000).",
      },
      { status: 400 },
    );
  }

  const estimatedHours = estimateCleaningHours(propertySqft);
  const totalCents = calculateHousekeepingTotalCents(estimatedHours);

  const booking = await createHousekeepingBooking({
    customerName,
    customerPhone,
    customerEmail,
    propertyAddress,
    propertySqft,
    estimatedHours,
    serviceTier: body.serviceTier ?? "standard",
    notes: body.notes?.trim() || undefined,
    preferredDate: body.preferredDate?.trim() || undefined,
    preferredTime: body.preferredTime?.trim() || undefined,
    totalCents,
  });

  if (!getStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Housekeeping — ${estimatedHours}-hour cleaning`,
              description: `${propertyAddress} · ~${propertySqft} sqft · Local Girls Cleaning`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/housekeeping/success/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/housekeeping?canceled=1`,
      metadata: {
        booking_id: booking.id,
        product: "housekeeping",
        sqft: String(propertySqft),
        hours: String(estimatedHours),
      },
    });

    if (session.id) {
      await setHousekeepingStripeSession(booking.id, session.id);
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      bookingId: booking.id,
      totalLabel: formatUSD(totalCents),
    });
  } catch (err) {
    console.error("[housekeeping] Stripe session create failed:", err);
    return NextResponse.json(
      {
        error: `Couldn't start checkout: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 500 },
    );
  }
}
