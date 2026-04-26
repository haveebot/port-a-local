import { NextRequest, NextResponse } from "next/server";
import {
  getDeliveredCountForDriver,
  getDriverStatus,
  getOrder,
  hasDriverTransfer,
  recordDriverTransfer,
  transitionOrder,
} from "@/data/delivery-store";
import { getApiRunner } from "@/lib/runnerSession";
import {
  mirrorToWheelhouse,
  notifyCustomerDelivered,
  notifyCustomerPickedUp,
} from "@/lib/deliverDispatch";
import { getDeliverStripe, getDeliverStripeKey } from "@/lib/deliverStripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/order/[id]/status?t=<driver_token>
 * Body: { status: "picked_up" | "delivered" }
 *
 * Driver-only transition. Picked_up only valid from claimed; delivered
 * only valid from picked_up.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const driver = await getApiRunner(req);
  if (!driver) {
    return NextResponse.json({ error: "Not signed in" }, { status: 403 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const next = body.status;
  if (next !== "picked_up" && next !== "delivered") {
    return NextResponse.json(
      { error: "status must be 'picked_up' or 'delivered'" },
      { status: 400 },
    );
  }

  const order = await transitionOrder(id, next, driver.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== next) {
    // Transition was a no-op — invalid prerequisite
    return NextResponse.json(
      {
        ok: false,
        error: `Can't transition to ${next} from ${order.status}.`,
        currentStatus: order.status,
      },
      { status: 409 },
    );
  }

  await mirrorToWheelhouse(order, next);
  if (next === "picked_up") {
    // Belt-and-suspenders: SMS (best-effort pre-A2P) + email (reliable)
    const { sendCustomerPickedUpEmail } = await import("@/lib/deliverEmails");
    await Promise.all([
      notifyCustomerPickedUp(order, true),
      sendCustomerPickedUpEmail(order),
    ]);
  } else {
    const { sendCustomerDeliveredEmail } = await import("@/lib/deliverEmails");
    await Promise.all([
      notifyCustomerDelivered(order, true),
      sendCustomerDeliveredEmail(order),
    ]);
    // Auto-transfer driver payout via Stripe Connect (best-effort, idempotent)
    void triggerDriverPayout(order.id, driver.id, order.driverPayoutCents).catch(
      (err) => console.error("[deliver] driver payout transfer failed:", err),
    );
    // First-delivery welcome bonus ($5). Idempotent — uses a custom
    // ledger row keyed on driver-id so it can never fire twice for the
    // same runner. Fires AFTER the order payout so the runner sees the
    // bonus as a separate Stripe transfer line.
    void triggerFirstDeliveryBonus(driver.id).catch((err) =>
      console.error("[deliver] first-delivery bonus failed:", err),
    );
  }

  return NextResponse.json({ ok: true, order });
}

/**
 * Idempotent driver payout via Stripe Connect transfer. Skips if:
 *   - Driver hasn't completed Stripe Connect onboarding
 *   - Already paid for this order
 *   - Order paid amount is 0
 *
 * Logs and returns; never throws (keeps the delivery transition succeeding
 * even if payout fails — Winston can retry manually).
 */
async function triggerDriverPayout(
  orderId: string,
  driverId: string,
  amountCents: number,
): Promise<void> {
  if (amountCents <= 0) return;
  if (await hasDriverTransfer(orderId)) {
    console.log(`[payout] order ${orderId} already paid out — skipping`);
    return;
  }
  const status = await getDriverStatus(driverId);
  if (!status.stripeAccountId || !status.payoutsEnabled) {
    console.log(
      `[payout] driver ${driverId} not Connect-onboarded — Venmo manually for order ${orderId}`,
    );
    return;
  }
  if (!getDeliverStripeKey()) {
    console.error("[payout] STRIPE key missing for /deliver");
    return;
  }
  const stripe = getDeliverStripe();
  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: status.stripeAccountId,
      transfer_group: orderId,
      metadata: {
        order_id: orderId,
        driver_id: driverId,
        source: "pal-delivery-auto-payout",
      },
    });
    await recordDriverTransfer(orderId, driverId, transfer.id, amountCents);
    console.log(
      `[payout] order ${orderId} → driver ${driverId} ($${(amountCents / 100).toFixed(2)}) transfer ${transfer.id}`,
    );
  } catch (err) {
    console.error(
      `[payout] Stripe transfer failed for order ${orderId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * First-delivery welcome bonus — $5 to the runner's Stripe Connect
 * balance after their first ever delivered order. Idempotent via a
 * synthetic order_id ('bonus-first-{driverId}') in the existing
 * transfer ledger; same row will only ever insert once.
 *
 * Skips if:
 *   - Runner has already completed prior deliveries (we only count 1)
 *   - Bonus already fired (synthetic id already in ledger)
 *   - Stripe Connect not yet onboarded (will need manual backfill —
 *     same as the regular payout case)
 *
 * Logs + swallows errors. Never throws — won't block the delivery.
 */
const FIRST_DELIVERY_BONUS_CENTS = 500;

async function triggerFirstDeliveryBonus(driverId: string): Promise<void> {
  const bonusOrderId = `bonus-first-${driverId}`;
  if (await hasDriverTransfer(bonusOrderId)) {
    // Already fired for this runner. No-op.
    return;
  }
  const deliveredCount = await getDeliveredCountForDriver(driverId);
  if (deliveredCount !== 1) {
    // Either zero (somehow we got here too early) or 2+ (not their
    // first). Either way: don't fire.
    return;
  }
  const status = await getDriverStatus(driverId);
  if (!status.stripeAccountId || !status.payoutsEnabled) {
    console.log(
      `[bonus] driver ${driverId} not Connect-onboarded — first-delivery bonus deferred`,
    );
    return;
  }
  if (!getDeliverStripeKey()) {
    console.error("[bonus] STRIPE key missing for /deliver");
    return;
  }
  const stripe = getDeliverStripe();
  try {
    const transfer = await stripe.transfers.create({
      amount: FIRST_DELIVERY_BONUS_CENTS,
      currency: "usd",
      destination: status.stripeAccountId,
      transfer_group: bonusOrderId,
      metadata: {
        bonus_kind: "first-delivery",
        driver_id: driverId,
        source: "pal-delivery-first-delivery-bonus",
      },
      description: "Welcome to PAL — first-delivery bonus 🎉",
    });
    await recordDriverTransfer(
      bonusOrderId,
      driverId,
      transfer.id,
      FIRST_DELIVERY_BONUS_CENTS,
    );
    console.log(
      `[bonus] driver ${driverId} first-delivery $5 bonus → transfer ${transfer.id}`,
    );
  } catch (err) {
    console.error(
      `[bonus] Stripe transfer failed for driver ${driverId} first-delivery bonus:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Customer-facing tracker needs anonymous runner info — Driver #N
  // (signup-number) + vehicle. Never the runner's real name.
  let runner: {
    signupNumber: number;
    vehicle: string | null;
  } | null = null;
  if (order.driverId) {
    const { sql } = await import("@vercel/postgres");
    const { rows } = await sql`
      WITH numbered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY applied_at ASC, id ASC) AS signup_num
        FROM delivery_drivers
      )
      SELECT n.signup_num, d.vehicle
      FROM delivery_drivers d
      JOIN numbered n ON n.id = d.id
      WHERE d.id = ${order.driverId}
      LIMIT 1
    `;
    if (rows[0]) {
      runner = {
        signupNumber: Number(rows[0].signup_num),
        vehicle: (rows[0].vehicle as string) ?? null,
      };
    }
  }

  return NextResponse.json({ order, runner });
}
