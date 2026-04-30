import { NextRequest, NextResponse } from "next/server";
import {
  getLocalsOffer,
  setLocalsOfferStripeAccount,
} from "@/data/locals-store";
import { verifyLocalsToken } from "@/lib/locals-hmac";
import { getLocalsStripe, getLocalsStripeKey } from "@/lib/localsStripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/locals/vendor/connect/refresh?id=OFFER_ID&s=HMAC_SIG
 *
 * Re-checks the vendor's Stripe Connect account state and stamps the
 * row's stripe_payouts_enabled. Called when the vendor returns from
 * Stripe-hosted onboarding (`?from=stripe-done` on the portal page)
 * so the page can flip into "Live" without waiting for the webhook.
 *
 * Idempotent — safe to hit any time. The webhook handler is the
 * authoritative path; this is a UX nicety so the vendor sees green
 * immediately on return.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const offerId = url.searchParams.get("id") ?? "";
  const sig = url.searchParams.get("s") ?? "";

  if (!verifyLocalsToken("vendor-connect", offerId, sig)) {
    return NextResponse.json(
      { error: "Bad signature on vendor portal link." },
      { status: 403 },
    );
  }
  if (!getLocalsStripeKey()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const offer = await getLocalsOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
  if (!offer.stripeAccountId) {
    return NextResponse.json({
      ok: true,
      hasAccount: false,
      payoutsEnabled: false,
    });
  }

  const stripe = getLocalsStripe();
  try {
    const account = await stripe.accounts.retrieve(offer.stripeAccountId);
    const payoutsEnabled =
      account.payouts_enabled === true && account.charges_enabled === true;
    await setLocalsOfferStripeAccount(
      offer.id,
      offer.stripeAccountId,
      payoutsEnabled,
    );
    return NextResponse.json({
      ok: true,
      hasAccount: true,
      payoutsEnabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[locals vendor connect refresh] failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
