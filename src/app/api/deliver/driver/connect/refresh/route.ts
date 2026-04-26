import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDriverByToken } from "@/data/delivery-drivers";
import {
  getDriverStatus,
  setDriverStripeAccount,
} from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/deliver/driver/connect/refresh?t=<driver_token>
 *
 * Re-checks the driver's Stripe Connect account state. Called when the
 * driver returns from Stripe-hosted onboarding so we can update
 * payouts_enabled in our DB. Idempotent — safe to hit any time.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const status = await getDriverStatus(driver.id);
  if (!status.stripeAccountId) {
    return NextResponse.json({
      ok: true,
      hasAccount: false,
      payoutsEnabled: false,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2026-03-25.dahlia" });
  try {
    const account = await stripe.accounts.retrieve(status.stripeAccountId);
    const payoutsEnabled =
      account.payouts_enabled === true && account.charges_enabled === true;
    await setDriverStripeAccount(
      driver.id,
      status.stripeAccountId,
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
    console.error("[connect refresh] failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
