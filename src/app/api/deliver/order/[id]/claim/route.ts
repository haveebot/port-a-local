import { NextRequest, NextResponse } from "next/server";
import { claimOrder, getOrder } from "@/data/delivery-store";
import { getApiRunner } from "@/lib/runnerSession";
import {
  mirrorToWheelhouse,
  notifyCustomerClaimed,
} from "@/lib/deliverDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/deliver/order/[id]/claim
 *
 * Atomic first-claim-wins. The driver who taps fastest gets the job;
 * everyone else gets a friendly "already claimed" response.
 *
 * Auth: cookie session (preferred) — falls back to ?t=<token> for
 * legacy/email-link callers.
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
  if (!driver.isActive) {
    return NextResponse.json(
      { error: "Driver not active." },
      { status: 403 },
    );
  }

  const won = await claimOrder(id, driver.id);
  if (!won) {
    const current = await getOrder(id);
    return NextResponse.json(
      {
        ok: false,
        reason:
          current?.status === "claimed" || current?.status === "picked_up" || current?.status === "delivered"
            ? "Already claimed by another driver."
            : "Order is no longer dispatching.",
        currentStatus: current?.status,
        claimedBy: current?.driverId,
      },
      { status: 409 },
    );
  }

  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order vanished" }, { status: 500 });
  }

  // Best-effort downstream — failures don't unwind the claim
  await mirrorToWheelhouse(order, "claimed");
  // For now, treat consumer SMS consent as TRUE for delivery customers
  // since they explicitly chose phone-based delivery (form will collect
  // explicit checkbox in v2). Internal note: review when consent UX
  // ships in checkout v2.
  await notifyCustomerClaimed(order, driver.name, true);

  return NextResponse.json({ ok: true, order });
}
