import Link from "next/link";
import type { Metadata } from "next";
import {
  getActiveRestaurants,
  isOpenNow,
} from "@/data/delivery-restaurants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PAL Delivery — local food, to your beach house",
  description:
    "Order from real Port Aransas spots. Local drivers. No app. Pickup and delivery handled by us.",
};

export default function DeliverIndex() {
  const restaurants = getActiveRestaurants();
  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Delivery
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Local food, to your beach house.
          </h1>
          <p className="text-sand-300 font-light mt-2 max-w-2xl">
            Real Port Aransas spots. Local drivers. No app. We pick up, we
            deliver — you eat on the porch.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy-900 mb-5">
          Pick a restaurant
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {restaurants.map((r) => {
            const open = isOpenNow(r);
            return (
              <Link
                key={r.id}
                href={`/deliver/${r.slug}`}
                className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-coral-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display font-bold text-navy-900 text-lg leading-tight">
                    {r.name}
                  </h3>
                  <span
                    className={
                      open
                        ? "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0"
                        : "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-sand-100 text-navy-500 border border-sand-300 flex-shrink-0"
                    }
                  >
                    {open ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="text-sm text-navy-600 font-light mb-3">
                  {r.shortDescription}
                </p>
                <div className="flex flex-wrap gap-1">
                  {r.cuisineTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sand-100 text-navy-500 border border-sand-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-white border border-sand-200 rounded-xl p-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            How it works
          </p>
          <ol className="space-y-2 text-sm text-navy-700 font-light list-decimal list-inside">
            <li>Pick a restaurant + build your order.</li>
            <li>Pay through PAL — full retail + delivery + service + tip.</li>
            <li>
              Our local driver picks it up and brings it to your address.
            </li>
            <li>
              You get an SMS at every step — claimed, picked up, delivered.
            </li>
          </ol>
          <p className="text-xs text-navy-500 font-light mt-4">
            Brand-new and small on purpose. Two restaurants tonight, more soon.
            Hit any rough edges? Reply to your order receipt — Winston reads
            every one.
          </p>
        </div>

        <div className="mt-6 bg-navy-900 text-sand-100 border border-coral-500/30 rounded-xl p-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              Drive for PAL
            </p>
            <p className="font-display text-lg font-bold leading-tight">
              Local. Set your own hours. 100% of tip yours.
            </p>
            <p className="text-sm text-sand-300 font-light mt-1 max-w-xl">
              Want to make beach-day money running food from PA restaurants to
              vacation rentals? Sign up — we&apos;ll be in touch within a day.
            </p>
          </div>
          <Link
            href="/deliver/runner"
            className="px-4 py-2.5 rounded-lg text-sm font-bold bg-coral-500 text-white hover:bg-coral-600 flex-shrink-0"
          >
            Sign up to drive →
          </Link>
        </div>
      </div>
    </main>
  );
}
