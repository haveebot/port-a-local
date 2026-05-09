import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getBronsProduct, splitTotal } from "@/data/brons-products";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

/**
 * Bron's Beach Rentals checkout — staging build for the bronsbeach.com
 * demo, 2026-05-09.
 *
 * The 12% PAL platform fee is computed server-side from the trusted
 * catalog. In production (post-Bron's-Connect-onboarding), this becomes
 * a Stripe Connect Direct Charge with `application_fee_amount` and
 * `payment_intent_data.transfer_data.destination = <bron's connected
 * account ID>` so the 88% lands in his account daily, automatically.
 *
 * For the staging demo (no connected account yet), the split is recorded
 * in metadata only — the actual transfer becomes real when the env var
 * STRIPE_BRONS_CONNECTED_ACCT_ID is set on the production deployment.
 */

const APP_URL =
  process.env.NEXT_PUBLIC_BRONS_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://bronsbeach.com";

const BRONS_CONNECTED_ACCT_ID = process.env.STRIPE_BRONS_CONNECTED_ACCT_ID || "";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    phone,
    email,
    product,
    pickupDate,
    returnDate,
    accessPoint,
    numDays,
  } = body;

  if (!name || !phone || !email || !product || !pickupDate || !returnDate || !accessPoint || !numDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const catalog = getBronsProduct(product);
  if (!catalog) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const days = Number(numDays);
  if (!Number.isFinite(days) || days < 1 || days > 30) {
    return NextResponse.json({ error: "Invalid numDays" }, { status: 400 });
  }

  // SERVER-COMPUTED amounts. Never trust client.
  const totalCents = catalog.dailyTotalCents * days;
  const { palFeeCents, vendorCents } = splitTotal(totalCents);

  try {
    // Build the checkout session config. When connected-account env is
    // set, attach Connect transfer data so the 88% routes to Bron's
    // account; otherwise the charge lands in PAL's main account and the
    // split is metadata-only (manual reconciliation during staging).
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: totalCents,
            product_data: {
              name: `${catalog.label} — Bron's Beach Rentals`,
              description: `${days} day${days !== 1 ? "s" : ""} · ${pickupDate} → ${returnDate} · ${accessPoint} · Free cancellation up to 24 hours before start`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "brons-beach-rental",
        name,
        phone,
        email,
        product,
        pickupDate,
        returnDate,
        accessPoint,
        numDays: String(days),
        total_cents: String(totalCents),
        pal_fee_cents: String(palFeeCents),
        vendor_cents: String(vendorCents),
        revenue_share_pct: "12",
      },
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/`,
    };

    if (BRONS_CONNECTED_ACCT_ID) {
      // Stripe Connect Direct Charge mode — application_fee_amount is
      // PAL's 12% cut; the rest auto-transfers to Bron's connected acct
      sessionConfig.payment_intent_data = {
        application_fee_amount: palFeeCents,
        transfer_data: {
          destination: BRONS_CONNECTED_ACCT_ID,
        },
      };
    }

    const session = await getStripe().checkout.sessions.create(sessionConfig);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout/Brons] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
