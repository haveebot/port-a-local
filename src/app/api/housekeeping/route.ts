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
    mode?: "pay" | "quote";
    emergency?: boolean;
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
  const mode: "pay" | "quote" = body.mode === "quote" ? "quote" : "pay";

  // Quote mode: sqft is optional (the customer might not know it; the
  // whole point is we'll quote them). Pay mode: sqft is required for
  // the live estimate -> Stripe Checkout.
  const sqftRequired = mode === "pay";
  const sqftValid =
    Number.isFinite(propertySqft) &&
    propertySqft >= 200 &&
    propertySqft <= 20000;

  if (
    customerName.length < 2 ||
    customerPhone.replace(/\D/g, "").length < 10 ||
    !customerEmail.includes("@") ||
    propertyAddress.length < 5 ||
    (sqftRequired && !sqftValid)
  ) {
    return NextResponse.json(
      {
        error:
          mode === "pay"
            ? "Need full name, phone, email, property address, and a realistic square footage (200–20000) to give you the live price."
            : "Need full name, phone, email, and property address. We'll quote scope after we hear from you.",
      },
      { status: 400 },
    );
  }

  // Emergency fee: $50 flat surcharge for sub-24-hour turnaround.
  // Pay mode only — quote mode prices everything case-by-case.
  const EMERGENCY_FEE_CENTS = 5000;
  const isEmergency = mode === "pay" && body.emergency === true;

  // Hours + base price only computed in pay mode; in quote mode we
  // store 0/0 placeholders and let PAL fill them in when the quote is
  // sent.
  const estimatedHours =
    mode === "pay" ? estimateCleaningHours(propertySqft) : 0;
  const baseTotalCents =
    mode === "pay" ? calculateHousekeepingTotalCents(estimatedHours) : 0;
  const emergencyFeeCents = isEmergency ? EMERGENCY_FEE_CENTS : 0;
  const totalCents = baseTotalCents + emergencyFeeCents;

  const booking = await createHousekeepingBooking({
    customerName,
    customerPhone,
    customerEmail,
    propertyAddress,
    propertySqft: sqftValid ? propertySqft : 0,
    estimatedHours,
    serviceTier: body.serviceTier ?? "standard",
    notes: body.notes?.trim() || undefined,
    preferredDate: body.preferredDate?.trim() || undefined,
    preferredTime: body.preferredTime?.trim() || undefined,
    totalCents,
    mode,
    emergencyFeeCents,
    status: mode === "quote" ? "quote-requested" : "placed",
  });

  // Quote mode: no Stripe call. Just record + return — the form
  // success state handles the "we'll get back to you" UX.
  // (Email cascade for admin notification could fire here; v1 is the
  // existing housekeeping-dispatch helper which already mirrors to
  // Wheelhouse on placed→paid; we can add a quote-requested branch
  // later if Winston wants louder signal.)
  if (mode === "quote") {
    return NextResponse.json({
      ok: true,
      mode: "quote",
      bookingId: booking.id,
    });
  }

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
            unit_amount: baseTotalCents,
          },
          quantity: 1,
        },
        ...(isEmergency
          ? [
              {
                price_data: {
                  currency: "usd" as const,
                  product_data: {
                    name: "Emergency / quick-turnaround fee",
                    description:
                      "Flat surcharge for sub-24-hour scheduling on this booking.",
                  },
                  unit_amount: emergencyFeeCents,
                },
                quantity: 1,
              },
            ]
          : []),
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
