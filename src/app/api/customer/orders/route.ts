import { NextRequest, NextResponse } from "next/server";
import { getOrdersForCustomer } from "@/data/delivery-store";
import {
  toCustomerOrderSummary,
  type CustomerOrderSummary,
} from "@/lib/customerOrderView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/customer/orders?email=...&phone=...
 *
 * Returns a customer's recent delivery orders, sanitized for the
 * customer view (no PAL economics, no driver share, etc.). v1 keys on
 * email/phone passed by the client; v2 will key on the session token
 * minted by /api/customer/apple-signin.
 *
 * One of `email` or `phone` is required.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim() || undefined;
  const phone = searchParams.get("phone")?.trim() || undefined;

  if (!email && !phone) {
    return NextResponse.json(
      { error: "email or phone is required" },
      { status: 400 }
    );
  }

  const orders = await getOrdersForCustomer({ email, phone });
  const summaries: CustomerOrderSummary[] = orders.map(toCustomerOrderSummary);
  return NextResponse.json({ orders: summaries });
}
