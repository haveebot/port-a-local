"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { businesses } from "@/data/businesses";
import { categories } from "@/data/categories";
import Link from "next/link";

// Port Aransas center
const PORT_A_CENTER: [number, number] = [27.8339, -97.0611];

const categoryColors: Record<string, string> = {
  eat: "#e8656f",
  drink: "#3b82f6",
  stay: "#10b981",
  do: "#f59e0b",
  fish: "#6366f1",
  shop: "#ec4899",
};

// Only businesses with real geocoded coordinates
const geocodedBusinesses = businesses.filter((b) => b.coordinates);

const MapComponent = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-sand-100 rounded-2xl flex items-center justify-center">
      <p className="text-navy-400">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const list = activeCategory === "All"
      ? geocodedBusinesses
      : geocodedBusinesses.filter((b) => b.category === activeCategory);
    return list.map((b) => ({
      ...b,
      coords: b.coordinates as [number, number],
      color: categoryColors[b.category] || "#e8656f",
    }));
  }, [activeCategory]);

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-8 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-2">
                Island Map
              </h1>
              <p className="text-navy-200 font-light">
                {filtered.length} spots across Port Aransas
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === "All"
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeCategory === cat.slug
                      ? "bg-coral-500 text-white border-coral-500"
                      : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <MapComponent
            businesses={filtered.map((b) => ({
              slug: b.slug,
              name: b.name,
              category: b.category,
              tagline: b.tagline,
              coords: b.coords,
              color: b.color,
            }))}
            center={PORT_A_CENTER}
          />

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {categories.map((cat) => (
              <div key={cat.slug} className="flex items-center gap-2 text-sm text-navy-500">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[cat.slug] }}
                />
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* List below map */}
      <section className="py-8 bg-sand-50 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-navy-400 mb-4">{filtered.length} spots shown</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filtered.slice(0, 20).map((b) => (
              <Link
                key={b.slug}
                href={`/${b.category}/${b.slug}`}
                className="flex items-center gap-3 bg-white rounded-lg border border-sand-200 p-3 hover:border-coral-300 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{b.name}</p>
                  <p className="text-xs text-navy-400 capitalize">{b.category}</p>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length > 20 && (
            <p className="text-center text-sm text-navy-400 mt-4">
              + {filtered.length - 20} more spots on the map
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
