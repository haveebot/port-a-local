"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getTripItems, removeFromTrip, clearTrip } from "@/lib/tripPlanner";
import type { TripItem } from "@/lib/tripPlanner";
import PortalIcon, { EmojiIcon, type PortalIconName } from "@/components/brand/PortalIcon";

const categoryIcon: Record<string, PortalIconName> = {
  eat: "eat",
  drink: "drink",
  fish: "fish",
  do: "surfing",
  shop: "shop",
  stay: "stay",
  heritage: "heritage",
};

function getHref(item: TripItem): string {
  return item.type === "story"
    ? `/history/${item.slug}`
    : `/${item.category}/${item.slug}`;
}

export default function MyTripPage() {
  const [items, setItems] = useState<TripItem[]>([]);

  useEffect(() => {
    setItems(getTripItems());
    const onUpdate = () => setItems(getTripItems());
    window.addEventListener("trip-updated", onUpdate);
    return () => window.removeEventListener("trip-updated", onUpdate);
  }, []);

  const businessItems = items.filter((i) => i.type === "business");
  const storyItems = items.filter((i) => i.type === "story");

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Your Saved Spots
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 mb-4">
            My Trip
          </h1>
          <p className="text-lg text-navy-200 font-light max-w-2xl mx-auto">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? "spot" : "spots"} saved for your Port Aransas trip. No account needed — your list is saved in this browser.`
              : "Save spots as you browse by tapping the heart icon. Your list stays in this browser — no account needed."}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <PortalIcon name="map" className="w-16 h-16 mx-auto mb-4 text-coral-400" />
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
                Your trip is empty
              </h2>
              <p className="text-navy-400 mb-8 max-w-md mx-auto font-light">
                Browse businesses and heritage stories, then tap the heart to save them here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/gully" className="btn-coral px-6 py-3 rounded-xl text-sm font-medium">
                  Gully It
                </Link>
                <Link href="/guides" className="px-6 py-3 rounded-xl text-sm font-medium bg-navy-100 text-navy-700 hover:bg-navy-200 transition-colors">
                  Browse Guides
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Business items */}
              {businessItems.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                    Places ({businessItems.length})
                  </h2>
                  <div className="space-y-3">
                    {businessItems.map((item) => (
                      <div
                        key={`${item.type}-${item.slug}`}
                        className="flex items-center gap-4 bg-white rounded-xl border border-sand-200 p-4"
                      >
                        <PortalIcon name={categoryIcon[item.category] ?? "map"} className="w-6 h-6 flex-shrink-0 text-navy-900" />
                        <Link href={getHref(item)} className="flex-1 min-w-0 group">
                          <p className="font-medium text-navy-900 group-hover:text-coral-600 transition-colors">
                            {item.name}
                          </p>
                          {item.tagline && (
                            <p className="text-sm text-navy-400 truncate">{item.tagline}</p>
                          )}
                        </Link>
                        <button
                          onClick={() => removeFromTrip(item.type, item.slug)}
                          className="p-2 rounded-full text-navy-300 hover:text-coral-500 hover:bg-coral-50 transition-colors flex-shrink-0"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story items */}
              {storyItems.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                    Heritage Reading ({storyItems.length})
                  </h2>
                  <div className="space-y-3">
                    {storyItems.map((item) => (
                      <div
                        key={`${item.type}-${item.slug}`}
                        className="flex items-center gap-4 bg-white rounded-xl border border-sand-200 p-4"
                      >
                        <EmojiIcon emoji={item.icon ?? "📖"} className="w-6 h-6 flex-shrink-0 text-navy-900" />
                        <Link href={getHref(item)} className="flex-1 min-w-0 group">
                          <p className="font-medium text-navy-900 group-hover:text-coral-600 transition-colors">
                            {item.name}
                          </p>
                          {item.tagline && (
                            <p className="text-sm text-navy-400 truncate">{item.tagline}</p>
                          )}
                        </Link>
                        <button
                          onClick={() => removeFromTrip(item.type, item.slug)}
                          className="p-2 rounded-full text-navy-300 hover:text-coral-500 hover:bg-coral-50 transition-colors flex-shrink-0"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear all */}
              <div className="text-center pt-6 border-t border-sand-200">
                <button
                  onClick={() => {
                    if (window.confirm("Clear your entire trip list?")) clearTrip();
                  }}
                  className="text-sm text-navy-400 hover:text-coral-500 transition-colors"
                >
                  Clear all saved spots
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
