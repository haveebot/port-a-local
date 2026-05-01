import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/data/delivery-store";
import { toCustomerOrderSummary } from "@/lib/customerOrderView";
import { readBearerToken, verifyCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/customer/orders/[id]
 *
 * Authorization: Bearer <session token from /api/customer/apple-signin>
 *
 * Returns a single customer-safe order summary if the authenticated user
 * actually owns the order (matched by email on the order record).
 *
 * Closes the v1 IDOR where this endpoint accepted ?email=... from the
 * client. The verified-session email is the only ownership signal.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = verifyCustomerSession(readBearerToken(req));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!session.email) {
    return NextResponse.json({ error: "session has no email" }, { status: 403 });
  }

  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const ownsByEmail =
    order.customer.email?.toLowerCase() === session.email.toLowerCase();
  if (!ownsByEmail) {
    // Don't disclose existence — return the same shape as 404 so an
    // attacker probing order ids can't distinguish "exists, not yours"
    // from "doesn't exist".
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: toCustomerOrderSummary(order) });
}
