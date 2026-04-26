import { notFound } from "next/navigation";
import { getOrder } from "@/data/delivery-store";
import { getDriverByToken } from "@/data/delivery-drivers";
import { getRestaurant } from "@/data/delivery-restaurants";
import { formatUSD } from "@/data/delivery-pricing";
import DriverActions from "./DriverActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Driver — PAL Delivery",
  robots: { index: false, follow: false },
};

export default async function DriverPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { orderId } = await params;
  const { t } = await searchParams;
  const driver = t ? await getDriverByToken(t) : null;
  if (!driver) {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-display text-xl font-bold text-navy-900 mb-2">
            Invalid driver link
          </p>
          <p className="text-sm text-navy-500 font-light">
            This link doesn&apos;t match an active driver token. If you got
            this from PAL Delivery dispatch, email{" "}
            <a
              href="mailto:hello@theportalocal.com?subject=Driver%20link%20expired"
              className="underline decoration-sand-400 hover:text-coral-600"
            >
              hello@theportalocal.com
            </a>{" "}
            for a fresh link.
          </p>
        </div>
      </main>
    );
  }

  const order = await getOrder(orderId);
  if (!order) notFound();
  const r = getRestaurant(order.restaurantId);
  const driverPayout = order.deliveryFeeCents + order.tipCents;

  // Maps URLs — driver gets one-tap to pickup or dropoff in Apple/Google Maps
  const pickupQ = encodeURIComponent(r?.pickupAddress ?? "");
  const dropQ = encodeURIComponent(order.customer.deliveryAddress);

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 pb-24">
      <header className="bg-navy-900 border-b border-coral-500/30 px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-coral-300">
            PAL Delivery · Driver
          </p>
          <p className="font-display text-lg font-bold mt-1">
            Hey {driver.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <a
            href={`/deliver/driver/online?t=${encodeURIComponent(driver.token)}`}
            className="text-[11px] text-sand-300 underline decoration-sand-500/50 hover:text-coral-300"
          >
            On/Off duty
          </a>
          <a
            href={`/deliver/driver/payouts?t=${encodeURIComponent(driver.token)}`}
            className="text-[11px] text-sand-300 underline decoration-sand-500/50 hover:text-coral-300"
          >
            Payouts setup
          </a>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-1">
            Pickup
          </p>
          <p className="font-display text-xl font-bold">{r?.name}</p>
          <p className="text-sm text-sand-300 mt-1">
            {r?.pickupAddress}
          </p>
          {r?.pickupNotes && (
            <p className="text-xs text-sand-400 font-light mt-2 italic">
              {r.pickupNotes}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <a
              href={`https://maps.apple.com/?daddr=${pickupQ}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
            >
              Apple Maps
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pickupQ}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
            >
              Google Maps
            </a>
            {r?.phone && (
              <a
                href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
                className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
              >
                Call
              </a>
            )}
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-1">
            Dropoff
          </p>
          <p className="font-display text-xl font-bold">
            {order.customer.name}
          </p>
          <p className="text-sm text-sand-300 mt-1">
            {order.customer.deliveryAddress}
          </p>
          {order.customer.deliveryNotes && (
            <p className="text-xs text-amber-300 font-light mt-2">
              📝 {order.customer.deliveryNotes}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <a
              href={`https://maps.apple.com/?daddr=${dropQ}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
            >
              Apple Maps
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${dropQ}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
            >
              Google Maps
            </a>
            <a
              href={`tel:${order.customer.phone.replace(/[^\d+]/g, "")}`}
              className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-navy-700 hover:bg-navy-600"
            >
              Call
            </a>
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
            Order
          </p>
          <ul className="space-y-1.5 text-sm">
            {order.items.map((li, i) => (
              <li
                key={i}
                className="flex justify-between font-mono tabular-nums"
              >
                <span className="font-sans">
                  {li.quantity}× {li.itemName}
                </span>
                <span className="text-sand-400">
                  {formatUSD(li.customerPriceCents * li.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <hr className="border-navy-700 my-3" />
          <div className="flex justify-between text-sm">
            <span className="text-sand-300">Pay restaurant</span>
            <span className="font-mono tabular-nums font-bold">
              {formatUSD(order.subtotalCents)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-emerald-300">You earn</span>
            <span className="font-mono tabular-nums font-bold text-emerald-300">
              {formatUSD(driverPayout)}
            </span>
          </div>
        </div>

        <DriverActions
          orderId={order.id}
          token={driver.token}
          status={order.status}
          driverIdInOrder={order.driverId ?? null}
          thisDriverId={driver.id}
        />
      </div>
    </main>
  );
}
