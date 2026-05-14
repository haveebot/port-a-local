import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import FeaturedSpots from "@/components/FeaturedSpots";
import FeaturedEventBanner from "@/components/FeaturedEventBanner";
import Footer from "@/components/Footer";
import { WebsiteSchema } from "@/components/StructuredData";
import { categories } from "@/data/categories";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";
import AskGullyTrending from "@/components/AskGullyTrending";
import Image from "next/image";
import Link from "next/link";

// Re-render hourly so date-based timed sections (e.g. Mother's Day,
// future seasonal callouts) tick over without needing a fresh deploy.
export const revalidate = 3600;

// Timed-content cutoff registry. Pattern: define an end timestamp per
// timed section; gate the section's render with a `Date.now() < cutoff`
// check. Standalone guide pages stay live; only the homepage callout
// disappears. Add new entries here as future seasonal sections ship.
const MOTHERS_DAY_CUTOFF_MS = new Date(
  "2026-05-11T05:00:00.000Z",
).getTime(); // Midnight Sunday May 10 → Monday May 11, Central Daylight Time.

// Summer Countdown target = midnight CDT going into Saturday May 23 (= end
// of Friday May 22). Section never hides; countdown floors at 0 once the
// target passes.
const SUMMER_COUNTDOWN_TARGET_MS = new Date(
  "2026-05-23T05:00:00.000Z",
).getTime();

// Services on the Island — Book Direct tiles. Three colored tile cards
// linking to /rent, /beach, /maintenance. Layout/copy locked from C's
// mockup; colors mapped to PAL brand tokens (coral / ocean / seafoam).
interface ServiceTile {
  href: string;
  heading: string;
  body: string;
  buttonLabel: string;
  bgClass: string;
  iconName: PortalIconName;
}

const SERVICE_TILES: ServiceTile[] = [
  {
    href: "/rent",
    heading: "Golf Cart Rentals",
    body: "The best way to get around Port Aransas. Reserve and pick up or we'll have it delivered.",
    buttonLabel: "Reserve",
    bgClass: "bg-coral-400 hover:bg-coral-500",
    iconName: "cart",
  },
  {
    href: "/beach",
    heading: "Beach Day Rentals",
    body: "Chairs and umbrellas, cooler and more delivered to the sand. You just show up and enjoy the beach.",
    buttonLabel: "Book",
    bgClass: "bg-ocean-400 hover:bg-ocean-500",
    iconName: "beach",
  },
  {
    href: "/maintenance",
    heading: "Maintenance",
    body: "Need something fixed? Submit a request and we'll connect you with Port A's most trusted.",
    buttonLabel: "Schedule",
    bgClass: "bg-seafoam-500 hover:bg-seafoam-600",
    iconName: "maintenance",
  },
];

