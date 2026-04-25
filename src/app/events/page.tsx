import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/brand/PortalIcon";

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
}

const eventsByMonth: { month: string; events: PAEvent[] }[] = [
  {
    month: "January",
    events: [
      { name: "Restaurant Week", timing: "Mid-January through early February", location: "Island-wide", description: "Participating restaurants offer special prix-fixe menus — $25 lunch, $25 brunch, $35-$50 dinner. The best excuse to try somewhere new.", icon: "🍽️" },
      { name: "PAPHA Winter Lecture Series", timing: "Mondays in January", location: "Port Aransas Museum", description: "Weekly lectures on local history, culture, and heritage. Topics range from Karankawa history to the founding of UTMSI. Free and open to the public.", icon: "📖" },
    ],
  },
  {
    month: "February",
    events: [
      { name: "Whooping Crane Festival", timing: "Third weekend of February", location: "Island-wide + Aransas NWR", description: "Multi-day nature festival with expert birding tours, lectures, photography workshops, and boat trips to see the world's rarest crane at the Aransas National Wildlife Refuge.", icon: "🦅" },
      { name: "Mardi Gras Parade", timing: "Fat Tuesday", location: "Downtown Port Aransas", description: "Community parade with decorated golf carts, porch parties, and festive food. Port A does Mardi Gras its own way.", icon: "🎭" },
    ],
  },
  {
    month: "April",
    events: [
      { name: "Texas SandFest", timing: "Third weekend of April", location: "Port Aransas Beach", description: "International sand sculpture competition drawing tens of thousands of visitors. Three days of master sculptors, live entertainment, food vendors, and kids' activities. One of the island's largest events.", icon: "🏖️" },
    ],
  },
  {
    month: "May",
    events: [
      { name: "Fly It Port A's Spring Kite Festival", timing: "Mother's Day weekend (May 8–10, 2026)", location: "Port Aransas Beach, markers 1–20", description: "Free, family-friendly kite festival hosted by Fly It Port A. Setup Saturday at 10 AM. Bring your own kite or just watch. Beach parking permit required, no vendors on the beach.", icon: "🪁", detailSlug: "spring-kite-festival-2026" },
    ],
  },
  {
    month: "July",
    events: [
      { name: "Deep Sea Roundup", timing: "Second weekend of July", location: "Port Aransas Civic Center / Harbor", description: "Texas's oldest fishing tournament, running since 1932. Bay, surf, offshore, fly, kayak, and junior divisions. Features the legendary Piggy Perch contest. Proceeds fund local scholarships.", icon: "🏆" },
      { name: "Fourth of July Celebration", timing: "July 4", location: "Roberts Point Park", description: "Free popcorn, snow cones, and bounce houses from 4 PM. Live music at 5 PM. Fireworks launched from Roberts Point Park at approximately 9:30 PM. Fireworks cruises available from Fisherman's Wharf.", icon: "🎆" },
    ],
  },
  {
    month: "August",
    events: [
      { name: "Texas Legends Billfish Tournament", timing: "First week of August", location: "Port Aransas Harbor / Offshore", description: "Premier billfish competition — one of three legs of the Texas Triple Crown Billfish Series. High-stakes offshore fishing for blue marlin, white marlin, and sailfish.", icon: "🐟" },
    ],
  },
  {
    month: "October",
    events: [
      { name: "Beachtober", timing: "All of October", location: "Island-wide", description: "Month-long celebration: Taco & Margarita Trail, Sweet Traditions Dessert Trail, Beachtober Beats concert series (Fridays at SipYard), Shoptober sales, and Flynn's Beach Run (10K/5K).", icon: "🎃" },
      { name: "Wooden Boat Festival", timing: "Late October", location: "Roberts Point Park", description: "Three-day celebration of handcrafted boats. Five families compete to build a 14-foot Port A Skiff in three days. Historic Farley boats on display, vendors, live music.", icon: "⛵" },
      { name: "Harvest Moon Regatta", timing: "Late October", location: "Port Aransas Harbor (finish line)", description: "150-nautical-mile sailboat race from Galveston to Port Aransas. Finish-line festivities include rum party, live music, and awards ceremony.", icon: "⛵" },
    ],
  },
  {
    month: "December",
    events: [
      { name: "Lighted Boat Parade & Holiday Drone Show", timing: "Mid-December Saturday", location: "Port Aransas Harbor / Fisherman's Wharf", description: "Decorated boats glide through the harbor 6-7 PM, followed by 150+ synchronized drones in holiday patterns set to live music. Santa, snow machines, holiday cocktails.", icon: "🎄" },
      { name: "Golf Cart Holiday Parade", timing: "Early December", location: "Downtown Port Aransas", description: "Community parade of decorated golf carts through downtown. Pure Port A energy.", icon: "🛺" },
    ],
  },
];

const recurringEvents: PAEvent[] = [
  { name: "Second Saturday at Farley Boat Works", timing: "2nd Saturday, Oct-Mar", location: "716 W. Ave C", description: "Potluck dinners with live music and dancing in the boat barn. PAPHA members eat free; guests $10.", icon: "🪵" },
  { name: "Art Center First Friday", timing: "1st Friday of each month", location: "Port Aransas Art Center", description: "Opening reception for new monthly exhibit with live music, wine, and art demos. 5:30-7:30 PM.", icon: "🎨" },
  { name: "UTMSI Wetlands Tours", timing: "Tuesdays & Thursdays, 9 AM", location: "UTMSI Visitors Center", description: "Free guided boardwalk tours of the 3.5-acre marsh and wetland habitat. Year-round.", icon: "🌿" },
  { name: "Live Music Nightly", timing: "Year-round, most nights", location: "Multiple venues", description: "The Gaff, Shorty's, Bron's Backyard, Treasure Island, Sip Yard, VFW, Salty Dog, and more. See who's playing this week on our weekly roundup at /live-music.", icon: "🎵" },
];

export default function EventsPage() {
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
            {eventsByMonth.map((month) => (
              <div key={month.month}>
                <h3 className="font-display text-lg font-bold text-coral-600 mb-4 pb-2 border-b border-coral-100">
                  {month.month}
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
            ))}
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
