import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/brand/PortalIcon";
import EventCountdown from "@/components/EventCountdown";
import { events as detailedEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events & Happenings — Port Aransas, TX | Port A Local",
  description:
    "Festivals, fishing tournaments, live music, and community events in Port Aransas, TX. SandFest, Deep Sea Roundup, Beachtober, and more — all year long.",
};

interface PAEvent {
  name: string;
  timing: string;
  location: string;
  description: string;
  icon: string;
  /** If set, the event card links to this detail page slug under /events/ */
  detailSlug?: string;
  /** Best-guess next occurrence (ISO date). Updated annually. Used for "next up" sort. */
  nextDateISO?: string;
}

const eventsByMonth: { month: string; events: PAEvent[] }[] = [
  {
    month: "January",
    events: [
      { name: "Restaurant Week", timing: "Mid-January through early February", location: "Island-wide", description: "Participating restaurants offer special prix-fixe menus — $25 lunch, $25 brunch, $35-$50 dinner. The best excuse to try somewhere new.", icon: "🍽️", nextDateISO: "2027-01-15" },
      { name: "PAPHA Winter Lecture Series", timing: "Mondays in January", location: "Port Aransas Museum", description: "Weekly lectures on local history, culture, and heritage. Topics range from Karankawa history to the founding of UTMSI. Free and open to the public.", icon: "📖", nextDateISO: "2027-01-04" },
    ],
  },
  {
    month: "February",
    events: [
      { name: "Whooping Crane Festival", timing: "Third weekend of February", location: "Island-wide + Aransas NWR", description: "Multi-day nature festival with expert birding tours, lectures, photography workshops, and boat trips to see the world's rarest crane at the Aransas National Wildlife Refuge.", icon: "🦅", nextDateISO: "2027-02-19" },
      { name: "Mardi Gras Parade", timing: "Fat Tuesday", location: "Downtown Port Aransas", description: "Community parade with decorated golf carts, porch parties, and festive food. Port A does Mardi Gras its own way.", icon: "🎭", nextDateISO: "2027-02-09" },
    ],
  },
  {
    month: "April",
    events: [
      { name: "Texas SandFest", timing: "Third weekend of April", location: "Port Aransas Beach", description: "International sand sculpture competition drawing tens of thousands of visitors. Three days of master sculptors, live entertainment, food vendors, and kids' activities. One of the island's largest events.", icon: "🏖️", nextDateISO: "2027-04-16" },
    ],
  },
  {
    month: "May",
    events: [
      { name: "Fly It Port A's Spring Kite Festival", timing: "Mother's Day weekend (May 8–10, 2026)", location: "Port Aransas Beach, markers 1–20", description: "Free, family-friendly kite festival hosted by Fly It Port A. Setup Saturday at 10 AM. Bring your own kite or just watch. Beach parking permit required, no vendors on the beach.", icon: "🪁", detailSlug: "spring-kite-festival-2026", nextDateISO: "2026-05-08" },
    ],
  },
  {
    month: "July",
    events: [
      { name: "Port Aransas Deep Sea Roundup — 90th Annual", timing: "July 9–12, 2026 · main weigh-ins Fri & Sat evenings", location: "Roberts Point Park · Fred Rhodes Pavilion", description: "Texas's oldest fishing tournament — 1932 to today. Six divisions (Bay-Surf, Offshore, Fly, Kayak, Tarpon Release, Billfish Release) plus Junior brackets, Top Woman Angler, and the kids' Piggy Perch contest. Live leaderboards on the hub.", icon: "🏆", detailSlug: "deep-sea-roundup-2026", nextDateISO: "2026-07-09" },
      { name: "Fourth of July Celebration", timing: "July 4", location: "Roberts Point Park", description: "Free popcorn, snow cones, and bounce houses from 4 PM. Live music at 5 PM. Fireworks launched from Roberts Point Park at approximately 9:30 PM. Fireworks cruises available from Fisherman's Wharf.", icon: "🎆", nextDateISO: "2026-07-04" },
    ],
  },
  {
    month: "August",
    events: [
      { name: "Texas Legends Billfish Tournament", timing: "First week of August", location: "Port Aransas Harbor / Offshore", description: "Premier billfish competition — one of three legs of the Texas Triple Crown Billfish Series. High-stakes offshore fishing for blue marlin, white marlin, and sailfish.", icon: "🐟", nextDateISO: "2026-08-03" },
      { name: "Texas Women Anglers Tournament (TWAT)", timing: "Late August (tentative Aug 21–23, 2026)", location: "Fisherman's Wharf (weigh-in) · Reception venue downtown", description: "Women-only fishing tournament, family-run by Pete Fox's family since 1984. Dozens of boats, hundreds of women anglers each summer. Famous for the Saturday weigh-in spectacle — themed boats, costumes, money sprayers, beads thrown to the crowd. $130K+ raised for The Purple Door (Coastal Bend's shelter for survivors of domestic violence and sexual assault).", icon: "🎣", detailSlug: "texas-women-anglers-tournament-2026", nextDateISO: "2026-08-21" },
    ],
  },
  {
    month: "October",
    events: [
      { name: "Beachtober", timing: "All of October", location: "Island-wide", description: "Month-long celebration: Taco & Margarita Trail, Sweet Traditions Dessert Trail, Beachtober Beats concert series (Fridays at SipYard), Shoptober sales, and Flynn's Beach Run (10K/5K).", icon: "🎃", nextDateISO: "2026-10-01" },
      { name: "Wooden Boat Festival", timing: "Late October", location: "Roberts Point Park", description: "Three-day celebration of handcrafted boats. Five families compete to build a 14-foot Port A Skiff in three days. Historic Farley boats on display, vendors, live music.", icon: "⛵", nextDateISO: "2026-10-23" },
      { name: "Harvest Moon Regatta", timing: "Late October", location: "Port Aransas Harbor (finish line)", description: "150-nautical-mile sailboat race from Galveston to Port Aransas. Finish-line festivities include rum party, live music, and awards ceremony.", icon: "⛵", nextDateISO: "2026-10-24" },
    ],
  },
  {
    month: "December",
    events: [
      { name: "Lighted Boat Parade & Holiday Drone Show", timing: "Mid-December Saturday", location: "Port Aransas Harbor / Fisherman's Wharf", description: "Decorated boats glide through the harbor 6-7 PM, followed by 150+ synchronized drones in holiday patterns set to live music. Santa, snow machines, holiday cocktails.", icon: "🎄", nextDateISO: "2026-12-12" },
      { name: "Golf Cart Holiday Parade", timing: "Early December", location: "Downtown Port Aransas", description: "Community parade of decorated golf carts through downtown. Pure Port A energy.", icon: "🛺", nextDateISO: "2026-12-05" },
    ],
  },
];

