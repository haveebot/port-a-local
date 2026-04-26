"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import LighthouseMark from "@/components/brand/LighthouseMark";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const portalLinkClass =
    "px-4 py-2 rounded-full text-sm font-medium bg-coral-500/15 text-coral-300 border border-coral-500/25 hover:bg-coral-500/25 hover:border-coral-500/40 transition-all duration-300";

  const dropdownLinkClass =
    "flex items-center gap-3 px-4 py-3 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-white/5 transition-colors";

  const mobileLinkClass =
    "block px-4 py-2.5 text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors";

  const sectionHeaderClass =
    "px-4 pt-4 pb-1 text-[10px] font-semibold text-navy-500 uppercase tracking-widest";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy-950/95 backdrop-blur-md shadow-lg shadow-navy-950/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Port A Local — home">
            <span className="transition-transform duration-500 group-hover:-rotate-3">
              <LighthouseMark size={42} variant="light" detail="standard" />
            </span>
            <span className="flex flex-col">
              <span className="text-coral-400 text-2xl sm:text-3xl font-display font-bold tracking-wide leading-none">
                PORT A LOCAL
              </span>
              <span className="text-navy-400 text-[10px] font-medium tracking-[0.3em] uppercase mt-1">
                Port Aransas, TX
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {/* Explore dropdown — directory & activities */}
            <div ref={exploreRef} className="relative">
              <button
                onClick={() => { setExploreOpen(!exploreOpen); setDiscoverOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
              >
                Explore
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-xl bg-navy-900/98 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                  {categories.map((cat) => (
                    <Link key={cat.slug} href={`/${cat.slug}`} onClick={() => setExploreOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name={cat.slug as PortalIconName} className="w-4 h-4 text-coral-400 shrink-0" />
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-white/10">
                    <Link href="/services" onClick={() => setExploreOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="services" className="w-4 h-4 text-coral-400 shrink-0" />
                      Services
                    </Link>
                    <Link href="/events" onClick={() => setExploreOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="events" className="w-4 h-4 text-coral-400 shrink-0" />
                      Events
                    </Link>
                    <Link href="/live-music" onClick={() => setExploreOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="art" className="w-4 h-4 text-coral-400 shrink-0" />
                      Live Music
                    </Link>
                    <Link href="/fishing-report" onClick={() => setExploreOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="fish" className="w-4 h-4 text-coral-400 shrink-0" />
                      Fishing Report
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Discover dropdown — content & tools */}
            <div ref={discoverRef} className="relative">
              <button
                onClick={() => { setDiscoverOpen(!discoverOpen); setExploreOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-sand-200 hover:text-coral-300 hover:bg-navy-800/50 transition-all duration-300"
              >
                Discover
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${discoverOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {discoverOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-xl bg-navy-900/98 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                  <Link href="/history" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="heritage" className="w-4 h-4 text-coral-400 shrink-0" />
                    Heritage
                  </Link>
                  <Link href="/dispatch" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="dispatch" className="w-4 h-4 text-coral-400 shrink-0" />
                    Dispatch
                  </Link>
                  <Link href="/archives" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="archives" className="w-4 h-4 text-coral-400 shrink-0" />
                    Archives
                  </Link>
                  <Link href="/guides" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="guides" className="w-4 h-4 text-coral-400 shrink-0" />
                    Guides
                  </Link>
                  <Link href="/where-to-stay" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="stay" className="w-4 h-4 text-coral-400 shrink-0" />
                    Where to Stay
                  </Link>
                  <Link href="/essentials" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                    <PortalIcon name="essentials" className="w-4 h-4 text-coral-400 shrink-0" />
                    Essentials
                  </Link>
                  <div className="border-t border-white/10">
                    <Link href="/live" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="live" className="w-4 h-4 text-coral-400 shrink-0" />
                      Island Pulse
                    </Link>
                    <Link href="/map" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="map" className="w-4 h-4 text-coral-400 shrink-0" />
                      Map
                    </Link>
                    <Link href="/photos" onClick={() => setDiscoverOpen(false)} className={dropdownLinkClass}>
                      <PortalIcon name="photos" className="w-4 h-4 text-coral-400 shrink-0" />
                      Photos
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
              <PortalIcon name="mytrip" className="w-5 h-5" />
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white/15 mx-1" />

            {/* Three-vertical portal cluster — cleaner than the previous 6-pill row */}
            <Link
              href="/deliver"
              className={`${portalLinkClass} inline-flex items-center gap-1.5`}
              title="PAL Delivery — local food to your beach house"
            >
              <PortalIcon name="eat" className="w-3.5 h-3.5" />
              Delivery
            </Link>
            <Link
              href="/rent"
              className={`${portalLinkClass} inline-flex items-center gap-1.5`}
              title="PAL Rentals — golf carts, beach gear (more vendors coming)"
            >
              <PortalIcon name="cart" className="w-3.5 h-3.5" />
              Rentals
            </Link>
            <Link
              href="/locals"
              className={`${portalLinkClass} inline-flex items-center gap-1.5`}
              title="PAL Services — hire locals for photography, captains, cleaning, errands"
            >
              <PortalIcon name="services" className="w-3.5 h-3.5" />
              Services
            </Link>

            {/* Runner home — for active runners. Page redirects unsigned-in
                visitors to /lookup so it's harmless for non-runners. */}
            <Link
              href="/deliver/driver"
              title="Runner home — your driver dashboard"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold tracking-wide text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            >
              Runner →
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

        {/* Mobile menu — capped at viewport-minus-header with internal scroll */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-coral-500/20 bg-navy-950/98 backdrop-blur-md max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
            {/* Gully */}
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

            {/* Explore */}
            <p className={sectionHeaderClass}>Explore</p>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/${cat.slug}`} onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}>
                <PortalIcon name={cat.slug as PortalIconName} className="w-4 h-4 text-coral-400 shrink-0" />{cat.name}
              </Link>
            ))}
            <Link href="/services" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="services" className="w-4 h-4 text-coral-400 shrink-0" /> Services</Link>
            <Link href="/events" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="events" className="w-4 h-4 text-coral-400 shrink-0" /> Events</Link>
            <Link href="/live-music" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="art" className="w-4 h-4 text-coral-400 shrink-0" /> Live Music</Link>
            <Link href="/fishing-report" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="fish" className="w-4 h-4 text-coral-400 shrink-0" /> Fishing Report</Link>

            {/* Discover */}
            <p className={sectionHeaderClass}>Discover</p>
            <Link href="/history" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="heritage" className="w-4 h-4 text-coral-400 shrink-0" /> Heritage</Link>
            <Link href="/dispatch" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="dispatch" className="w-4 h-4 text-coral-400 shrink-0" /> Dispatch</Link>
            <Link href="/archives" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="archives" className="w-4 h-4 text-coral-400 shrink-0" /> Archives</Link>
            <Link href="/guides" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="guides" className="w-4 h-4 text-coral-400 shrink-0" /> Guides</Link>
            <Link href="/where-to-stay" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="stay" className="w-4 h-4 text-coral-400 shrink-0" /> Where to Stay</Link>
            <Link href="/essentials" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="essentials" className="w-4 h-4 text-coral-400 shrink-0" /> Essentials</Link>
            <Link href="/live" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="live" className="w-4 h-4 text-coral-400 shrink-0" /> Island Pulse</Link>
            <Link href="/map" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="map" className="w-4 h-4 text-coral-400 shrink-0" /> Map</Link>
            <Link href="/photos" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="photos" className="w-4 h-4 text-coral-400 shrink-0" /> Photos</Link>

            {/* My Trip */}
            <p className={sectionHeaderClass}>My Trip</p>
            <Link href="/my-trip" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}><PortalIcon name="mytrip" className="w-4 h-4 text-coral-400 shrink-0" /> Saved Spots</Link>

            {/* Delivery vertical */}
            <p className={sectionHeaderClass}>Delivery</p>
            <Link href="/deliver" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors">
              <PortalIcon name="eat" className="w-4 h-4 shrink-0" />
              Order food
            </Link>
            <Link href="/deliver/driver" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}>
              <PortalIcon name="services" className="w-4 h-4 text-emerald-400 shrink-0" />
              Runner home
            </Link>
            <Link href="/deliver/runner" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}>
              <PortalIcon name="services" className="w-4 h-4 text-coral-400 shrink-0" />
              Drive for PAL (sign up)
            </Link>

            {/* Rentals vertical */}
            <p className={sectionHeaderClass}>Rentals</p>
            <Link href="/rent" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors">
              <PortalIcon name="cart" className="w-4 h-4 shrink-0" />
              Golf carts
            </Link>
            <Link href="/beach" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors">
              <PortalIcon name="beach" className="w-4 h-4 shrink-0" />
              Beach gear
            </Link>

            {/* Services vertical */}
            <p className={sectionHeaderClass}>Services</p>
            <Link href="/locals" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors">
              <PortalIcon name="services" className="w-4 h-4 shrink-0" />
              Hire locals
            </Link>
            <Link href="/maintenance" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-coral-300 hover:bg-navy-800/50 rounded-lg transition-colors">
              <PortalIcon name="maintenance" className="w-4 h-4 shrink-0" />
              Property maintenance
            </Link>
            <Link href="/locals/offer" onClick={() => setMobileOpen(false)} className={`${mobileLinkClass} flex items-center gap-2`}>
              <PortalIcon name="services" className="w-4 h-4 text-coral-400 shrink-0" />
              List on PAL
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
