"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { businesses } from "@/data/businesses";
import type { Business } from "@/data/businesses";

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

const categoryEmoji: Record<string, string> = {
  eat: "🍽️",
  drink: "🍹",
  fish: "🎣",
  do: "🏄",
  shop: "🛍️",
  stay: "🏨",
  maintenance: "🔧",
  realty: "🏠",
};

const popularChips = [
  { label: "🍔 Burgers", query: "Burgers" },
  { label: "🎣 Charter Fishing", query: "Charter Fishing" },
  { label: "🍹 Happy Hour", query: "Happy Hour" },
  { label: "🌮 Tacos", query: "Tacos" },
  { label: "☕ Coffee", query: "Coffee" },
  { label: "🏖️ Family Friendly", query: "Family Friendly" },
  { label: "🌙 Late Night", query: "Late Night" },
  { label: "🦞 Seafood", query: "Seafood" },
];

export default function GullyPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results: Business[] =
    query.trim().length >= 2
      ? fuse.search(query).slice(0, 8).map((r) => r.item)
      : [];

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      closePalette();
    },
    [router, closePalette]
  );

  // Keyboard listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K — always trigger
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          closePalette();
        } else {
          openPalette();
        }
        return;
      }

      // "/" when not focused on input/textarea
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          e.preventDefault();
          openPalette();
          return;
        }
      }

      // Escape to close
      if (e.key === "Escape" && open) {
        closePalette();
        return;
      }

      // Enter to open in Gully
      if (e.key === "Enter" && open) {
        navigateTo(`/gully?q=${encodeURIComponent(query)}`);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, query, openPalette, closePalette, navigateTo]);

  // Auto-focus input on open
  useEffect(() => {
    if (open) {
      // Small tick to let the DOM render
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-navy-950/80 backdrop-blur-sm"
      onClick={closePalette}
    >
      <div
        className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
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
            placeholder="Search Port Aransas..."
            className="w-full pl-12 pr-4 py-4 text-navy-900 text-base border-b border-sand-200 focus:outline-none"
          />
        </div>

        {/* Results area */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim().length < 2 ? (
            /* Popular chips */
            <div className="p-4">
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularChips.map((chip) => (
                  <button
                    key={chip.query}
                    onClick={() => setQuery(chip.query)}
                    className="px-3 py-1.5 rounded-full text-sm bg-sand-100 text-navy-700 hover:bg-coral-50 hover:text-coral-600 border border-sand-200 cursor-pointer transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Search results */
            <>
              {results.map((biz) => (
                <button
                  key={biz.slug}
                  onClick={() => navigateTo(`/${biz.category}/${biz.slug}`)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-sand-50 cursor-pointer transition-colors border-b border-sand-100 last:border-0"
                >
                  <span className="text-xl flex-shrink-0">
                    {categoryEmoji[biz.category] ?? "📍"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900">{biz.name}</p>
                    <p className="text-sm text-navy-400 truncate">{biz.tagline}</p>
                  </div>
                  <span className="text-xs text-navy-300 capitalize flex-shrink-0">
                    {biz.category}
                  </span>
                </button>
              ))}
              {/* View all link */}
              <button
                onClick={() => navigateTo(`/gully?q=${encodeURIComponent(query)}`)}
                className="block w-full px-4 py-3 text-center text-sm text-coral-500 hover:text-coral-600 hover:bg-sand-50 font-medium"
              >
                View all results in Gully →
              </button>
            </>
          ) : (
            /* No results */
            <div className="px-4 py-8 text-center">
              <span className="text-3xl block mb-2">🌊</span>
              <p className="text-navy-400 mb-3">No results for &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => navigateTo(`/gully?q=${encodeURIComponent(query)}`)}
                className="text-sm text-coral-500 hover:text-coral-600 font-medium"
              >
                Try searching in Gully →
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-sand-50 border-t border-sand-100 text-xs text-navy-400">
          <span>esc to close</span>
          <span>↵ to open in Gully</span>
        </div>
      </div>
    </div>
  );
}
