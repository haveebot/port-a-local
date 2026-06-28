import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbListSchema } from "@/components/StructuredData";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const metadata: Metadata = {
  title: "The 4th of July in Port A — Fireworks, Parade & Beach Days | Port A Local",
  description:
    "A locally-curated guide to 4th of July weekend in Port Aransas — the City fireworks, live music, beach days, fireworks-on-the-water, and where to be all weekend. Book your carts and beach set-ups early; the island fills up fast.",
  openGraph: {
    title: "The 4th of July in Port A — Your Local Weekend Guide",
    description:
      "Fireworks, the parade, live music, and beach days — a local's guide to July 4 weekend in Port Aransas.",
  },
};

interface DaySpot {
  name: string;
  note: string;
  phone?: string;
  /** internal (/path) or external (https://) link */
  url?: string;
  /** label for the link — defaults to "Book online →" for external, "Open →" for internal */
  linkLabel?: string;
}

interface Day {
  label: string;
  date: string;
  tagline: string;
  body: string[];
  spots: DaySpot[];
}

const days: Day[] = [
  {
    label: "Friday",
    date: "July 3",
    tagline: "Roll in. Beat the rush.",
    body: [
      "Get a jump on the busiest weekend of the summer. Pick up a street-legal golf cart now so you can skip the holiday parking circus for three days straight, and lock in your beach set-up before the weekend sells it out.",
      "Then ease into the long weekend the Port A way — chase the live music. The island's stages are loaded all weekend: Diamond's Edge and Five Card Draw at Treasure Island, Kin Faux at Sip Yard, the Clark Bros. at the Salty Dog, the Dunebillies at Roosevelt's, and more.",
    ],
    spots: [
      {
        name: "Golf cart rental",
        note: "Street-legal, delivered to your door — reserve before the weekend sells out",
        url: "/rent",
        linkLabel: "Reserve →",
      },
      {
        name: "Beach set-up",
        note: "Chairs, umbrella, cooler — delivered to your spot on the sand",
        url: "/beach",
        linkLabel: "Book →",
      },
      {
        name: "Live music tonight",
        note: "Who's playing where across the island this weekend",
        url: "/live-music",
        linkLabel: "See the lineup →",
      },
    ],
  },
  {
    label: "Saturday",
    date: "July 4",
    tagline: "The main event.",
    body: [
      "Make a beach day of it first — sand, surf, and a cooler that's already waiting when you arrive. Then point the whole day toward the fireworks.",
      "The City of Port Aransas 4th of July Celebration runs at Roberts Point Park: festivities kick off at 4 PM with free popcorn, snow cones, and family fun, live music from 5–7 PM, and the fireworks display lighting up the ship channel around 9 PM. It's free — just bring lawn chairs and blankets.",
      "Want a front-row seat with zero parking stress? Watch the show from the water aboard The Boat Bar with Neptune's Charters — a secure spot on the deck right under the fireworks. After dinner, the party keeps going: Bernie's Beach House throws its 20th Annual 4th of July Bash, and the 4th of July Freedom Crawl 250 makes the rounds across town.",
    ],
    spots: [
      {
        name: "City of Port Aransas 4th of July Celebration",
        note: "Roberts Point Park · free · 4–7 PM festivities, live music 5–7 PM, fireworks ~9 PM · bring chairs & blankets",
        url: "https://porta.recdesk.com/Community/Program/Detail?programId=5580",
        linkLabel: "Event details →",
      },
      {
        name: "Fireworks aboard The Boat Bar",
        note: "Watch from the water with Neptune's Charters · bottom deck from $20, VIP top deck with open bar & food",
        phone: "(361) 749-6969",
        url: "https://neptunescharters.com/tours/4th-of-july-aboard-the-boat-bar/",
        linkLabel: "Book the boat →",
      },
      {
        name: "Bernie's Beach House — 20th Annual 4th of July Bash",
        note: "After-dinner vibes · live music & holiday party",
      },
      {
        name: "4th of July Freedom Crawl 250",
        note: "A holiday crawl making the rounds around town",
      },
      {
        name: "Beach set-up",
        note: "Make a beach day of it — delivered and ready when you arrive",
        url: "/beach",
        linkLabel: "Book →",
      },
    ],
  },
  {
    label: "Sunday",
    date: "July 5",
    tagline: "Wind it down on the water.",
    body: [
      "Cap the weekend with something a little different: Sip & Shuck aboard the Scarlet Lady. Cruise out to a Texas oyster farm, sip chilled prosecco and a wine pairing, and taste fresh Gulf oysters shucked right on the boat — a two-hour escape that runs the first Sunday of the month.",
      "Or just give the holiday one more slow beach day before the crowds head home — keep the cart through Sunday and roll down to the sand one last time.",
    ],
    spots: [
      {
        name: "Sip & Shuck on the Scarlet Lady",
        note: "Sun, July 5 · 2-hour oyster-farm cruise · prosecco, wine pairing & fresh shucked oysters · seating is limited",
        url: "https://scarletladydolphincruise.com/sip-and-shuck-oyster-cruise/",
        linkLabel: "Reserve a seat →",
      },
      {
        name: "One more beach day",
        note: "Keep the cart, book the chairs, soak up the last of the long weekend",
        url: "/beach",
        linkLabel: "Book →",
      },
    ],
  },
];

