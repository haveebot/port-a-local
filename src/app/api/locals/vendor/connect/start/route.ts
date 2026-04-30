import { NextRequest, NextResponse } from "next/server";
import {
  getLocalsOffer,
  setLocalsOfferStripeAccount,
} from "@/data/locals-store";
import { verifyLocalsToken } from "@/lib/locals-hmac";
import { getLocalsStripe, getLocalsStripeKey } from "@/lib/localsStripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * POST /api/locals/vendor/connect/start?id=OFFER_ID&s=HMAC_SIG
 *
 * Mints (or re-uses) a Stripe Connect Express account for an approved
 * sell-mode vendor and returns an Account Link URL the vendor clicks
 * to complete onboarding (Stripe-hosted form: identity + bank).
 *
 * Auth: HMAC magic-link (no cookie session — vendors arrive from the
 * approval email). Sig kind is `vendor-connect` so a leaked approve
 * link can't be replayed against this endpoint.
 *
 * On return from Stripe-hosted onboarding the vendor lands back on
 * /locals/vendor/[id]?s=SIG&from=stripe-done, which auto-calls the
 * refresh route to flip stripe_payouts_enabled.
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
  if (offer.mode !== "sell") {
    return NextResponse.json(
      { error: "This vendor portal is for sell-mode listings only." },
      { status: 400 },
    );
  }
  if (!offer.approvedAt) {
    return NextResponse.json(
      { error: "Listing isn't approved yet. Hold tight — Winston reviews these by hand." },
      { status: 403 },
    );
  }

  const stripe = getLocalsStripe();
  let accountId = offer.stripeAccountId;

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        ...(offer.email ? { email: offer.email } : {}),
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          offer_id: offer.id,
          vendor_name: offer.name,
          source: "pal-locals-sell",
        },
      });
      accountId = account.id;
      await setLocalsOfferStripeAccount(offer.id, accountId, false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error("[locals vendor connect start] account.create failed:", msg);
      return NextResponse.json(
        {
          error:
            "Couldn't create your payout account. " +
            (msg.includes("not yet active") || msg.includes("not enabled")
              ? "Stripe Connect isn't enabled on the PAL platform yet — email hello@theportalocal.com and we'll get this unblocked."
              : msg),
        },
        { status: 500 },
      );
    }
  }

  const portalBase = `${APP_URL}/locals/vendor/${offer.id}?s=${sig}`;
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${portalBase}&from=stripe-refresh`,
      return_url: `${portalBase}&from=stripe-done`,
      type: "account_onboarding",
    });
    return NextResponse.json({ ok: true, url: accountLink.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[locals vendor connect start] accountLink.create failed:", msg);
    return NextResponse.json(
      { error: `Couldn't create onboarding link: ${msg}` },
      { status: 500 },
    );
  }
}
