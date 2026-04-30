/**
 * Beach vendor payout — fires Stripe transfer to a claiming vendor's
 * Connect Express account once the 72hr-before-setup refund window
 * has closed.
 *
 * Triggered two ways:
 *   1. Auto: /api/cron/beach-payouts hourly cron sweeps eligible claims
 *   2. Manual: /wheelhouse/beach-payouts admin tool button per claim
 *
 * Both call attemptPayout() — same idempotency, same Stripe machinery.
 *
 * Idempotency:
 *   - Stripe transfer uses idempotencyKey = `beach-payout-${sessionId}`
 *   - markBeachPaidOut UPDATE WHERE paid_out_at IS NULL — only one
 *     successful UPDATE; subsequent attempts return false
 *   - Combined: even if cron + manual fire the same instant, only
 *     one Stripe charge happens AND only one record-update succeeds
 */

import Stripe from "stripe";
import {
  type BeachBookingClaim,
  markBeachPaidOut,
} from "@/data/beach-claim-store";
import { getBeachVendorStatus } from "@/data/beach-vendor-status";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

export interface PayoutResult {
  ok: boolean;
  transferId?: string;
  amountCents?: number;
  error?: string;
  skipReason?:
    | "no-claim"
    | "no-vendor"
    | "no-stripe-account"
    | "payouts-not-enabled"
    | "already-paid-out"
    | "no-amount";
}

/**
 * Fire the vendor payout for a single beach claim. Safe to call
 * concurrently — Stripe idempotency key + DB UPDATE WHERE clause
 * make double-fires no-ops.
 */
export async function attemptBeachPayout(
  claim: BeachBookingClaim,
): Promise<PayoutResult> {
  if (!claim.claimedBySlug) {
    return { ok: false, skipReason: "no-claim" };
  }
  if (claim.paidOutAt) {
    return { ok: false, skipReason: "already-paid-out" };
  }
  if (!claim.vendorAmountCents || claim.vendorAmountCents <= 0) {
    return { ok: false, skipReason: "no-amount" };
  }
  const status = await getBeachVendorStatus(claim.claimedBySlug);
  if (!status.stripeAccountId) {
    return { ok: false, skipReason: "no-stripe-account" };
  }
  if (!status.payoutsEnabled) {
    return { ok: false, skipReason: "payouts-not-enabled" };
  }

  try {
    const transfer = await getStripe().transfers.create(
      {
        amount: claim.vendorAmountCents,
        currency: "usd",
        destination: status.stripeAccountId,
        metadata: {
          booking_session_id: claim.stripeSessionId,
          vendor_slug: claim.claimedBySlug,
          source: "pal-beach-payout",
        },
      },
      {
        idempotencyKey: `beach-payout-${claim.stripeSessionId}`,
      },
    );
    const marked = await markBeachPaidOut(claim.stripeSessionId, transfer.id);
    if (!marked) {
      // Race lost — another fire-path already marked. Stripe idempotency
      // means we either got the same transfer back (no double-charge) or
      // hit a 200 OK no-op. Either way, the system is consistent.
      console.warn(
        `[beach-payout] race-loss for ${claim.stripeSessionId} — DB already marked; transfer ${transfer.id}`,
      );
    }
    return {
      ok: true,
      transferId: transfer.id,
      amountCents: claim.vendorAmountCents,
    };
  } catch (err) {
    console.error(
      `[beach-payout] transfer failed for ${claim.stripeSessionId}:`,
      err,
    );
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