const fireworksTips = [
  "Roberts Point Park is the City's launch spot — get there early, stake out a patch of grass along the ship channel, and you'll have the best free seat in town.",
  "The beach is a classic too: spread out on the open sand with a clear sightline up the coast, fewer crowds than the park, and the waves for a soundtrack.",
  "Out on the water is the showstopper — boat decks like The Boat Bar sit right under the burst with no parking to fight.",
  "Bring a golf cart. Holiday parking near the park and the beach disappears fast, and a cart turns the after-fireworks gridlock into an easy roll home.",
  "Pack the essentials: lawn chairs, blankets, bug spray, and a cooler. Stake your spot well before dusk — the show goes off around 9 PM.",
];

export default function FourthOfJulyGuide() {
  return (
    <main className="min-h-screen">
      <MetaPixelEvent
        event="ViewContent"
        contentName="The 4th of July in Port A"
        contentCategory="guides"
        contentIds={["guides/fourth-of-july"]}
      />
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "The 4th of July in Port A", path: "/guides/fourth-of-july" },
        ]}
      />
      <Navigation />

      {/* Hero — full-bleed coastal photo with navy gradient overlay for text
          contrast. Placeholder image (beach-hero); swap for a 4th of July
          creative when ready. */}
      <section className="pt-28 pb-16 relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/beach-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-900/30 to-navy-900/80" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-navy-200 mb-6">
            <Link href="/guides" className="hover:text-coral-300 transition-colors">
              Guides
            </Link>
            <span className="text-coral-300/40">/</span>
            <span className="text-sand-100">The 4th of July in Port A</span>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-200 text-sm font-medium tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            Fireworks, Parade &amp; Beach Days
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 leading-[1.05] mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            The 4th of July the{" "}
            <span className="italic text-coral-400">Port A</span> Way
          </h1>

          <p className="text-lg sm:text-xl text-sand-100 font-light max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Plan the long weekend &mdash; July 3&ndash;5 &mdash; like a local: where to watch
            the fireworks, who&apos;s playing, and what to book before it sells out.
          </p>
        </div>
      </section>

      {/* Pro tip strip */}
      <section className="py-10 bg-coral-50 border-b border-coral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-coral-700 uppercase tracking-[0.25em] font-bold mb-3">
            Book ahead
          </p>
          <p className="text-base sm:text-lg text-navy-900 font-light leading-relaxed">
            Golf carts and beach set-ups are the first things to go on the island&apos;s
            busiest weekend of the year. Reserve your{" "}
            <Link href="/rent" className="text-coral-600 font-medium hover:underline">
              cart
            </Link>{" "}
            and{" "}
            <Link href="/beach" className="text-coral-600 font-medium hover:underline">
              beach set-up
            </Link>{" "}
            now &mdash; they will sell out before you get here.
          </p>
        </div>
      </section>

      {/* Day-by-day */}
      {days.map((day, idx) => (
        <section
          key={day.label}
          className={`py-16 sm:py-20 ${idx % 2 === 0 ? "bg-white" : "bg-sand-50"}`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-3">
                <p className="font-display text-3xl sm:text-4xl font-bold text-coral-500 italic leading-none">
                  {day.label}
                </p>
                <p className="text-navy-900 text-sm font-semibold mt-2">{day.date}</p>
                <p className="text-navy-400 text-sm font-medium mt-3">
                  {day.tagline}
                </p>
              </div>
              <div className="md:col-span-9">
                {day.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-base sm:text-lg text-navy-700 font-light leading-relaxed mb-4 last:mb-0"
                  >
                    {p}
                  </p>
                ))}
                <ul className="mt-8 space-y-3 border-t border-sand-200 pt-6">
                  {day.spots.map((spot) => {
                    const telHref = spot.phone
                      ? `tel:${spot.phone.replace(/\D/g, "")}`
                      : null;
                    const isExternal = spot.url?.startsWith("http");
                    const defaultLabel = isExternal ? "Book online →" : "Open →";
                    return (
                      <li
                        key={spot.name}
                        className="flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap sm:gap-x-3 sm:gap-y-1"
                      >
                        <span className="font-semibold text-navy-900 text-sm sm:text-base">
                          {spot.name}
                        </span>
                        <span className="text-navy-400 text-xs sm:text-sm">
                          {spot.note}
                        </span>
                        {telHref && (
                          <a
                            href={telHref}
                            className="text-coral-500 hover:text-coral-600 text-xs sm:text-sm font-medium"
                          >
                            {spot.phone}
                          </a>
                        )}
                        {spot.url &&
                          (isExternal ? (
                            <a
                              href={spot.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-coral-500 hover:text-coral-600 text-xs sm:text-sm font-medium"
                            >
                              {spot.linkLabel ?? defaultLabel}
                            </a>
                          ) : (
                            <Link
                              href={spot.url}
                              className="text-coral-500 hover:text-coral-600 text-xs sm:text-sm font-medium"
                            >
                              {spot.linkLabel ?? defaultLabel}
                            </Link>
                          ))}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Where to watch the fireworks */}
      <section className="py-16 sm:py-20 bg-navy-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Local Know-How
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
              Where to Watch the Fireworks
            </h2>
            <div className="coral-line max-w-xs mx-auto" />
          </div>
          <ul className="space-y-4 max-w-3xl mx-auto">
            {fireworksTips.map((tip, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-coral-400 text-navy-900 font-display font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <p className="text-base sm:text-lg text-navy-100 font-light leading-relaxed pt-0.5">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 sm:py-24 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
            Make it a 4th to remember.
          </h2>
          <div className="coral-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-200 font-light max-w-xl mx-auto mb-10">
            Lock in your golf cart and beach set-up through Port A Local before the
            holiday crowd does &mdash; locally vetted, no runaround.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3">
            <Link
              href="/rent"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl btn-coral text-sm font-semibold"
            >
              Reserve a Golf Cart
            </Link>
            <Link
              href="/beach"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-coral-400/60 text-coral-100 hover:bg-coral-500 hover:text-white text-sm font-semibold transition-colors"
            >
              Book a Beach Set-Up
            </Link>
            <Link
              href="/live-music"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-sand-200/30 text-sand-100 hover:border-coral-400/60 hover:text-coral-300 text-sm font-semibold transition-colors"
            >
              See Live Music
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
