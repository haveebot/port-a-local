import { NextRequest, NextResponse } from "next/server";
import { getOrder, transitionOrder } from "@/data/delivery-store";
import { getDriverByToken } from "@/data/delivery-drivers";
import {
  mirrorToWheelhouse,
  notifyCustomerDelivered,
  notifyCustomerPickedUp,
} from "@/lib/deliverDispatch";

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
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
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
    await notifyCustomerPickedUp(order, true);
  } else {
    await notifyCustomerDelivered(order, true);
  }

  return NextResponse.json({ ok: true, order });
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
  return NextResponse.json({ order });
}
