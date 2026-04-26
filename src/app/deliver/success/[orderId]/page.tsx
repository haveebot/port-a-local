import { notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getDeliverStripe, getDeliverStripeKey } from "@/lib/deliverStripe";
import { getOrder, markOrderPaid } from "@/data/delivery-store";
import { getRestaurant } from "@/data/delivery-restaurants";
import { formatUSD } from "@/data/delivery-pricing";
import PreviewBanner from "@/components/deliver/PreviewBanner";
import OrderTracker from "./OrderTracker";

export const dynamic = "force-dynamic";

/**
 * Server-side Stripe verification fallback. If a Stripe session_id is on
 * the URL and the order is still 'placed' in our DB, fetch the session
 * from Stripe — if payment_status is 'paid', mark our order paid +
 * dispatch drivers. This is the no-webhook path; it makes the system
 * work even before the Stripe webhook is configured.
 */
async function verifyStripePaymentIfNeeded(
  orderId: string,
  sessionId: string | undefined,
): Promise<void> {
  if (!sessionId) return;
  const order = await getOrder(orderId);
  if (!order) return;
  if (order.paymentStatus === "paid") return;
  if (!getDeliverStripeKey()) return;
  try {
    const stripe = getDeliverStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      // The early return at top of function guarantees order was unpaid
      // when we entered, so this is the FIRST transition to paid —
      // safe to fire all downstream effects. Subsequent re-renders hit
      // the early return and skip this entire block.
      await markOrderPaid(
        orderId,
        (session.payment_intent as string) ?? "",
      );
      const updated = await getOrder(orderId);
      if (updated) {
        const [{ dispatchDriversForOrder, mirrorToWheelhouse }, emails] =
          await Promise.all([
            import("@/lib/deliverDispatch"),
            import("@/lib/deliverEmails"),
          ]);
        await mirrorToWheelhouse(updated, "paid");
        await emails.sendAdminPaidEmail(updated);
        await emails.sendCustomerConfirmationEmail(updated);
        await dispatchDriversForOrder(updated);
      }
    }
  } catch (err) {
    console.error("[deliver success] Stripe verify failed:", err);
  }
}

export const metadata = {
  title: "Order placed — PAL Delivery",
};

/**
 * Initial server-side fetch of anonymized runner info — same query
 * as /api/deliver/order/[id]/status GET, inlined here so we can SSR
 * with real data instead of a flicker-then-replace.
 */
async function getInitialRunnerInfo(
  driverId: string | null,
): Promise<{ signupNumber: number; vehicle: string | null } | null> {
  if (!driverId) return null;
  try {
    const { rows } = await sql`
      WITH numbered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY applied_at ASC, id ASC) AS signup_num
        FROM delivery_drivers
      )
      SELECT n.signup_num, d.vehicle
      FROM delivery_drivers d
      JOIN numbered n ON n.id = d.id
      WHERE d.id = ${driverId}
      LIMIT 1
    `;
    if (!rows[0]) return null;
    return {
      signupNumber: Number(rows[0].signup_num),
      vehicle: (rows[0].vehicle as string) ?? null,
    };
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ beta?: string; session_id?: string }>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  const isBeta = sp.beta === "1";

  // Stripe-verify fallback: if returning from Stripe with a session_id,
  // confirm payment + mark order paid + dispatch drivers. Idempotent.
  await verifyStripePaymentIfNeeded(orderId, sp.session_id);

  const order = await getOrder(orderId);
  if (!order) notFound();
  const r = getRestaurant(order.restaurantId);
  const initialRunner = await getInitialRunnerInfo(order.driverId ?? null);

  return (
    <main className="min-h-screen bg-sand-50">
      {isBeta && <PreviewBanner />}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={14} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Delivery
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold">
            {isBeta ? "Got it." : "Thanks!"}
          </h1>
          <p className="text-sand-300 font-light text-sm mt-1">
            Order ID <span className="font-mono">{order.id}</span>
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {isBeta ? (
          <div className="bg-white border border-sand-200 rounded-xl p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
              Status
            </p>
            <p className="font-display text-xl font-bold text-navy-900">
              Request received
            </p>
            <p className="text-xs text-navy-500 font-light mt-1">
              We&apos;ve got your request. We&apos;ll text you to confirm
              whether we can fulfill — and to take payment if so. No charge
              yet.
            </p>
          </div>
        ) : (
          <OrderTracker
            orderId={order.id}
            initialOrder={{
              id: order.id,
              status: order.status,
              paidAt: order.paidAt ?? null,
              claimedAt: order.claimedAt ?? null,
              pickedUpAt: order.pickedUpAt ?? null,
              deliveredAt: order.deliveredAt ?? null,
              driverId: order.driverId ?? null,
            }}
            initialRunner={initialRunner}
          />
        )}

        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            Order
          </p>
          <p className="text-sm text-navy-700 mb-3">
            <strong>{r?.name}</strong> → {order.customer.deliveryAddress}
          </p>
          <ul className="text-sm text-navy-700 space-y-1 mb-4">
            {order.items.map((li, i) => (
              <li key={i} className="flex justify-between font-mono tabular-nums">
                <span className="font-sans">
                  {li.quantity}× {li.itemName}
                </span>
                <span>{formatUSD(li.customerPriceCents * li.quantity)}</span>
              </li>
            ))}
          </ul>
          <hr className="border-sand-200 my-3" />
          <div className="text-sm space-y-1">
            <Row label="Subtotal" value={formatUSD(order.subtotalCents)} />
            <Row label="Delivery" value={formatUSD(order.deliveryFeeCents)} />
            <Row label="Service" value={formatUSD(order.serviceFeeCents)} />
            {order.tipCents > 0 && (
              <Row label="Tip" value={formatUSD(order.tipCents)} />
            )}
            <Row label="Tax" value={formatUSD(order.taxCents)} />
            <hr className="border-sand-200 my-2" />
            <Row
              label={isBeta ? "Total (would be)" : "Total charged"}
              value={formatUSD(order.totalCents)}
              bold
            />
          </div>
        </div>

        <p className="text-xs text-navy-500 font-light text-center">
          Issue with your order?{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-sand-400 hover:text-coral-600"
          >
            hello@theportalocal.com
          </a>
          . We&apos;ll make it right.
        </p>

        <div className="text-center">
          <Link
            href="/deliver"
            className="text-sm text-coral-600 underline decoration-coral-300"
          >
            ← Back to PAL Delivery
          </Link>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${bold ? "font-bold text-navy-900" : "text-navy-600"}`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
