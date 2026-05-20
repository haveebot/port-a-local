import { NextResponse } from "next/server";
import { listClaimsReadyForPayout } from "@/data/beach-claim-store";
import { attemptBeachPayout } from "@/lib/beachPayouts";
import { sendSms } from "@/lib/twilioSms";
import { beachVendors } from "@/data/beach-vendors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPERATOR_PHONE_E164 = "+15125681725"; // Winston

/**
 * Vercel Cron: beach vendor auto-payouts
 * Schedule: every hour (configured in vercel.json)
 *
 * Sweeps `beach_booking_claims` for entries that are:
 *   - claimed by a vendor
 *   - not yet paid out
 *   - past the 72hr-before-setup mark (refund window closed)
 *   - vendor has Stripe Connect Express set up + payouts_enabled
 *
 * For each match: fires Stripe transfer to the vendor's Connect
 * account, marks the claim paid_out, logs result. Stripe idempotency
 * key prevents double-charges if cron re-fires before the row update
 * completes.
 *
 * Vendors whose claim is past 72hr but who haven't onboarded Stripe
 * Connect yet: skipped + flagged. Push SMS to operator (Winston) so
 * he can either chase the vendor to onboard or pay out manually.
 *
 * Auth: Vercel CRON_SECRET bearer (matches /api/wheelhouse/cron/pulse).
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const eligible = await listClaimsReadyForPayout();
  if (eligible.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, paid: 0 });
  }

  const results: Array<{
    sessionId: string;
    vendor: string | null;
    amountCents: number | null;
    ok: boolean;
    skipReason?: string;
    error?: string;
    transferId?: string;
  }> = [];

  let paidCount = 0;
  let skippedNoConnect = 0;
  let skippedManualOnly = 0;
  for (const claim of eligible) {
    // Out-of-band vendors (e.g. Bron's during the pre-Connect period):
    // operator settles payouts directly. Skip the cron entirely — no
    // Stripe transfer attempt, no contribution to skippedNoConnect, no
    // operator nudge SMS.
    const vendor = beachVendors.find((v) => v.slug === claim.claimedBySlug);
    if (vendor?.manualPayoutsOnly) {
      results.push({
        sessionId: claim.stripeSessionId,
        vendor: claim.claimedBySlug,
        amountCents: claim.vendorAmountCents,
        ok: true,
        skipReason: "manual-payouts-only",
      });
      skippedManualOnly++;
      continue;
    }
    const r = await attemptBeachPayout(claim);
    results.push({
      sessionId: claim.stripeSessionId,
      vendor: claim.claimedBySlug,
      amountCents: claim.vendorAmountCents,
      ok: r.ok,
      skipReason: r.skipReason,
      error: r.error,
      transferId: r.transferId,
    });
    if (r.ok) paidCount++;
    if (r.skipReason === "no-stripe-account" || r.skipReason === "payouts-not-enabled") {
      skippedNoConnect++;
    }
  }

  // Push to Winston if any vendor is past the refund window but can't
  // be paid (no Stripe Connect or not enabled). Operational nudge.
  if (skippedNoConnect > 0) {
    const blocked = results
      .filter((r) => r.skipReason === "no-stripe-account" || r.skipReason === "payouts-not-enabled")
      .map((r) => `${r.vendor} ($${((r.amountCents ?? 0) / 100).toFixed(2)})`)
      .join(", ");
    sendSms(
      OPERATOR_PHONE_E164,
      `[Beach payouts] ${skippedNoConnect} vendor(s) past refund window but Stripe Connect not enabled: ${blocked}. Either nudge them to onboard or pay manually.`.slice(0, 1500),
    ).catch((err) =>
      console.error("[cron/beach-payouts] operator notify failed:", err),
    );
  }

  return NextResponse.json({
    ok: true,
    scanned: eligible.length,
    paid: paidCount,
    skipped_no_connect: skippedNoConnect,
    skipped_manual_only: skippedManualOnly,
    results,
  });
}
