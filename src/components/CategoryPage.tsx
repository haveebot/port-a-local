"use client";

import { useState } from "react";
import Navigation from "./Navigation";
import BusinessCard from "./BusinessCard";
import Footer from "./Footer";
import Badge from "./Badge";
import Link from "next/link";
import type { Category } from "@/data/categories";
import type { Business } from "@/data/businesses";
import { isOpenNow } from "@/lib/isOpenNow";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

type SortOption = "featured" | "name" | "name-desc";

export default function CategoryPage({
  category,
  businesses,
}: {
  category: Category;
  businesses: Business[];
}) {
  const [query, setQuery] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [sort, setSort] = useState<SortOption>("featured");

  const hasOpenNowData = businesses.some((b) => b.hoursOfOperation);

  const filtered = businesses
    .filter((b) => {
      const q = query.toLowerCase();
      const matchesQuery = query
        ? b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.description?.toLowerCase().includes(q) ||
          b.menu?.some((s) => s.items.some((i) => i.name.toLowerCase().includes(q)))
        : true;
      const matchesOpen = openNow ? isOpenNow(b) : true;
      return matchesQuery && matchesOpen;
    })
    .sort((a, b) => {
      if (sort === "featured") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <PortalIcon name={category.slug as PortalIconName} className="w-12 h-12 text-coral-400 shrink-0" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              {category.name}
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 mb-8 max-w-2xl font-light">
            {category.description}
          </p>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xl w-full">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Gully ${category.name.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-sand-200 text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 transition-all"
              />
            </div>

            {hasOpenNowData && (
              <button
                onClick={() => setOpenNow(!openNow)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  openNow
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-white" : "bg-green-400"}`} />
                Open Now
              </button>
            )}
            <Badge size="lg" />
          </div>

          {/* Results count + sort */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-navy-300">
              {filtered.length} locally vetted {filtered.length === 1 ? "business" : "businesses"} in Port Aransas
              {openNow && ", open right now"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-xs bg-white/10 text-navy-200 border border-white/15 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-coral-400"
              >
                <option value="featured">Featured First</option>
                <option value="name">A → Z</option>
                <option value="name-desc">Z → A</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <PortalIcon name="do" className="w-16 h-16 mx-auto mb-4 text-coral-400" />
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
                Nothing washed up
              </h2>
              <p className="text-navy-400 mb-8 max-w-md mx-auto font-light">
                {openNow && !query
                  ? `No ${category.name.toLowerCase()} spots with hours data are open right now. Try turning off the filter.`
                  : query
                    ? `No results for "${query}" in ${category.name}. Try Gullying it for all categories.`
                    : `No businesses match your current filters.`}
              </p>
              <Link
                href={`/gully?q=${encodeURIComponent(query || category.name)}`}
                className="inline-flex items-center gap-2 btn-coral px-6 py-3 rounded-xl text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Gully it across everything
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
