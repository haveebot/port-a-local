import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/data/delivery-store";
import { getRestaurant } from "@/data/delivery-restaurants";
import { formatUSD } from "@/data/delivery-pricing";
import PreviewBanner from "@/components/deliver/PreviewBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order placed — PAL Delivery",
};

const STAGE_LABELS: Record<string, { label: string; tone: string }> = {
  placed: { label: "Order placed", tone: "navy" },
  paid: { label: "Paid · awaiting driver", tone: "navy" },
  dispatching: { label: "Looking for a driver", tone: "amber" },
  claimed: { label: "Driver heading to pickup", tone: "coral" },
  picked_up: { label: "Out for delivery", tone: "coral" },
  delivered: { label: "Delivered", tone: "emerald" },
  canceled: { label: "Canceled", tone: "red" },
  refunded: { label: "Refunded", tone: "red" },
};

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
  const order = await getOrder(orderId);
  if (!order) notFound();
  const r = getRestaurant(order.restaurantId);
  const stage = STAGE_LABELS[order.status] ?? STAGE_LABELS.placed;

  return (
    <main className="min-h-screen bg-sand-50">
      {isBeta && <PreviewBanner />}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Delivery
          </p>
          <h1 className="font-display text-2xl font-bold">
            {isBeta ? "Got it." : "Thanks!"}
          </h1>
          <p className="text-sand-300 font-light text-sm mt-1">
            Order ID <span className="font-mono">{order.id}</span>
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            Status
          </p>
          <p className="font-display text-xl font-bold text-navy-900">
            {isBeta ? "Request received" : stage.label}
          </p>
          <p className="text-xs text-navy-500 font-light mt-1">
            {isBeta
              ? "We've got your request. We'll text you to confirm whether we can fulfill — and to take payment if so. No charge yet."
              : "We'll text you at every step. Refresh this page any time."}
          </p>
        </div>

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
          Issue with your order? Reply to your SMS or text Winston directly.
          We&apos;ll make it right.
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
