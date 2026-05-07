import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbListSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Mother's Day in Port A — From Beach to Brunch | Port A Local",
  description:
    "A locally-curated guide to Mother's Day weekend in Port Aransas. Live music, the Kite Festival, beach time, shopping, and brunch — planned by people who live here.",
  openGraph: {
    title: "Mother's Day in Port A — From Beach to Brunch",
    description:
      "A locally-curated weekend guide for celebrating Mother's Day in Port Aransas.",
  },
};

const days = [
  {
    label: "Friday",
    tagline: "Live music. Dinner.",
    body: [
      "Catch John Elijah Band at Bron's Backyard — easy live music to set the tone for the weekend.",
      "Then dinner at Lisabella's. Book ahead.",
    ],
    spots: [
      { name: "Bron's Backyard", note: "Live music with John Elijah Band" },
      { name: "Lisabella's", note: "Dinner — reservations recommended" },
    ],
  },
  {
    label: "Saturday",
    tagline: "Kite Festival. Sand. Town.",
    body: [
      "Take in the 2026 Spring Kite Festival at the south end of Mustang Island — free, all weekend, the whole sky a moving picture.",
      "Spend the afternoon on the beach. Bring your chairs and umbrellas, or have Beach Rentals deliver a full set-up straight to your spot.",
      "Late afternoon, do some local shopping. Mom will love Coastal Closet and Saltwater Gypsies.",
      "Round out the evening with cocktails and live music around town.",
    ],
    spots: [
      { name: "2026 Spring Kite Festival", note: "Free · May 8–10" },
      { name: "Beach Rentals", note: "Chairs, umbrellas, full set-up — delivered" },
      { name: "Coastal Closet", note: "Local shopping" },
      { name: "Saltwater Gypsies", note: "Local shopping" },
    ],
  },
  {
    label: "Sunday",
    tagline: "Brunch. A slow walk.",
    body: [
      "Toast Mom with brunch at Tortuga's Saltwater Grill — water views, no rush. Book ahead.",
      "Wind down with a stroll on the sand. The kind of slow Sunday that ends a weekend exactly right.",
    ],
    spots: [
      { name: "Tortuga's Saltwater Grill", note: "Brunch — reservations recommended" },
    ],
  },
];

export default function MothersDayGuide() {
  return (
    <main className="min-h-screen">
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Mother's Day in Port A", path: "/guides/mothers-day" },
        ]}
      />
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-navy-300 mb-6">
            <Link href="/guides" className="hover:text-coral-300 transition-colors">
              Guides
            </Link>
            <span className="text-coral-300/40">/</span>
            <span className="text-navy-200">Mother&apos;s Day in Port A</span>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            From Beach to Brunch
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 leading-[1.05] mb-6">
            Celebrate Your Leading Lady the{" "}
            <span className="italic text-coral-400">Port A</span> Way
          </h1>

          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl">
            Plan your Mother&apos;s Day weekend like a local with this handy guide.
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
            Book your golf cart, beach set-up, and restaurant reservations in advance for a seamless weekend on the island.
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
                  {day.spots.map((spot) => (
                    <li
                      key={spot.name}
                      className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3"
                    >
                      <span className="font-semibold text-navy-900 text-sm sm:text-base">
                        {spot.name}
                      </span>
                      <span className="text-navy-400 text-xs sm:text-sm">
                        {spot.note}
                      </span>
                    </li>
                  ))}
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
            Make it a weekend to remember.
          </h2>
          <div className="coral-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-200 font-light max-w-xl mx-auto mb-10">
            Book her beach set-up, golf cart, and dinner reservations through Port A Local — locally vetted, no runaround.
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
