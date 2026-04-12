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
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-coral-400 text-2xl font-display font-bold tracking-wide">
              PORT A LOCAL
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
            <Link
              href="/services"
              className="px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              🛠️ Services
            </Link>
            <Link
              href="/search"
              title="Search"
              className="px-3 py-2 rounded-lg text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/beach"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-coral-500/20 text-coral-300 hover:bg-coral-500/30 transition-all duration-300 border border-coral-500/30"
            >
              🏖️ Beach Rentals
            </Link>
            <Link
              href="/rent"
              className="ml-1 px-4 py-2 rounded-lg text-sm font-medium bg-coral-500/20 text-coral-300 hover:bg-coral-500/30 transition-all duration-300 border border-coral-500/30"
            >
              🛺 Rent a Cart
            </Link>
            <Link
              href="/maintenance"
              className="ml-1 px-4 py-2 rounded-lg text-sm font-medium bg-coral-500/20 text-coral-300 hover:bg-coral-500/30 transition-all duration-300 border border-coral-500/30"
            >
              🔧 Maintenance
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-sand-300 hover:text-coral-400 hover:bg-navy-800/50 transition-colors"
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
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🔍 Search
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
            <Link
              href="/services"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🛠️ Services
            </Link>
            <Link
              href="/beach"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🏖️ Beach Rentals
            </Link>
            <Link
              href="/rent"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🛺 Rent a Cart
            </Link>
            <Link
              href="/maintenance"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors"
            >
              🔧 Maintenance
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
