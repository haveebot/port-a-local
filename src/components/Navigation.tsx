"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-palm-950/95 backdrop-blur-md shadow-lg shadow-palm-950/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-gold-400 text-2xl font-display font-bold tracking-wide">
              PORT A LOCAL
            </span>
            <span className="text-gold-500/60 text-xs font-medium tracking-[0.2em] uppercase hidden sm:inline">
              co
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-gold-400 hover:bg-palm-800/50 transition-all duration-300"
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-sand-300 hover:text-gold-400 hover:bg-palm-800/50 transition-colors"
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
          <div className="md:hidden pb-4 border-t border-gold-500/20">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-sand-200 hover:text-gold-400 hover:bg-palm-800/50 rounded-lg transition-colors"
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
