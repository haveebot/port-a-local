import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { beachVendors } from "@/data/beach-vendors";
import {
  getBeachVendorStatus,
  setBeachVendorStripeAccount,
} from "@/data/beach-vendor-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

/**
 * POST /api/beach/vendor/connect/start
 * Body: { slug: string }
 *
 * Creates a Stripe Connect Express account for the beach vendor on
 * first call (idempotent — returns the existing account on retry),
 * then issues an Account Link URL for them to complete Stripe-hosted
 * onboarding (identity verification + bank account).
 *
 * Mirrors the runner Connect pattern in
 * /api/deliver/driver/connect/start. Beach vendors are identified
 * by slug (vs runner_id) since they're statically defined in
 * src/data/beach-vendors.ts (not user-created accounts).
 *
 * Stripe Connect must be one-time enabled on the platform — Winston
 * already did this for runners, so beach vendors share the rails.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body?.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const vendor = beachVendors.find((v) => v.slug === slug);
  if (!vendor) {
    return NextResponse.json({ error: "Unknown vendor" }, { status: 404 });
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }
  const stripe = getStripe();

  let status = await getBeachVendorStatus(slug);
  let accountId = status.stripeAccountId;

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: vendor.email || undefined,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
        metadata: {
          beach_vendor_slug: vendor.slug,
          beach_vendor_name: vendor.name,
          source: "pal-beach",
        },
      });
      accountId = account.id;
      await setBeachVendorStripeAccount(slug, accountId, false);
      status = await getBeachVendorStatus(slug);
    } catch (err) {
      console.error("[beach/vendor/connect/start] account create failed:", err);
      return NextResponse.json(
        { error: "Failed to create Stripe account" },
        { status: 502 },
      );
    }
  }

  // Issue an Account Link for onboarding. URLs route back to the
  // refresh endpoint (re-issues link if expired) and the page
  // (success-display).
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/api/beach/vendor/connect/refresh?slug=${encodeURIComponent(slug)}`,
      return_url: `${APP_URL}/beach/vendor/${encodeURIComponent(slug)}/connect?onboarded=1`,
      type: "account_onboarding",
    });
    return NextResponse.json({
      ok: true,
      onboardingUrl: accountLink.url,
      stripeAccountId: accountId,
      payoutsEnabled: status.payoutsEnabled,
    });
  } catch (err) {
    console.error("[beach/vendor/connect/start] accountLink failed:", err);
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 502 },
    );
  }
}
