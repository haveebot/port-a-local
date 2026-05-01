import { NextRequest, NextResponse } from "next/server";
import { getOrdersForCustomer } from "@/data/delivery-store";
import {
  toCustomerOrderSummary,
  type CustomerOrderSummary,
} from "@/lib/customerOrderView";
import { readBearerToken, verifyCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/customer/orders
 *
 * Authorization: Bearer <session token from /api/customer/apple-signin>
 *
 * Returns the authenticated customer's recent delivery orders, sanitized
 * for the customer view (no PAL economics, no driver share, etc.).
 *
 * Closes the v1 IDOR where this endpoint trusted ?email=... from the
 * client. The lookup email now comes exclusively from the verified
 * session token, so an attacker can't fetch another customer's orders
 * by guessing their email.
 */
export async function GET(req: NextRequest) {
  const session = verifyCustomerSession(readBearerToken(req));
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!session.email) {
    // Apple omits email on returning sign-ins; the Apple Sign-In route
    // persists it and bakes it into the token. If we somehow got a
    // session with no email, we have nothing to look up — fail closed.
    return NextResponse.json({ error: "session has no email" }, { status: 403 });
  }

  const orders = await getOrdersForCustomer({ email: session.email });
  const summaries: CustomerOrderSummary[] = orders.map(toCustomerOrderSummary);
  return NextResponse.json({ orders: summaries });
}
