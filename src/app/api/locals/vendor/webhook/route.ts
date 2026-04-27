import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getLocalsOfferByStripeAccount,
  setLocalsOfferStripeAccount,
} from "@/data/locals-store";
import { getLocalsStripe, getLocalsStripeKey } from "@/lib/localsStripe";
import { mirrorLocalsVendorPayoutsLive } from "@/lib/localsDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/locals/vendor/webhook
 *
 * Stripe Connect webhook receiver. Listens for `account.updated`
 * events on connected Express accounts and flips
 * `stripe_payouts_enabled` on the matching locals_offers row when
 * Stripe confirms transfers + payouts are live.
 *
 * Wiring (one-time, in Stripe dashboard):
 *   Connect → Webhooks → Add endpoint
 *   URL: https://theportalocal.com/api/locals/vendor/webhook
 *   Events: account.updated
 *   Copy the signing secret → set STRIPE_LOCALS_CONNECT_WEBHOOK_SECRET
 *   in Vercel (Production env, Sensitive).
 *
 * The refresh route is the synchronous path the vendor portal page
 * calls on return-from-Stripe; this webhook is the async ground-truth
 * path for state changes that happen outside our flow (e.g. Stripe
 * restricts an account, vendor adds a missing piece via Stripe email,
 * etc.).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_LOCALS_CONNECT_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[locals vendor webhook] STRIPE_LOCALS_CONNECT_WEBHOOK_SECRET missing — refusing webhook to avoid processing unauthenticated payloads.",
    );
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 500 },
    );
  }
  if (!getLocalsStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();
  const stripe = getLocalsStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[locals vendor webhook] signature verify failed:", msg);
    return NextResponse.json(
      { error: `Bad signature: ${msg}` },
      { status: 400 },
    );
  }

  if (event.type !== "account.updated") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const account = event.data.object as Stripe.Account;
  if (!account?.id) {
    return NextResponse.json({ ok: true, ignored: "no account id" });
  }

  const offer = await getLocalsOfferByStripeAccount(account.id);
  if (!offer) {
    // Webhook for an account we don't track — ignore quietly. Could
    // be from /deliver Connect accounts if one secret routes here by
    // mistake, or pre-deletion stragglers.
    return NextResponse.json({ ok: true, ignored: "no offer" });
  }

  const payoutsEnabled =
    account.payouts_enabled === true && account.charges_enabled === true;
  const wasEnabled = offer.stripePayoutsEnabled;

  await setLocalsOfferStripeAccount(offer.id, account.id, payoutsEnabled);

  // Mirror only on the false → true transition so the Wheelhouse
  // ticker doesn't get spammed by every account.updated event Stripe
  // fires (they fire often during onboarding).
  if (!wasEnabled && payoutsEnabled) {
    await mirrorLocalsVendorPayoutsLive(
      offer.businessName || offer.name,
      offer.id,
    );
  }

  return NextResponse.json({ ok: true, payoutsEnabled });
}