export default function Home() {
  const showMothersDay = Date.now() < MOTHERS_DAY_CUTOFF_MS;
  const daysToSummer = Math.max(
    0,
    Math.floor((SUMMER_COUNTDOWN_TARGET_MS - Date.now()) / 86400000),
  );

  return (
    <main className="min-h-screen">
      <WebsiteSchema />
      <Navigation />
      <Hero />

      {/* Directory — relocated above Kite Festival; pier photo at 50%
          opacity over navy as background; cards on left, heading on right
          on desktop (mock-up: 2026-05-07 Collie homepage redesign). */}
      <section className="relative py-12 sm:py-20 lg:py-28 bg-navy-900 overflow-hidden" id="explore">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="/images/pal-home-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        {/* Subtle navy wash to keep text legible across all viewport sizes */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-transparent to-navy-900/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Heading — first in DOM order; visually right on desktop */}
            <div className="lg:col-span-4 lg:order-last text-center lg:text-right">
              <p className="text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                Browse by Category
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 leading-[1.05] mb-6">
                Explore<br />
                <span className="italic text-coral-400">Port Aransas</span>
              </h2>
              <div className="coral-line max-w-xs mx-auto lg:mx-0 lg:ml-auto mb-6" />
              <p className="text-xs sm:text-sm text-sand-100 tracking-[0.2em] uppercase font-medium">
                Every listing is vetted by locals.
              </p>
            </div>

            {/* Cards — 3×2 on desktop+, 2×3 on mobile (was 1×6 mobile, too tall) */}
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {categories.map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mother's Day in Port A — links to /guides/mothers-day. Coral-300
          band; italic display headline left, CTA copy middle, location-
          heart pin icon right. (2026-05-07 Mother's Day weekend feature.)
          Auto-hides after MOTHERS_DAY_CUTOFF_MS (midnight Sun → Mon CT). */}
      {showMothersDay && (
        <Link
          href="/guides/mothers-day"
          className="block bg-coral-300 hover:bg-coral-400 transition-colors group"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5">
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 italic leading-[1.0]">
                  Celebrate<br />
                  Mother&apos;s Day<br />
                  in Port A.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:border-l lg:border-sand-50/40 lg:pl-10">
                <p className="text-base sm:text-lg text-navy-900 font-light leading-relaxed">
                  Check out our curated Local guide to plan the perfect weekend for your leading lady.
                </p>
              </div>
              <div className="lg:col-span-3 flex justify-center lg:justify-end">
                <Image
                  src="/icons/location-heart.svg"
                  alt=""
                  width={144}
                  height={144}
                  className="w-32 h-32 sm:w-36 sm:h-36 group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Summer Countdown — coral circle running countdown to end of Fri
          May 22 CDT. Floors at 0; section never auto-hides. Layout follows
          C's Canva mockup: 3-col (circle / center stack / navy CTA). */}
      <section className="bg-sand-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-10 sm:gap-12 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-coral-300 text-navy-900 flex flex-col items-center justify-center">
                <span className="font-display text-7xl sm:text-8xl font-bold leading-none">
                  {daysToSummer}
                </span>
                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase mt-2 font-bold">
                  {daysToSummer === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-navy-900 mb-5 leading-loose">
                Plan your trip
                <br />
                Book your services
              </p>
              <div className="h-px bg-navy-900 max-w-md mx-auto mb-5" />
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-coral-400 mb-5 italic">
                Summer Countdown
              </h2>
              <div className="h-px bg-navy-900 max-w-md mx-auto mb-5" />
              <p className="text-base sm:text-lg text-navy-900 font-light leading-relaxed max-w-md mx-auto">
                Check out our curated guide for where to eat, what to do, and book ahead for a seamless Summer getaway.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/guides/summer"
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-base tracking-wide transition-colors"
              >
                Plan your Summer
                <svg className="ml-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services on the Island — Book Direct, redesigned per C's mockup
          (2026-05-13 PR #4). Navy section bg, three colored tile cards
          with italic display headings + navy pill buttons + white icons. */}
      <section className="py-24 bg-navy-900 relative">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Book Direct
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
              Services on the Island
            </h2>
            <div className="coral-line max-w-xs mx-auto mb-6" />
            <p className="text-lg text-navy-200 max-w-2xl mx-auto font-light">
              Skip the runaround. Book directly through Port A Local. Our local team handles everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_TILES.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group block rounded-3xl ${tile.bgClass} transition-colors p-8 sm:p-10 relative overflow-hidden`}
              >
                <PortalIcon
                  name={tile.iconName}
                  className="absolute right-4 bottom-4 w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 text-white/85 pointer-events-none"
                />
                <div className="relative z-10 max-w-[65%]">
                  <h3 className="font-display italic text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                    {tile.heading}
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8">
                    {tile.body}
                  </p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-900 text-white text-xs tracking-[0.2em] uppercase font-bold group-hover:bg-navy-800 transition-colors">
                    {tile.buttonLabel}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Order Local Delivery — restyled to match C's Canva mockup
          (2026-05-13 PR #6 follow-up). Full-bleed aerial bg with a
          two-column layout: outlined negative-space tiles on the left
          (icon top, colored pill at bottom with EAT/DRIVE + subtitle
          + arrow), title block on the right (eyebrow caps + split-
          color heading "Order Local" italic white / "Delivery" navy,
          white hairline, navy body copy). */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <Image
          src="/images/pal-delivery-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top sm:object-center"
        />
        <div className="absolute top-0 left-0 right-0 coral-line z-10" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Title (right column on desktop, top on mobile) */}
            <div className="lg:order-2 text-center lg:text-right">
              <p className="text-white text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold mb-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                Order Online &amp; Dine
              </p>
              <h2 className="font-display font-bold leading-[1.0] mb-6">
                <span className="block italic text-white text-5xl sm:text-6xl lg:text-7xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  Order Local
                </span>
                <span className="block text-navy-900 text-5xl sm:text-6xl lg:text-7xl mt-1">
                  Delivery
                </span>
              </h2>
              <div className="h-px bg-white max-w-md mx-auto lg:ml-auto lg:mr-0 mb-6" />
              <p className="text-white text-base sm:text-lg font-light leading-relaxed max-w-md mx-auto lg:ml-auto lg:mr-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                40+ kitchens, full menus, real prices.
                <br />
                Order through PAL where we deliver.
                <br />
                Call direct from the rest.
              </p>
            </div>

            {/* Tiles (left column on desktop, below title on mobile) */}
            <div className="lg:order-1 grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0 w-full">
              <Link
                href="/deliver"
                className="group block rounded-2xl border-2 border-white p-3 sm:p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 flex items-center justify-center py-6 sm:py-8 min-h-[120px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/eat.svg"
                    alt=""
                    aria-hidden
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                  />
                </div>
                <div className="rounded-xl bg-navy-900 px-3 py-3 text-center">
                  <p className="text-white text-sm tracking-[0.25em] uppercase font-bold mb-1">
                    EAT
                  </p>
                  <p className="text-white/85 text-[11px] sm:text-xs leading-tight mb-2">
                    Browse all Restaurants
                  </p>
                  <svg className="w-4 h-4 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>

              <Link
                href="/deliver/runner"
                className="group block rounded-2xl border-2 border-white p-3 sm:p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 flex items-center justify-center py-6 sm:py-8 min-h-[120px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/driver.svg"
                    alt=""
                    aria-hidden
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                  />
                </div>
                <div className="rounded-xl bg-coral-500 px-3 py-3 text-center">
                  <p className="text-white text-sm tracking-[0.25em] uppercase font-bold mb-1">
                    DRIVE
                  </p>
                  <p className="text-white/85 text-[11px] sm:text-xs leading-tight mb-2">
                    Drive for Port A Local
                  </p>
                  <svg className="w-4 h-4 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSpots />

      {/* Just Gully It — Gully introduced as a brand character (seagull
          with gold "LOCAL" medallion necklace). Layout: Gully on the left,
          right-aligned content on the right. Same character treatment is
          applied to /gully and /not-found. (2026-05-07 Collie mock-up.) */}
      <section className="py-16 sm:py-20 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 palm-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Gully — left column on desktop, top on mobile */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <Image
                src="/icons/gully-search.svg"
                alt="Gully — Port A's local search engine"
                width={500}
                height={500}
                className="w-56 sm:w-72 lg:w-full lg:max-w-md h-auto"
                priority
              />
            </div>

            {/* Content — right column on desktop, right-aligned */}
            <div className="lg:col-span-7 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Port A&apos;s Search Engine
              </div>

              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-sand-50 leading-[0.95] mb-6">
                Just
                <br />
                <span className="italic text-coral-400">Gully</span>
                <br />
                It
              </h2>

              <p className="text-base sm:text-lg text-navy-200 font-light max-w-xl mx-auto mb-8 leading-relaxed">
                Gully knows the island. Search locally-vetted businesses, heritage articles, menus, adventures, happy hours and more. No ads, no sponsored results. Just local results from your favorite Local — Gully.
              </p>

              <form action="/gully" className="max-w-2xl mx-auto mb-6 relative">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    name="q"
                    placeholder="Gully it..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-navy-900 bg-white border border-sand-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-coral-400 text-base"
                  />
                </div>
              </form>

              <p className="text-xs text-coral-300 uppercase tracking-[0.2em] mb-3 inline-flex items-center justify-center gap-2 w-full flex-wrap">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
                  <path d="M19 14l.9 2.7L22 17.5l-2.1.8L19 21l-.9-2.7L16 17.5l2.1-.8L19 14z" opacity="0.7" />
                </svg>
                Or just ask Gully
                <span className="text-[10px] text-navy-400 font-mono normal-case tracking-normal">
                  · powered by Heye Lab
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "What is Sandfest?", q: "What is Sandfest?" },
                  { label: "Where can I see dolphins?", q: "Where can I see dolphins?" },
                  { label: "Where can I rent a golf cart?", q: "Where can I rent a golf cart?" },
                  { label: "What is the Tarpon Inn?", q: "What is the Tarpon Inn?" },
                  { label: "What is a Farley Boat?", q: "What is a Farley Boat?" },
                ].map((prompt) => (
                  <a
                    key={prompt.q}
                    href={`/gully?q=${encodeURIComponent(prompt.q)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-coral-500/15 text-coral-100 hover:bg-coral-500/25 hover:text-white border border-coral-400/40 transition-colors"
                  >
                    <svg className="w-3 h-3 shrink-0 text-coral-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
                    </svg>
                    {prompt.label}
                  </a>
                ))}
              </div>

              <AskGullyTrending variant="homepage" />
            </div>
          </div>
        </div>
      </section>

      {/* Port A Heritage — B&W president-fishing photo as full-bleed
          background; navy gradient on left holds the editorial text card. */}
      <section className="relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/president-fishing-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center sm:object-right"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-md lg:max-w-lg">
            <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Local History
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
              Port A Heritage
            </h2>
            <div className="gold-line max-w-xs mb-6" />
            <p className="text-lg text-navy-200 font-light leading-relaxed mb-8">
              The people, places, and moments that shaped Port Aransas. From the Tarpon Era to the Farley
              Boat Works, from a president&apos;s famous catch to the storms that couldn&apos;t keep this island down.
            </p>
            <a
              href="/history"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl btn-coral text-sm font-semibold gap-2"
            >
              Explore Our Heritage
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Live and Local — NEW section per C's mockup (PR #7). Two-column
          50/50 split: concert photo on the left, coral panel on the right
          with navy music-note circle, eyebrow, split-color "Live and
          Local" headline, navy hairline, body, and navy Live Music CTA. */}
      <section className="grid md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[480px]">
          <Image
            src="/images/live-music-bg.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="bg-coral-400 flex flex-col items-center justify-center px-6 sm:px-10 py-12 sm:py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-navy-900 flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M9 17V5l11-2v12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="17" r="3" />
              <circle cx="17" cy="15" r="3" />
            </svg>
          </div>
          <p className="text-navy-900 text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold mb-4">
            Explore <span className="mx-1">·</span> Live Music
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-none mb-5">
            <span className="text-navy-900">Live </span>
            <span className="italic text-white">and</span>
            <span className="text-navy-900"> Local</span>
          </h2>
          <div className="h-px bg-navy-900 max-w-md w-full mb-5" />
          <p className="text-navy-900 text-base sm:text-lg font-light leading-relaxed max-w-md mb-7">
            Check out the upcoming acts around town and plan your trip.
          </p>
          <Link
            href="/live-music"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold tracking-wide transition-colors"
          >
            Live Music
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Deep Sea Roundup featured event — relocated here from above the
          Directory per C's mockup. Component logic unchanged; it picks the
          soonest in-flight featured event and renders nothing off-season. */}
      <FeaturedEventBanner />

      {/* Business Name Strip — relocated, styling unchanged */}
      <section className="py-14 bg-navy-900 border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-navy-400 text-sm font-medium tracking-[0.2em] uppercase mb-8">
            Places you&apos;ll find on Port A Local
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              "Woody's Last Stand",
              "JOY Cart Rentals",
              "Saltwater Gypsies",
              "Trout Street Bar & Grill",
              "Alister Square Inn",
              "Deep Sea Headquarters",
              "Shorty's",
              "Fly It! Port A",
              "Winton's Island Candy",
              "Port Plumbing Co.",
              "Fox Yacht Sales",
              "The Connoisseur",
            ].map((name) => (
              <span key={name} className="text-center text-navy-300 font-medium text-sm hover:text-coral-400 transition-colors cursor-default py-1">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              From Our Visitors
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              What People Are Saying
            </h2>
            <div className="coral-line max-w-xs mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-sand-200 p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-navy-500 leading-relaxed mb-6 font-light italic">
                &ldquo;We&apos;ve been coming to Port A for years and always relied on recommendations from friends. Port A Local finally puts it all in one place. We found spots we never would have found on our own.&rdquo;
              </p>
              <div>
                <div className="font-semibold text-navy-900 text-sm">Jamie R.</div>
                <div className="text-navy-400 text-sm">Austin, TX</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-navy-500 leading-relaxed mb-6 font-light italic">
                &ldquo;Booked a golf cart and beach setup through the site before we even left Houston. Everything was handled, everything was ready. That&apos;s exactly the kind of trip planning tool Port A needed.&rdquo;
              </p>
              <div>
                <div className="font-semibold text-navy-900 text-sm">Marcus & Tina L.</div>
                <div className="text-navy-400 text-sm">Houston, TX</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-navy-500 leading-relaxed mb-6 font-light italic">
                &ldquo;I love that there are no sponsored results or ads. You can tell this was put together by people who actually care about the island. Every place we tried was legit.&rdquo;
              </p>
              <div>
                <div className="font-semibold text-navy-900 text-sm">Carla M.</div>
                <div className="text-navy-400 text-sm">San Antonio, TX</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Our Mission
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
              Why Port A Local?
            </h2>
            <div className="coral-line max-w-xs mx-auto mb-8" />
            <p className="text-lg text-navy-400 leading-relaxed mb-12 font-light">
              Port Aransas is one of the most beloved beach towns on the Texas coast, but finding
              the real gems has always been word-of-mouth. We built Port A Local to change that.
              One place to discover businesses that are genuinely local, genuinely good, and
              genuinely cared about by the community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-4">
                  <PortalIcon name="palm" className="w-7 h-7 text-navy-900" />
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">Island Curated</h3>
                <p className="text-sm text-navy-400 font-light">
                  Every business is reviewed and approved by people who live and work on the island.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center mx-auto mb-4">
                  <PortalIcon name="handshake" className="w-7 h-7 text-coral-600" />
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">Community First</h3>
                <p className="text-sm text-navy-400 font-light">
                  We exist to serve Port Aransas. Connecting visitors with the businesses that make this town great.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <PortalIcon name="trophy" className="w-7 h-7 text-navy-900" />
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">No Pay-to-Play</h3>
                <p className="text-sm text-navy-400 font-light">
                  Listings aren&apos;t for sale. You earn your spot by being great at what you do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Businesses */}
      <section className="py-24 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Join Our Community
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
            Own a Business in Port A?
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-200 max-w-2xl mx-auto mb-10 font-light">
            If you run a local business and want to be featured on Port A Local,
            we&apos;d love to hear from you. Our vetting process is simple and free.
          </p>
          <a
            href="mailto:hello@theportalocal.com"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl btn-coral text-lg tracking-wide"
          >
            Get Listed
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
