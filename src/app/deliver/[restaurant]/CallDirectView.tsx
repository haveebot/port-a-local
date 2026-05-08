import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import type { FoodSpot } from "@/data/restaurant-encyclopedia";
import { selectBestMenu } from "@/data/restaurant-menus-scraped";

/**
 * Detail view for a restaurant in the encyclopedia that PAL doesn't yet
 * deliver from. Reuses the /deliver/[restaurant] route so URLs are unified.
 *
 * Surfaces what the businesses.ts entry has — menu (if any), hours,
 * address, phone (big tappable CTA). Editorial framing: PAL's the food
 * index for the island, this restaurant is part of that, you can call them
 * directly today and PAL is working on bringing them onto delivery.
 */
export default function CallDirectView({ spot }: { spot: FoodSpot }) {
  const business = spot.business;
  if (!business) {
    // Shouldn't happen for call-direct state, but type-narrow defensively
    return null;
  }
  // Prefer scraped menu when richer than the curated /eat highlights
  const menuChoice = selectBestMenu(spot.slug, business.menu);
  const menu = menuChoice?.menu ?? [];
  const totalItems = menu.reduce((sum, sec) => sum + sec.items.length, 0);
  const menuNote = menuChoice?.note;
  const isReservations = spot.state === "reservations";

  return (
    <main className="min-h-screen bg-sand-50 pb-24">
      <header
        className="border-b border-sand-200 bg-white"
        style={{ borderTopColor: "#1e3a5f", borderTopWidth: 4 }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-navy-400 hover:text-coral-600 transition-colors"
            >
              <LighthouseMark size={14} variant="dark" detail="icon" />
              Port A Local
            </Link>
            <span className="text-navy-300">·</span>
            <Link
              href="/deliver"
              className="text-xs text-navy-500 hover:text-coral-600 underline decoration-sand-300"
            >
              ← All restaurants
            </Link>
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                {spot.name}
              </h1>
              {business.tagline && (
                <p className="text-sm text-navy-600 font-light mt-1 max-w-2xl italic">
                  {business.tagline}
                </p>
              )}
            </div>
            <span
              className={
                isReservations
                  ? "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-coral-50 text-coral-800 border border-coral-200 flex-shrink-0 mt-1"
                  : "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-navy-50 text-navy-700 border border-navy-200 flex-shrink-0 mt-1"
              }
            >
              {isReservations ? "🪑 Reservations" : "📞 Call to order"}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* CTA strip — phone + website */}
        <section className="bg-navy-900 text-sand-50 rounded-2xl p-6 sm:p-7">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-3">
            We don&apos;t deliver from here yet
          </p>
          <p className="text-sand-100 leading-relaxed mb-4">
            Call ahead, swing by, or order through their site. PAL&apos;s
            working on bringing them onto delivery — until then, here&apos;s
            how to reach them.
          </p>
          <div className="flex flex-wrap gap-3">
            {spot.phone && (
              <a
                href={`tel:${spot.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold bg-coral-500 text-white hover:bg-coral-600"
              >
                📞 {spot.phone}
              </a>
            )}
            {spot.website && (
              <a
                href={spot.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold bg-sand-50 text-navy-900 hover:bg-sand-200"
              >
                🌐 Visit site ↗
              </a>
            )}
          </div>
        </section>

        {/* Description */}
        {business.description && (
          <section className="bg-white border border-sand-200 rounded-xl p-6">
            <p className="text-sm text-navy-700 leading-relaxed">
              {business.description}
            </p>
          </section>
        )}

        {/* Menu */}
        {totalItems > 0 ? (
          <section className="bg-white border border-sand-200 rounded-xl p-6">
            <div className="flex items-baseline justify-between mb-4 gap-2 flex-wrap">
              <h2 className="font-display text-xl font-bold text-navy-900">
                Menu
              </h2>
              <p className="text-[11px] text-navy-500 font-mono">
                {totalItems} items
                {menu.length > 1 ? ` · ${menu.length} sections` : ""}
              </p>
            </div>
            <div className="space-y-6">
              {menu.map((section) => (
                <div key={section.section}>
                  <h3 className="font-display font-bold text-navy-900 text-base mb-2 pb-1 border-b border-sand-200">
                    {section.section}
                  </h3>
                  <ul className="space-y-2.5">
                    {section.items.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy-800">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[12px] text-navy-500 font-light mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.price && (
                          <span className="text-sm font-mono text-navy-700 flex-shrink-0">
                            {item.price}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-navy-400 italic mt-6 pt-4 border-t border-sand-200">
              Menu items + prices may have changed. Call ahead to confirm.
            </p>
          </section>
        ) : (
          <section className="bg-white border border-sand-200 rounded-xl p-6">
            <p className="text-sm text-navy-600 italic">
              No menu on file yet. Call them direct or check their site for
              what&apos;s being served.
            </p>
          </section>
        )}

        {/* Practical info */}
        <section className="bg-white border border-sand-200 rounded-xl p-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-3">
            Visiting
          </p>
          <dl className="space-y-2 text-sm">
            {spot.address && (
              <div className="flex items-baseline gap-2">
                <dt className="text-navy-500 w-20 flex-shrink-0">Address</dt>
                <dd className="text-navy-800">{spot.address}</dd>
              </div>
            )}
            {spot.hours && (
              <div className="flex items-baseline gap-2">
                <dt className="text-navy-500 w-20 flex-shrink-0">Hours</dt>
                <dd className="text-navy-800">{spot.hours}</dd>
              </div>
            )}
            {spot.phone && (
              <div className="flex items-baseline gap-2">
                <dt className="text-navy-500 w-20 flex-shrink-0">Phone</dt>
                <dd className="text-navy-800 font-mono">
                  <a
                    href={`tel:${spot.phone.replace(/[^\d+]/g, "")}`}
                    className="text-coral-700 hover:text-coral-900"
                  >
                    {spot.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Want this on PAL delivery? */}
        <section className="bg-emerald-50 border border-emerald-300 rounded-xl p-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
            Want this on PAL delivery?
          </p>
          <p className="text-sm text-emerald-900 mb-3">
            Tell them. The more requests we get for a spot, the faster we
            bring them on. Mention you saw them on Port A Local when you
            call.
          </p>
          <a
            href={`mailto:hello@theportalocal.com?subject=Add%20${encodeURIComponent(spot.name)}%20to%20PAL%20delivery`}
            className="inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline"
          >
            Email us — we&apos;ll work on it →
          </a>
        </section>
      </div>
    </main>
  );
}
