import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getOrderByCheckoutSession,
  markOrderPaid,
} from "@/data/delivery-store";
import {
  dispatchDriversForOrder,
  mirrorToWheelhouse,
} from "@/lib/deliverDispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-03-25.dahlia",
  });
}

/**
 * Stripe webhook for /deliver checkout sessions.
 *
 * Configure in Stripe dashboard → Developers → Webhooks:
 *   Endpoint: https://theportalocal.com/api/deliver/webhook
 *   Events: checkout.session.completed
 *   Copy the signing secret to STRIPE_DELIVER_WEBHOOK_SECRET in Vercel.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_DELIVER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_DELIVER_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "verify failed";
    return NextResponse.json(
      { error: `Bad signature: ${msg}` },
      { status: 403 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    // Not one of ours — Stripe webhook may also receive other portal events
    // if same secret is reused (we recommend a separate endpoint here).
    return NextResponse.json({ ok: true, ignored: "no orderId" });
  }

  // Look up by session id (canonical) — in case orderId metadata gets stripped
  const orderBySession = await getOrderByCheckoutSession(session.id);
  const orderToMark = orderBySession ?? null;
  if (!orderToMark) {
    console.error(
      `[deliver webhook] no order for session ${session.id} / order ${orderId}`,
    );
    return NextResponse.json(
      { ok: true, error: "order not found" },
      { status: 200 }, // 200 to prevent Stripe retries on a permanent miss
    );
  }

  const paid = await markOrderPaid(
    orderToMark.id,
    (session.payment_intent as string) ?? "",
  );
  if (!paid) {
    return NextResponse.json({ ok: true, error: "mark failed" });
  }

  // Fire-and-forget: mirror + dispatch (errors logged, don't fail the webhook)
  await mirrorToWheelhouse(paid, "paid");
  const dispatch = await dispatchDriversForOrder(paid);

  return NextResponse.json({
    ok: true,
    orderId: paid.id,
    dispatchedTo: dispatch.sentTo,
  });
}
