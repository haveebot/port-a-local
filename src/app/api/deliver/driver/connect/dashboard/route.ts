import { NextRequest, NextResponse } from "next/server";
import { getDeliverStripe, getDeliverStripeKey } from "@/lib/deliverStripe";
import { getApiRunner } from "@/lib/runnerSession";
import { getDriverStatus } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/driver/connect/dashboard
 *
 * Returns a one-time URL into the runner's Stripe Express dashboard.
 * From there they can see balance, payout schedule, trigger an instant
 * payout (Stripe charges 1.5%), update bank info, etc.
 *
 * createLoginLink URLs are single-use and short-lived, so we mint fresh
 * on every click rather than caching.
 */
export async function POST(req: NextRequest) {
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  if (!getDeliverStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured for /deliver." },
      { status: 500 },
    );
  }

  const status = await getDriverStatus(driver.id);
  if (!status.stripeAccountId) {
    return NextResponse.json(
      { error: "Finish payout setup first." },
      { status: 400 },
    );
  }

  const stripe = getDeliverStripe();
  try {
    const link = await stripe.accounts.createLoginLink(status.stripeAccountId);
    return NextResponse.json({ ok: true, url: link.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[connect dashboard] createLoginLink failed:", msg);
    return NextResponse.json(
      { error: `Couldn't open Stripe dashboard: ${msg}` },
      { status: 500 },
    );
  }
}
