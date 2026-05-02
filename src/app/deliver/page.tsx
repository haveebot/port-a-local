import Link from "next/link";
import type { Metadata } from "next";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { isOpenNow } from "@/data/delivery-restaurants";
import { getOnlineDriverIds } from "@/data/delivery-store";
import {
  getAllFoodSpots,
  splitByState,
  type FoodSpot,
} from "@/data/restaurant-encyclopedia";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eat in Port Aransas — every spot on the island | Port A Local",
  description:
    "The food index for Port Aransas. Order delivery from PAL-partnered spots, or call any local restaurant directly. 40+ kitchens, every menu, one place.",
};

export default async function DeliverIndex() {
  const all = getAllFoodSpots();
  const { palDelivery, callDirect, reservations } = splitByState(all);

  // Within PAL delivery, split by kind (restaurants vs stores)
  const palRestaurants = palDelivery.filter(
    (s) => (s.delivery?.kind ?? "restaurant") === "restaurant",
  );
  const palStores = palDelivery.filter((s) => s.delivery?.kind === "store");

  const onlineDriverCount = (await getOnlineDriverIds().catch(() => [])).length;

  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Eat
            </span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Every kitchen on the island.
          </h1>
          <p className="text-sand-300 font-light mt-2 max-w-2xl">
            {all.length} spots in the food index. Order through PAL on the
            ones we deliver. Call the rest direct — we&apos;ll keep adding
            delivery as more partner up.
          </p>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {onlineDriverCount > 0 ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {onlineDriverCount}{" "}
                {onlineDriverCount === 1 ? "runner" : "runners"} on duty
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                No runners on duty — orders will queue
              </span>
            )}
            <span className="text-[11px] text-sand-400 font-mono">
              · {palDelivery.length} PAL delivery · {callDirect.length} call
              direct · {reservations.length} sit-down
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* SECTION 1 — PAL Delivery (restaurants) */}
        {palRestaurants.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                <span>🚀</span>
                Order through PAL
              </h2>
              <p className="text-[10px] tracking-widest uppercase text-emerald-700 font-mono">
                We bring it to you
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {palRestaurants.map((s) => (
                <PalDeliveryCard key={s.slug} spot={s} accent="coral" />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2 — Convenience runs (PAL stores) */}
        {palStores.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                <span>🏪</span>
                Convenience runs
              </h2>
              <p className="text-[10px] tracking-widest uppercase text-emerald-700 font-mono">
                Beach-day essentials
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {palStores.map((s) => (
                <PalDeliveryCard key={s.slug} spot={s} accent="emerald" />
              ))}
            </div>
            <p className="text-xs text-navy-500 font-light mt-3 italic">
              Curated essentials only — not the full store. More items coming
              as we see what you actually run for.
            </p>
          </section>
        )}

        {/* SECTION 3 — Call direct (the rest of the island that does takeout) */}
        {callDirect.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                <span>📞</span>
                Or order direct
              </h2>
              <p className="text-[10px] tracking-widest uppercase text-navy-500 font-mono">
                {callDirect.length} more spots
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {callDirect.map((s) => (
                <CallDirectCard key={s.slug} spot={s} />
              ))}
            </div>
            <p className="text-[11px] text-navy-500 font-light mt-4 italic">
              These spots aren&apos;t on PAL delivery yet — call them direct
              for now, and we&apos;ll keep working to bring them on. Want
              your favorite added?{" "}
              <a
                href="mailto:hello@theportalocal.com?subject=Restaurant%20suggestion"
                className="text-coral-700 hover:text-coral-900 font-semibold"
              >
                Tell us
              </a>
              .
            </p>
          </section>
        )}

        {/* SECTION 4 — Reservations (fine-dining sit-down only) */}
        {reservations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                <span>🪑</span>
                Sit-down — reservations
              </h2>
              <p className="text-[10px] tracking-widest uppercase text-navy-500 font-mono">
                Fine dining · no takeout
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reservations.map((s) => (
                <ReservationsCard key={s.slug} spot={s} />
              ))}
            </div>
            <p className="text-[11px] text-navy-500 font-light mt-4 italic">
              These are dining destinations, not takeout. Worth the table.
              Reservations strongly recommended.
            </p>
          </section>
        )}

        <div className="mt-12 bg-white border border-sand-200 rounded-xl p-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            How PAL delivery works
          </p>
          <ol className="space-y-2 text-sm text-navy-700 font-light list-decimal list-inside">
            <li>Pick a 🚀 PAL spot + build your order.</li>
            <li>Pay through PAL — full retail + delivery + service + tip.</li>
            <li>
              Our local driver picks it up and brings it to your address.
            </li>
            <li>
              You get an SMS at every step — claimed, picked up, delivered.
            </li>
          </ol>
          <p className="text-xs text-navy-500 font-light mt-4">
            Brand-new and small on purpose. A few PAL-delivery spots tonight,
            more soon. Hit any rough edges? Reply to your order receipt — we
            read every one.
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

        <div className="mt-4 bg-sand-50 border border-sand-200 rounded-xl p-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-1">
              Restaurant?
            </p>
            <p className="font-display text-lg font-bold leading-tight text-navy-900">
              Your menu price. Period.
            </p>
            <p className="text-sm text-navy-600 font-light mt-1 max-w-xl">
              We never charge your restaurant a commission. Customer-side
              fees only. Local runners. Free to apply.
            </p>
          </div>
          <Link
            href="/deliver/restaurant"
            className="px-4 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50 hover:bg-navy-800 flex-shrink-0"
          >
            Apply →
          </Link>
        </div>
      </div>
    </main>
  );
}

