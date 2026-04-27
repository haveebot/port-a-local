import { NextRequest, NextResponse } from "next/server";
import { getLocalsOffer } from "@/data/locals-store";
import { verifyLocalsToken } from "@/lib/locals-hmac";
import { getLocalsStripe, getLocalsStripeKey } from "@/lib/localsStripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/locals/vendor/connect/dashboard?id=OFFER_ID&s=HMAC_SIG
 *
 * Returns a one-time URL into the vendor's Stripe Express dashboard
 * so they can see their balance, payout schedule, update bank info,
 * trigger an instant payout, etc.
 *
 * createLoginLink URLs are single-use and short-lived — mint fresh on
 * every click rather than caching.
 */
export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { error: "Stripe not configured for /locals." },
      { status: 500 },
    );
  }

  const offer = await getLocalsOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
  if (!offer.stripeAccountId) {
    return NextResponse.json(
      { error: "Finish payout setup first." },
      { status: 400 },
    );
  }

  const stripe = getLocalsStripe();
  try {
    const link = await stripe.accounts.createLoginLink(offer.stripeAccountId);
    return NextResponse.json({ ok: true, url: link.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[locals vendor connect dashboard] createLoginLink failed:", msg);
    return NextResponse.json(
      { error: `Couldn't open Stripe dashboard: ${msg}` },
      { status: 500 },
    );
  }
}
