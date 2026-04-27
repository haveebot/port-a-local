import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/data/delivery-store";
import { toCustomerOrderSummary } from "@/lib/customerOrderView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/customer/orders/[id]?email=...
 *
 * Returns a single customer-safe order summary. The caller must include
 * the email (or phone) used at checkout — we use it as a lightweight
 * authorization check so a guessed order id doesn't leak details.
 *
 * Once the customer session token from /api/customer/apple-signin is
 * propagated, switch to validating the bearer instead of trusting the
 * query string.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase() || undefined;
  const phone = searchParams.get("phone")?.trim() || undefined;

  if (!email && !phone) {
    return NextResponse.json(
      { error: "email or phone is required for ownership check" },
      { status: 400 }
    );
  }

  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const ownsByEmail =
    !!email && order.customer.email?.toLowerCase() === email;
  const ownsByPhone = !!phone && order.customer.phone === phone;
  if (!ownsByEmail && !ownsByPhone) {
    // Don't disclose existence — use the same shape as 404.
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: toCustomerOrderSummary(order) });
}
