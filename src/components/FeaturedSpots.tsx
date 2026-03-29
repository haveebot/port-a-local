import BusinessCard from "./BusinessCard";
import { getFeaturedBusinesses } from "@/data/businesses";

export default function FeaturedSpots() {
  const featured = getFeaturedBusinesses();

  return (
    <section className="py-24 bg-palm-950 relative" id="featured">
      {/* Subtle palm pattern */}
      <div className="absolute inset-0 palm-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Hand-Picked by Locals
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
            Featured Spots
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-sand-400 max-w-2xl mx-auto font-light">
            The best of Port Aransas, curated by people who know every corner of this island
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((biz) => (
            <BusinessCard key={biz.slug} business={biz} />
          ))}
        </div>
      </div>
    </section>
  );
}
