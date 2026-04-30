import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getListingById } from "@/data/locals-listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

function getStripeKey(): string | undefined {
  return (process.env.STRIPE_SECRET_KEY ?? "").trim() || undefined;
}

function getStripe(): Stripe {
  const key = getStripeKey();
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

const PAL_FEE_PCT = 0.10;

/**
 * POST /api/locals/buy/[listingId]
 * Body: { customerName, customerEmail, customerPhone?, message? }
 *
 * Creates a Stripe Checkout session for buying a sell-mode listing.
 *
 * Pricing breakdown (consistent with the locals 10% platform-fee model):
 *   - Vendor's priceCents (vendor keeps 100%)
 *   - PAL platform fee = 10% on top (customer covers; locals never see deduction)
 *   - Total customer pays = priceCents + (priceCents * 0.10)
 *
 * If the vendor has a stripeAccountId on file, the Checkout session uses
 * `payment_intent_data.transfer_data.destination` so the vendor's
 * priceCents lands directly in their Connect account; PAL retains the fee
 * automatically. If no Connect account, customer can still buy — PAL
 * holds the funds and pays the vendor manually (v1 fallback for
 * vendors who haven't onboarded to Stripe Connect yet).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  const listing = getListingById(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.mode !== "sell") {
    return NextResponse.json(
      { error: "This listing isn't for sale (it's a rent or hire listing)." },
      { status: 400 },
    );
  }
  if (!listing.priceCents || listing.priceCents < 100) {
    return NextResponse.json(
      { error: "Listing has no valid price set." },
      { status: 400 },
    );
  }
  if (listing.soldOut) {
    return NextResponse.json(
      { error: "Sorry — sold out." },
      { status: 410 },
    );
  }
  if (!listing.isActive) {
    return NextResponse.json(
      { error: "Listing is not currently active." },
      { status: 410 },
    );
  }

  let body: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const customerName = (body.customerName ?? "").trim();
  const customerEmail = (body.customerEmail ?? "").trim();
  const customerPhone = (body.customerPhone ?? "").trim();
  const message = (body.message ?? "").trim();

  if (
    customerName.length < 2 ||
    !customerEmail.includes("@") ||
    customerPhone.replace(/\D/g, "").length < 10
  ) {
    return NextResponse.json(
      {
        error:
          "Need full name, email, and phone so the vendor can reach you for fulfillment.",
      },
      { status: 400 },
    );
  }

  if (!getStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const vendorAmountCents = listing.priceCents;
  const palFeeCents = Math.round(vendorAmountCents * PAL_FEE_PCT);
  const totalCents = vendorAmountCents + palFeeCents;

  try {
    const stripe = getStripe();

    // Build Checkout params; conditionally tack on transfer_data.destination
    // when vendor has Connect onboarding done.
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: `${listing.provider} · ${listing.fulfillmentNote ?? "Vendor will reach out for fulfillment"}`,
            },
            unit_amount: vendorAmountCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PAL platform fee",
              description: "Keeps PAL Locals running. 10% of order.",
            },
            unit_amount: palFeeCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/locals/buy-success/${listing.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/locals#${listing.id}`,
      metadata: {
        listing_id: listing.id,
        product: "locals-sell",
        vendor: listing.provider,
        customer_name: customerName,
        customer_phone: customerPhone,
        ...(message ? { customer_message: message.slice(0, 400) } : {}),
      },
    };

    if (listing.stripeAccountId) {
      // Connect destination charge: customer card → PAL account; PAL
      // automatically transfers `amount` to the vendor's account on
      // capture, retaining the rest as PAL revenue. We move ONLY
      // vendorAmountCents to the vendor; PAL keeps the fee + Stripe's
      // transaction fee comes out of PAL's side.
      checkoutParams.payment_intent_data = {
        transfer_data: {
          destination: listing.stripeAccountId,
          amount: vendorAmountCents,
        },
        metadata: {
          listing_id: listing.id,
          vendor_amount_cents: String(vendorAmountCents),
          pal_fee_cents: String(palFeeCents),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[locals buy] Stripe checkout failed:", err);
    return NextResponse.json(
      {
        error: `Couldn't start checkout: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 500 },
    );
  }
}
