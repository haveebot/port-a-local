import BusinessCard from "./BusinessCard";
import { getFeaturedBusinesses } from "@/data/businesses";

/**
 * Mobile-only subset of the Featured Spots list (Collie 2026-05-14).
 * Mobile users get just these four cards; tablet/desktop see the full
 * curated set. Non-mobile cards are hidden via Tailwind below the `md`
 * breakpoint so SSR ships the full list and SEO/crawlers still see every
 * featured business.
 */
const MOBILE_FEATURED_SLUGS = new Set([
  "venetian-hot-plate",
  "drink-brons-backyard",
  "aloha-acai",
  "eat-jeremiahs-boat-dock-grill",
]);

export default function FeaturedSpots() {
  const featured = getFeaturedBusinesses();

  return (
    <section className="py-24 bg-coral-500 relative" id="featured">
      <div className="absolute top-0 left-0 right-0 gold-line" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-navy-900 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Hand-Picked by Locals
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            Featured Spots
          </h2>
          <div className="h-px bg-navy-900 max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-900 max-w-2xl mx-auto font-light">
            The best of Port Aransas, curated by people who know every corner of this island
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((biz) => {
            const showOnMobile = MOBILE_FEATURED_SLUGS.has(biz.slug);
            return (
              <div
                key={biz.slug}
                className={showOnMobile ? undefined : "hidden md:block"}
              >
                <BusinessCard business={biz} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