/**
 * Reorder the month groups so the soonest-upcoming month comes first
 * and the order then follows real chronological time. Past months in
 * the current calendar year wrap to the end (their `nextDateISO`
 * already points at next year's occurrence). Months without any
 * `nextDateISO` (legacy data) sink to the bottom.
 */
function getMonthsInUpcomingOrder() {
  const now = Date.now();
  return [...eventsByMonth].sort((a, b) => {
    const aSoon = Math.min(
      ...a.events
        .filter((e) => e.nextDateISO)
        .map((e) => new Date(e.nextDateISO as string).getTime()),
    );
    const bSoon = Math.min(
      ...b.events
        .filter((e) => e.nextDateISO)
        .map((e) => new Date(e.nextDateISO as string).getTime()),
    );
    // Math.min on empty array returns Infinity — sinks naturally to bottom
    return (Number.isFinite(aSoon) ? aSoon : now + 1e15) -
      (Number.isFinite(bSoon) ? bSoon : now + 1e15);
  });
}

/**
 * Resolve the soonest upcoming event from both sources (events.ts + inline).
 * Prefers detail-page events when there's a tie. Returns null off-season.
 */
function getNextUpEvent() {
  const now = Date.now();

  type Candidate = {
    name: string;
    icon: string;
    location: string;
    description: string;
    timing: string;
    iso: string;
    detailSlug?: string;
    /** ISO end date if known — gives us a more accurate "still happening" check */
    endISO?: string;
    dateLabel?: string;
  };

  const fromInline: Candidate[] = eventsByMonth
    .flatMap((m) => m.events)
    .filter((e) => e.nextDateISO)
    .map((e) => ({
      name: e.name,
      icon: e.icon,
      location: e.location,
      description: e.description,
      timing: e.timing,
      iso: e.nextDateISO as string,
      detailSlug: e.detailSlug,
    }));

  const fromDetailed: Candidate[] = detailedEvents
    .filter((e) => e.published)
    .map((e) => ({
      name: e.name,
      icon: e.icon,
      location: e.venueName,
      description: e.description,
      timing: e.headlineTime,
      iso: e.startISO,
      endISO: e.endISO,
      detailSlug: e.slug,
      dateLabel: e.dateLabel,
    }));

  // Detailed events take precedence when slug matches — they have richer data
  const detailedSlugs = new Set(fromDetailed.map((e) => e.detailSlug));
  const merged = [
    ...fromDetailed,
    ...fromInline.filter((e) => !e.detailSlug || !detailedSlugs.has(e.detailSlug)),
  ];

  const upcoming = merged
    .filter((c) => {
      const cutoff = c.endISO ? new Date(c.endISO).getTime() : new Date(c.iso).getTime() + 86_400_000;
      return cutoff > now;
    })
    .sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());

  return upcoming[0] ?? null;
}

