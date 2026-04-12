"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { businesses } from "@/data/businesses";
import type { Business } from "@/data/businesses";
import BusinessCard from "@/components/BusinessCard";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { isOpenNow } from "@/lib/isOpenNow";

const fuse = new Fuse(businesses, {
  keys: [
    { name: "name", weight: 3 },
    { name: "tagline", weight: 2 },
    { name: "tags", weight: 2 },
    { name: "description", weight: 1 },
    { name: "category", weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
});

function GullyContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState("All");
  const [openNow, setOpenNow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fuseResults: Business[] =
    query.trim().length >= 2
      ? fuse.search(query).map((r) => r.item)
      : [...businesses];

  const afterOpenFilter = openNow
    ? fuseResults.filter((b) => isOpenNow(b))
    : fuseResults;

  const categoriesInResults = Array.from(
    new Set(afterOpenFilter.map((b) => b.category))
  ).sort();

  const afterCategoryFilter =
    activeCategory === "All"
      ? afterOpenFilter
      : afterOpenFilter.filter((b) => b.category === activeCategory);

  const sorted = [...afterCategoryFilter].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });

  const hasOpenNowData = businesses.some((b) => b.hoursOfOperation);

  useEffect(() => {
    if (activeCategory !== "All" && !categoriesInResults.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [categoriesInResults, activeCategory]);

  const resultLabel =
    query.trim().length >= 2
      ? `${sorted.length} ${sorted.length === 1 ? "result" : "results"} for "${query}"`
      : `${sorted.length} locally vetted businesses in Port Aransas`;

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Port A&apos;s Local Search Engine
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-sand-50 mb-3">
            Gully
          </h1>
          <p className="text-lg text-navy-200 font-light mb-8">
            Find anything on the island — restaurants, bars, charters, shops and more.
          </p>

          {/* Search input */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400"
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'seafood', 'happy hour', 'fishing'..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-navy-900 bg-white border border-sand-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-400 text-base"
            />
          </div>

          {/* Open Now + Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {hasOpenNowData && (
              <button
                onClick={() => setOpenNow(!openNow)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  openNow
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-white" : "bg-green-400"}`} />
                Open Now
              </button>
            )}
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeCategory === "All"
                  ? "bg-coral-500 text-white border-coral-500"
                  : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
              }`}
            >
              All
            </button>
            {categoriesInResults.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-navy-400 mb-6">{resultLabel}</p>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🌊</span>
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
                Nothing washed up
              </h2>
              <p className="text-navy-400 mb-8 max-w-md mx-auto font-light">
                {query.trim()
                  ? `No results for "${query}". Try something else — Gully knows the island well.`
                  : "No businesses match your current filters."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/eat" className="btn-coral px-6 py-3 rounded-xl text-sm font-medium">
                  Browse Restaurants
                </Link>
                <Link href="/drink" className="px-6 py-3 rounded-xl text-sm font-medium bg-navy-100 text-navy-700 hover:bg-navy-200 transition-colors">
                  Explore Bars
                </Link>
                <Link href="/fish" className="px-6 py-3 rounded-xl text-sm font-medium bg-navy-100 text-navy-700 hover:bg-navy-200 transition-colors">
                  Find Charters
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function GullyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-navy-400">Loading Gully...</p></div>}>
      <GullyContent />
    </Suspense>
  );
}
