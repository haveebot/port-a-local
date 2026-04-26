import { NextRequest, NextResponse } from "next/server";
import { getDeliverStripe, getDeliverStripeKey } from "@/lib/deliverStripe";
import { getDriverByToken } from "@/data/delivery-drivers";
import {
  getDriverStatus,
  setDriverStripeAccount,
} from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://theportalocal.com";

/**
 * POST /api/deliver/driver/connect/start?t=<driver_token>
 *
 * Creates a Stripe Connect Express account for the driver if one doesn't
 * exist, then returns an Account Link URL for them to complete onboarding
 * (Stripe-hosted form: identity verification + bank account).
 *
 * Requires Stripe Connect enabled on the platform — Winston must one-time
 * enable at https://dashboard.stripe.com/connect/overview before this
 * endpoint will work.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = await getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
  }
  if (!getDeliverStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured for /deliver." },
      { status: 500 },
    );
  }
  const stripe = getDeliverStripe();

  let status = await getDriverStatus(driver.id);
  let accountId = status.stripeAccountId;

  // Create Express account on first run
  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: driver.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          driver_id: driver.id,
          driver_name: driver.name,
          source: "pal-delivery",
        },
      });
      accountId = account.id;
      await setDriverStripeAccount(driver.id, accountId, false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error("[connect start] account.create failed:", msg);
      return NextResponse.json(
        {
          error:
            "Couldn't create your payout account. " +
            (msg.includes("not yet active") || msg.includes("not enabled")
              ? "Stripe Connect isn't enabled on the PAL platform yet — Winston needs to flip it on in the dashboard."
              : msg),
        },
        { status: 500 },
      );
    }
  }

  // Create the Account Link the driver clicks to complete onboarding
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(driver.token)}`,
      return_url: `${APP_URL}/deliver/driver/payouts?t=${encodeURIComponent(driver.token)}&from=stripe`,
      type: "account_onboarding",
    });
    return NextResponse.json({ ok: true, url: accountLink.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[connect start] accountLink.create failed:", msg);
    return NextResponse.json(
      { error: `Couldn't create onboarding link: ${msg}` },
      { status: 500 },
    );
  }
}
