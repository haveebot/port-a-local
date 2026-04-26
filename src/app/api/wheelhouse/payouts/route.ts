import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDeliverStripe, getDeliverStripeKey } from "@/lib/deliverStripe";
import {
  getDriverById,
  getDriverStatus,
  hasDriverTransfer as hasDriverTransferRow,
  recordDriverTransfer,
} from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/wheelhouse/payouts
 * Body: { driverId: string, amountCents: number, memo?: string }
 *
 * Wheelhouse-only admin tool for sending one-off Stripe Connect transfers
 * to runners outside the normal order-tied auto-payout flow. Useful for
 * bonuses, tips, profit-share, mid-month settlements, etc.
 *
 * Auth: piggybacks on the wheelhouse_who cookie (same gate as the rest of
 * /wheelhouse). No separate token. The cookie value is recorded on the
 * Stripe transfer's metadata so we have a "who initiated this" audit trail.
 *
 * Records the transfer in delivery_driver_transfers with a `custom-...`
 * order_id (vs. real `ord-...` orders) so the same idempotency + audit
 * machinery applies.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }
  if (!getDeliverStripeKey()) {
    return NextResponse.json(
      { error: "Stripe not configured for /deliver." },
      { status: 500 },
    );
  }

  let body: {
    driverId?: string;
    amountCents?: number;
    memo?: string;
    sourceTransaction?: string;
    customId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { driverId, amountCents, memo, sourceTransaction, customId: customIdInput } = body;

  if (!driverId || typeof driverId !== "string") {
    return NextResponse.json(
      { error: "driverId required" },
      { status: 400 },
    );
  }
  if (
    typeof amountCents !== "number" ||
    !Number.isFinite(amountCents) ||
    !Number.isInteger(amountCents) ||
    amountCents < 100
  ) {
    return NextResponse.json(
      { error: "amountCents must be an integer ≥ 100 (one dollar)" },
      { status: 400 },
    );
  }
  // Soft cap to prevent fat-finger six-figure transfers. Bypass by
  // splitting into multiple sends.
  if (amountCents > 1_000_000) {
    return NextResponse.json(
      {
        error:
          "Refusing transfers over $10,000 in a single shot — split into multiple if intended.",
      },
      { status: 400 },
    );
  }

  const driver = await getDriverById(driverId);
  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }
  const status = await getDriverStatus(driverId);
  if (!status.stripeAccountId || !status.payoutsEnabled) {
    return NextResponse.json(
      {
        error:
          "Driver hasn't completed Stripe Connect onboarding — can't send transfer.",
      },
      { status: 400 },
    );
  }

  // Allow caller to supply an existing custom_id (e.g. "backfill-{orderId}")
  // so backfills are also idempotent in the transfers ledger — second click
  // on the Backfill button hits the unique-PK and no-ops at the DB layer.
  const customId =
    customIdInput && customIdInput.length > 0
      ? customIdInput
      : `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const trimmedMemo = (memo ?? "").trim().slice(0, 140);
  const trimmedSource = (sourceTransaction ?? "").trim();

  // Idempotency check using the existing transfer ledger
  if (await hasDriverTransferRow(customId)) {
    return NextResponse.json(
      { error: "Already paid out under this id." },
      { status: 409 },
    );
  }

  const stripe = getDeliverStripe();
  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: status.stripeAccountId,
      transfer_group: customId,
      // Optional source_transaction — when present, ties the transfer
      // to a specific PaymentIntent / charge so Stripe can fund from
      // THAT charge even if available balance is $0. Backfill flow
      // uses this to bypass the pending-charge waiting period.
      ...(trimmedSource ? { source_transaction: trimmedSource } : {}),
      metadata: {
        custom_id: customId,
        driver_id: driverId,
        driver_name: driver.name,
        memo: trimmedMemo,
        source: "pal-delivery-custom-payout",
        initiated_by: who,
        funding_mode: trimmedSource ? "source-transaction" : "balance",
      },
    });
    await recordDriverTransfer(customId, driverId, transfer.id, amountCents);
    console.log(
      `[wheelhouse/payouts] custom payout ${customId} → ${driver.name} ($${(amountCents / 100).toFixed(2)}) by ${who} — transfer ${transfer.id} — funded via ${trimmedSource ? "source_transaction" : "balance"}${trimmedMemo ? ` — memo: ${trimmedMemo}` : ""}`,
    );
    return NextResponse.json({
      ok: true,
      customId,
      transferId: transfer.id,
      driver: { id: driver.id, name: driver.name },
      amountCents,
      memo: trimmedMemo,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[wheelhouse/payouts] transfer failed:", msg);
    return NextResponse.json(
      { error: `Stripe transfer failed: ${msg}` },
      { status: 500 },
    );
  }
}