const recurringEvents: PAEvent[] = [
  { name: "Second Saturday at Farley Boat Works", timing: "2nd Saturday, Oct-Mar", location: "716 W. Ave C", description: "Potluck dinners with live music and dancing in the boat barn. PAPHA members eat free; guests $10.", icon: "🪵" },
  { name: "Art Center First Friday", timing: "1st Friday of each month", location: "Port Aransas Art Center", description: "Opening reception for new monthly exhibit with live music, wine, and art demos. 5:30-7:30 PM.", icon: "🎨" },
  { name: "UTMSI Wetlands Tours", timing: "Tuesdays & Thursdays, 9 AM", location: "UTMSI Visitors Center", description: "Free guided boardwalk tours of the 3.5-acre marsh and wetland habitat. Year-round.", icon: "🌿" },
  { name: "Live Music Nightly", timing: "Year-round, most nights", location: "Multiple venues", description: "The Gaff, Shorty's, Bron's Backyard, Treasure Island, Sip Yard, VFW, Salty Dog, and more. See who's playing this week on our weekly roundup at /live-music.", icon: "🎵" },
];

export default function EventsPage() {
  const nextUp = getNextUpEvent();
  const orderedMonths = getMonthsInUpcomingOrder();
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            What&apos;s Happening
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Events & Happenings
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Festivals, fishing tournaments, live music, and community events — Port Aransas has something going on all year long.
          </p>
        </div>
      </section>

      {/* Coming Up Next — soonest event regardless of month */}
      {nextUp && (
        <section className="py-12 sm:py-14 bg-navy-900 relative border-b border-coral-500/20">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 85% 50%, rgba(232,101,111,0.18), transparent 60%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-xs font-semibold tracking-widest uppercase mb-4">
                  <EmojiIcon emoji={nextUp.icon} className="w-3.5 h-3.5" />
                  Coming up next
                </div>

                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-sand-50 leading-tight mb-3">
                  {nextUp.name}
                </h2>

                <p className="text-base sm:text-lg text-navy-200 font-light leading-relaxed max-w-2xl mb-4">
                  {nextUp.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-300 mb-5">
                  <span className="font-semibold text-sand-100">
                    {nextUp.dateLabel ?? nextUp.timing}
                  </span>
                  <span className="text-navy-500">·</span>
                  <span>{nextUp.location}</span>
                </div>

                {nextUp.detailSlug && (
                  <Link
                    href={`/events/${nextUp.detailSlug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-coral"
                  >
                    See the full hub
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                )}
              </div>

              <div className="lg:flex-shrink-0">
                <EventCountdown
                  startISO={nextUp.iso}
                  endISO={nextUp.endISO}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tournament Season cross-link */}
      <section className="py-10 bg-sand-50 border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/events/tournament-season"
            className="block group bg-navy-900 text-sand-100 rounded-2xl p-6 sm:p-7 border border-coral-500/20 hover:border-coral-400 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-coral-300 text-[10px] font-bold tracking-[0.25em] uppercase mb-2 inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
                  Tournament Season hub
                </p>
                <p className="font-display text-lg sm:text-xl font-bold text-sand-50 leading-tight mb-1">
                  Port Aransas&apos;s summer fishing fixture, all in one place
                </p>
                <p className="text-sm text-navy-200 font-light">
                  DSR · Pachanga · Texas Legends · TWAT — history, comparison,
                  and how to plan a Tournament Season weekend.
                </p>
              </div>
              <svg
                className="w-8 h-8 text-coral-300 flex-shrink-0 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Annual Events by Month */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Annual Calendar
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Major Events by Month
            </h2>
          </div>

          <div className="space-y-8">
            {orderedMonths.map((month) => {
              // Pull a year hint from the soonest event in this month — useful
              // when the timeline wraps into next year so visitors aren't
              // confused which "January" they're looking at.
              const soonestISO = month.events
                .map((e) => e.nextDateISO)
                .filter(Boolean)
                .sort()[0];
              const monthYear = soonestISO
                ? new Date(soonestISO).getFullYear()
                : currentYear;
              const showYear = monthYear !== currentYear;
              return (
              <div key={month.month}>
                <h3 className="font-display text-lg font-bold text-coral-600 mb-4 pb-2 border-b border-coral-100 flex items-baseline gap-2">
                  {month.month}
                  {showYear && (
                    <span className="text-xs font-semibold text-navy-400 tracking-widest uppercase">
                      {monthYear}
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  {month.events.map((event) => {
                    const inner = (
                      <div className="flex items-start gap-4">
                        <EmojiIcon emoji={event.icon} className="w-7 h-7 flex-shrink-0 mt-0.5 text-navy-900" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3">
                            <h4 className="font-display font-bold text-navy-900 mb-1">{event.name}</h4>
                            {event.detailSlug && (
                              <span className="text-xs font-semibold text-coral-500 whitespace-nowrap">Details →</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-coral-500 mb-2">{event.timing} · {event.location}</p>
                          <p className="text-sm text-navy-500 font-light leading-relaxed">{event.description}</p>
                        </div>
                      </div>
                    );
                    return event.detailSlug ? (
                      <Link
                        key={event.name}
                        href={`/events/${event.detailSlug}`}
                        className="block bg-white rounded-xl border border-sand-200 p-5 card-hover hover:border-coral-300 transition-colors"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={event.name} className="bg-white rounded-xl border border-sand-200 p-5">
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recurring Events */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Every Week & Month
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Recurring Happenings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringEvents.map((event) => (
              <div key={event.name} className="bg-white rounded-xl border border-sand-200 p-5">
                <div className="flex items-start gap-4">
                  <EmojiIcon emoji={event.icon} className="w-7 h-7 flex-shrink-0 text-navy-900" />
                  <div>
                    <h4 className="font-display font-bold text-navy-900 text-sm mb-1">{event.name}</h4>
                    <p className="text-xs font-medium text-coral-500 mb-2">{event.timing} · {event.location}</p>
                    <p className="text-xs text-navy-500 font-light leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Planning Your Trip?
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            Check conditions, find restaurants, and save spots for your visit.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/live" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Check Conditions
            </Link>
            <Link href="/essentials" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Island Essentials
            </Link>
            <Link href="/my-trip" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              My Trip
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
