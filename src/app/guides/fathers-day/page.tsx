import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbListSchema } from "@/components/StructuredData";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const metadata: Metadata = {
  title: "Father's Day in Port A — Carts, Casts & a Cold One | Port A Local",
  description:
    "A locally-curated guide to Father's Day weekend in Port Aransas, June 19–21. Golf carts, fishing, beach set-ups, sunset cruises, and Father's Day specials at Tortuga's — planned by people who live here.",
  openGraph: {
    title: "Father's Day in Port A — Carts, Casts & a Cold One",
    description:
      "A locally-curated weekend guide for celebrating Father's Day in Port Aransas.",
  },
};

interface DaySpot {
  name: string;
  note: string;
  phone?: string;
  url?: string;
}

interface Day {
  label: string;
  tagline: string;
  body: string[];
  spots: DaySpot[];
}

const days: Day[] = [
  {
    label: "Friday",
    tagline: "Roll in. Live music. A cold one.",
    body: [
      "Kick off the weekend Port A style: grab Dad a street-legal golf cart so he can skip the parking hassle for three days straight.",
      "Then chase the live music. Pull up somewhere with a deck and a view, order something cold, and let the salt air handle the rest.",
    ],
    spots: [
      {
        name: "Golf cart rental",
        note: "Street-legal, delivered to your door",
        url: "/rent",
      },
      {
        name: "Live music",
        note: "Who's playing around the island this weekend",
        url: "/live-music",
      },
    ],
  },
  {
    label: "Saturday",
    tagline: "Dad's day on the water.",
    body: [
      "Saturday's built for Dad. Start on the water — book a fishing charter, or hop the jetty boat over to San José Island for untouched beach, world-class shelling, and zero crowds.",
      "Spend the afternoon on the sand with a beach set-up that's already waiting when you arrive — chairs, umbrella, cooler, the works. Dad carries nothing.",
      "Close the day with a sunset cruise on the Scarlet Lady: dolphins in the wake, a cold drink in hand, golden hour stretched across the Gulf.",
    ],
    spots: [
      {
        name: "Fishing charter",
        note: "Bay, jetty, or offshore with a local captain",
        url: "/fish",
      },
      {
        name: "The jetty boat",
        note: "Day trip to San José Island",
        url: "/do/jetty-boat",
      },
      {
        name: "Beach set-up",
        note: "Chairs, umbrella, cooler — delivered to your spot",
        url: "/beach",
      },
      {
        name: "Scarlet Lady sunset cruise",
        note: "Dolphins + golden hour on the water",
        url: "https://scarletladydolphincruise.com/",
      },
    ],
  },
  {
    label: "Sunday",
    tagline: "Father's Day dinner, done right.",
    body: [
      "Treat Dad to a Father's Day dinner at Tortuga's Saltwater Grill. Their weekend special is a 12 oz New York Strip Steak Florentine over linguine — house Florentine sauce, gremolata, and blistered cherry tomatoes — best paired with a glass of Caymus Cabernet.",
      "Raise a glass with the “Head of the Table,” Tortuga's featured Father's Day cocktail: Still Austin Bourbon, Amaro Nonino, fresh lemon, and house apricot-honey syrup. Reservations highly recommended.",
    ],
    spots: [
      {
        name: "Tortuga's Saltwater Grill",
        note: "Father's Day Steak Florentine + “Head of the Table” cocktail · June 19–21 · reservations recommended",
        phone: "(361) 749-2739",
        url: "https://www.tortugassaltwatergrill.com/events/fathers-day-special",
      },
    ],
  },
];

export default function FathersDayGuide() {
  return (
    <main className="min-h-screen">
      <MetaPixelEvent
        event="ViewContent"
        contentName="Father's Day in Port A"
        contentCategory="guides"
        contentIds={["guides/fathers-day"]}
      />
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Father's Day in Port A", path: "/guides/fathers-day" },
        ]}
      />
      <Navigation />

      {/* Hero — full-bleed coastal photo with navy gradient overlay for text
          contrast. Placeholder image (beach-hero); swap for Father's Day
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
            <span className="text-sand-100">Father&apos;s Day in Port A</span>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-200 text-sm font-medium tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            Carts, Casts &amp; a Cold One
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 leading-[1.05] mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Celebrate Dad the{" "}
            <span className="italic text-coral-400">Port A</span> Way
          </h1>

          <p className="text-lg sm:text-xl text-sand-100 font-light max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Plan Father&apos;s Day weekend — June 19&ndash;21 — like a local with this handy guide.
          </p>
        </div>
      </section>

      {/* Pro tip strip */}
      <section className="py-10 bg-coral-50 border-b border-coral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-coral-700 uppercase tracking-[0.25em] font-bold mb-3">
            Pro tip
          </p>
          <p className="text-base sm:text-lg text-navy-900 font-light leading-relaxed">
            Book Dad&apos;s golf cart, beach set-up, and Tortuga&apos;s reservation early — Father&apos;s Day weekend on the island fills up fast.
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
                        {spot.url && (
                          <a
                            href={spot.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-coral-500 hover:text-coral-600 text-xs sm:text-sm font-medium"
                          >
                            Book online &rarr;
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Closing CTA */}
      <section className="py-20 sm:py-24 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
            Make it a weekend he won&apos;t forget.
          </h2>
          <div className="coral-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-200 font-light max-w-xl mx-auto mb-10">
            Book his beach set-up, golf cart, and dinner reservations through Port A Local — locally vetted, no runaround.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3">
            <Link
              href="/beach"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl btn-coral text-sm font-semibold"
            >
              Book a Beach Set-Up
            </Link>
            <Link
              href="/rent"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-coral-400/60 text-coral-100 hover:bg-coral-500 hover:text-white text-sm font-semibold transition-colors"
            >
              Reserve a Golf Cart
            </Link>
            <Link
              href="/eat"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-sand-200/30 text-sand-100 hover:border-coral-400/60 hover:text-coral-300 text-sm font-semibold transition-colors"
            >
              Find a Restaurant
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
