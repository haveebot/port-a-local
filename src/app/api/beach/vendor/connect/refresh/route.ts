import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { beachVendors } from "@/data/beach-vendors";
import {
  getBeachVendorStatus,
  setBeachVendorPayoutsEnabled,
} from "@/data/beach-vendor-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

/**
 * GET /api/beach/vendor/connect/refresh?slug=<slug>
 *
 * Stripe redirects vendors here when an onboarding link expires
 * mid-flow. We re-fetch the account, sync payouts_enabled, and
 * either redirect to the success page (if already onboarded) or
 * issue a new Account Link.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const vendor = beachVendors.find((v) => v.slug === slug);
  if (!vendor) {
    return NextResponse.json({ error: "Unknown vendor" }, { status: 404 });
  }

  const status = await getBeachVendorStatus(slug);
  if (!status.stripeAccountId) {
    return NextResponse.redirect(`${APP_URL}/beach/vendor/${slug}/connect`);
  }

  const stripe = getStripe();

  // Sync payouts_enabled from Stripe (the source of truth).
  try {
    const account = await stripe.accounts.retrieve(status.stripeAccountId);
    const newlyEnabled = !!account.payouts_enabled;
    if (newlyEnabled !== status.payoutsEnabled) {
      await setBeachVendorPayoutsEnabled(slug, newlyEnabled);
    }
    if (newlyEnabled) {
      return NextResponse.redirect(
        `${APP_URL}/beach/vendor/${slug}/connect?onboarded=1`,
      );
    }
  } catch (err) {
    console.error("[beach/vendor/connect/refresh] retrieve failed:", err);
  }

  // Re-issue onboarding link if not yet enabled.
  try {
    const accountLink = await stripe.accountLinks.create({
      account: status.stripeAccountId,
      refresh_url: `${APP_URL}/api/beach/vendor/connect/refresh?slug=${encodeURIComponent(slug)}`,
      return_url: `${APP_URL}/beach/vendor/${encodeURIComponent(slug)}/connect?onboarded=1`,
      type: "account_onboarding",
    });
    return NextResponse.redirect(accountLink.url);
  } catch (err) {
    console.error("[beach/vendor/connect/refresh] link create failed:", err);
    return NextResponse.redirect(`${APP_URL}/beach/vendor/${slug}/connect?error=1`);
  }
}
