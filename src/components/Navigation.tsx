"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const portalLinkClass =
    "px-4 py-2 rounded-full text-sm font-medium bg-coral-500/15 text-coral-300 border border-coral-500/25 hover:bg-coral-500/25 hover:border-coral-500/40 transition-all duration-300";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy-950/95 backdrop-blur-md shadow-lg shadow-navy-950/20"
          : "bg-transparent"
      }`}
    >
      {/* Persistent gradient — ensures nav links are readable on any background */}
      {!scrolled && (
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 to-transparent pointer-events-none" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          <Link href="/" className="flex flex-col group">
            <span className="text-coral-400 text-3xl font-display font-bold tracking-wide leading-none">
              PORT A LOCAL
            </span>
            <span className="text-navy-400 text-[10px] font-medium tracking-[0.3em] uppercase mt-0.5">
              Port Aransas, TX
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {/* Explore dropdown */}
            <div ref={exploreRef} className="relative">
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
              >
                Explore
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 sm:w-56 rounded-xl bg-navy-900/98 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-white/10">
                    <Link
                      href="/services"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">🛠️</span>
                      Services
                    </Link>
                    <Link
                      href="/events"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">🎪</span>
                      Events
                    </Link>
                    <Link
                      href="/fishing-report"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">🎣</span>
                      Fishing Report
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/history"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              History
            </Link>
            <Link
              href="/guides"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              Guides
            </Link>
            <Link
              href="/live"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              Live
            </Link>
            <Link
              href="/essentials"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              Essentials
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              Map
            </Link>

            {/* Gully search pill */}
            <Link
              href="/gully"
              title="Just Gully It — search the island"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-navy-300 bg-white/8 border border-white/15 hover:bg-white/15 hover:text-sand-100 hover:border-white/25 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">Gully it...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-navy-400 border border-white/10">⌘K</kbd>
            </Link>

            {/* My Trip */}
            <Link
              href="/my-trip"
              title="My Trip — saved spots"
              className="p-2 rounded-full text-navy-400 hover:text-coral-400 hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white/15 mx-1" />

            {/* Portal links — uniform pills */}
            <Link href="/beach" className={portalLinkClass}>
              🏖️ Beach
            </Link>
            <Link href="/rent" className={portalLinkClass}>
              🛺 Carts
            </Link>
            <Link href="/maintenance" className={portalLinkClass}>
              🔧 Maintenance
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 rounded-lg text-sand-300 hover:text-coral-400 hover:bg-navy-800/50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-coral-500/20 bg-navy-950/98 backdrop-blur-md">
            {/* Gully — top of mobile menu */}
            <Link
              href="/gully"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 mx-3 mt-3 mb-2 px-4 py-3 rounded-xl text-sm font-medium text-navy-300 bg-white/5 border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Gully it...
            </Link>

            {/* Categories */}
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-navy-500 uppercase tracking-widest">
              Explore
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
            <Link
              href="/services"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🛠️ Services
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🎪 Events
            </Link>
            <Link
              href="/fishing-report"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🎣 Fishing Report
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              📖 History
            </Link>
            <Link
              href="/guides"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              📋 Guides
            </Link>
            <Link
              href="/map"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🗺️ Map
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              📡 Live
            </Link>
            <Link
              href="/essentials"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🧭 Essentials
            </Link>
            <Link
              href="/where-to-stay"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🏠 Where to Stay
            </Link>
            <Link
              href="/photos"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              📸 Photos
            </Link>
            <Link
              href="/my-trip"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              ❤️ My Trip
            </Link>

            {/* Portals */}
            <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-navy-500 uppercase tracking-widest">
              Book Direct
            </p>
            <Link
              href="/beach"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🏖️ Beach Rentals
            </Link>
            <Link
              href="/rent"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🛺 Rent a Cart
            </Link>
            <Link
              href="/maintenance"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🔧 Maintenance
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