function PalDeliveryCard({
  spot,
  accent,
}: {
  spot: FoodSpot;
  accent: "coral" | "emerald";
}) {
  const open = spot.delivery ? isOpenNow(spot.delivery) : false;
  const hoverBorder =
    accent === "coral" ? "hover:border-coral-300" : "hover:border-emerald-400";
  const tagBg =
    accent === "coral"
      ? "bg-sand-100 text-navy-500 border-sand-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <Link
      href={`/deliver/${spot.slug}`}
      className={`block bg-white border border-sand-200 rounded-xl p-5 ${hoverBorder} hover:shadow-sm transition-all`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-navy-900 text-lg leading-tight">
          {spot.name}
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
      <p className="text-sm text-navy-600 font-light mb-3">{spot.tagline}</p>
      <div className="flex flex-wrap gap-1">
        {spot.cuisineTags.map((t) => (
          <span
            key={t}
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${tagBg}`}
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}

function CallDirectCard({ spot }: { spot: FoodSpot }) {
  return (
    <Link
      href={`/deliver/${spot.slug}`}
      className="block bg-white border border-sand-200 rounded-xl p-4 hover:border-navy-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-bold text-navy-900 text-base leading-tight">
          {spot.name}
        </h3>
        {spot.featured && (
          <span className="text-[9px] font-bold tracking-widest uppercase text-coral-700 flex-shrink-0">
            ★
          </span>
        )}
      </div>
      <p className="text-xs text-navy-600 font-light mb-2 line-clamp-2">
        {spot.tagline}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {spot.cuisineTags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-sand-100 text-navy-500 border border-sand-200"
          >
            {t}
          </span>
        ))}
      </div>
      {spot.phone && (
        <p className="text-[11px] text-navy-500 font-mono">📞 {spot.phone}</p>
      )}
    </Link>
  );
}

function ReservationsCard({ spot }: { spot: FoodSpot }) {
  return (
    <Link
      href={`/deliver/${spot.slug}`}
      className="block bg-white border border-coral-200 rounded-xl p-4 hover:border-coral-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-bold text-navy-900 text-base leading-tight">
          {spot.name}
        </h3>
        <span className="text-[9px] font-bold tracking-widest uppercase text-coral-700 flex-shrink-0">
          🪑
        </span>
      </div>
      <p className="text-xs text-navy-600 font-light italic mb-2 line-clamp-2">
        {spot.tagline}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {spot.cuisineTags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-coral-50 text-coral-700 border border-coral-200"
          >
            {t}
          </span>
        ))}
      </div>
      {spot.phone && (
        <p className="text-[11px] text-navy-500 font-mono">
          📞 {spot.phone} · reservations
        </p>
      )}
    </Link>
  );
}
