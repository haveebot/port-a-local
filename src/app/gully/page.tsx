"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { gullyFuse, gullyItems, getGullyHref } from "@/lib/gullySearch";
import type { GullyItem } from "@/lib/gullySearch";

const RECENT_KEY = "gully-recent";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  const trimmed = q.trim();
  if (trimmed.length < 2) return;
  const recent = getRecentSearches().filter((r) => r !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}
import { isOpenNow } from "@/lib/isOpenNow";
import BusinessCard from "@/components/BusinessCard";
import { businesses } from "@/data/businesses";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";

const popularChips = [
  { label: "🍔 Burgers", query: "Burgers" },
  { label: "🎣 Charter Fishing", query: "Charter Fishing" },
  { label: "🍹 Happy Hour", query: "Happy Hour" },
  { label: "🌮 Tacos", query: "Tacos" },
  { label: "☕ Coffee", query: "Coffee" },
  { label: "🏖️ Family Friendly", query: "Family Friendly" },
  { label: "🌙 Late Night", query: "Late Night" },
  { label: "🦞 Seafood", query: "Seafood" },
  { label: "📖 Heritage", query: "heritage" },
  { label: "⛵ Farley Boats", query: "Farley" },
];

function GullyContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState("All");
  const [openNow, setOpenNow] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setRecentSearches(getRecentSearches());
    // Save initial query from URL if present
    if (initialQ.trim().length >= 2) saveRecentSearch(initialQ);
  }, [initialQ]);

  // Search across unified index
  const fuseResults: GullyItem[] =
    query.trim().length >= 2
      ? gullyFuse.search(query).map((r) => r.item)
      : [...gullyItems];

  // Open Now filter — only applies to businesses
  const afterOpenFilter = openNow
    ? fuseResults.filter((item) => {
        if (item.type === "story") return true; // stories always pass through
        const biz = businesses.find((b) => b.slug === item.slug);
        return biz ? isOpenNow(biz) : false;
      })
    : fuseResults;

  // Build category list from results
  const categoriesInResults = Array.from(
    new Set(afterOpenFilter.map((item) =>
      item.type === "story" ? "Heritage" : item.category
    ))
  ).sort();

  // Category filter
  const afterCategoryFilter =
    activeCategory === "All"
      ? afterOpenFilter
      : activeCategory === "Heritage"
        ? afterOpenFilter.filter((item) => item.type === "story")
        : afterOpenFilter.filter(
            (item) => item.type === "business" && item.category === activeCategory
          );

  // Sort: featured first, then alphabetical
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

  const storyCount = sorted.filter((i) => i.type === "story").length;
  const bizCount = sorted.filter((i) => i.type === "business").length;

  const resultLabel =
    query.trim().length >= 2
      ? `${sorted.length} ${sorted.length === 1 ? "result" : "results"} for "${query}"${storyCount > 0 ? ` (${storyCount} heritage)` : ""}`
      : `${bizCount} businesses + ${storyCount} heritage articles in Port Aransas`;

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
            Find anything on the island. Restaurants, bars, charters, shops, history and more — just Gully it.
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
              placeholder="Gully it..."
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
                {cat === "Heritage" ? "📖 Heritage" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent + Popular chips — shown only when query is empty */}
      {query.trim().length === 0 && (
        <section className="pb-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            {recentSearches.length > 0 && (
              <div className="mt-8 mb-6">
                <p className="text-sm font-semibold text-navy-300 uppercase tracking-wide mb-3">
                  Recent
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="px-4 py-2 rounded-full text-sm bg-navy-100 text-navy-600 hover:bg-coral-50 hover:text-coral-600 border border-navy-200 transition-colors cursor-pointer"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm font-semibold text-navy-300 uppercase tracking-wide mb-3 mt-8">
              Just Gully It
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularChips.map((chip) => (
                <button
                  key={chip.query}
                  onClick={() => setQuery(chip.query)}
                  className="px-4 py-2 rounded-full text-sm bg-white/10 text-sand-200 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-navy-400 mb-6">{resultLabel}</p>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((item) =>
                item.type === "business" ? (
                  <BusinessCard
                    key={`biz-${item.slug}`}
                    business={businesses.find((b) => b.slug === item.slug)!}
                  />
                ) : (
                  <Link
                    key={`story-${item.slug}`}
                    href={`/history/${item.slug}`}
                    className="group relative rounded-2xl bg-white border border-sand-200 overflow-hidden card-hover"
                  >
                    <div className="h-1 bg-gradient-to-r from-navy-600 via-coral-400 to-gold-400" />
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-600">
                          {item.icon} Heritage
                        </span>
                        <span className="text-xs text-navy-400">{item.readTime} read</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-navy-900 group-hover:text-coral-600 transition-colors mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-navy-400 leading-relaxed font-light line-clamp-2">
                        {item.tagline}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🌊</span>
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
                Nothing washed up
              </h2>
              <p className="text-navy-400 mb-8 max-w-md mx-auto font-light">
                {query.trim()
                  ? `Nothing washed up for "${query}". Try Gullying something else.`
                  : "Nothing here. Try a different filter."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/eat" className="btn-coral px-6 py-3 rounded-xl text-sm font-medium">
                  Browse Restaurants
                </Link>
                <Link href="/history" className="px-6 py-3 rounded-xl text-sm font-medium bg-navy-100 text-navy-700 hover:bg-navy-200 transition-colors">
                  Explore Heritage
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
