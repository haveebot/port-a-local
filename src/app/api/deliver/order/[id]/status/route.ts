import { NextRequest, NextResponse } from "next/server";
import {
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
