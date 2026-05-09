import Link from "next/link";
import { BRONS_PRODUCTS } from "@/data/brons-products";
import BronsBookingForm from "./BronsBookingForm";

export const dynamic = "force-dynamic";

/**
 * Bron's Beach Rentals — landing + booking surface.
 *
 * Single-page experience: hero + product grid + booking form. Mobile-
 * first because most beach-rental shoppers book from their phone in
 * the rental house parking lot.
 */
export default function BronsHomePage() {
  return (
    <main>
      {/* Hero band */}
      <section className="relative bg-gradient-to-b from-[#3d6e8c] to-[#2a4a63] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f5b35a] font-bold mb-3">
            Port Aransas, TX
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Bron's Beach Rentals
          </h1>
          <p className="text-base sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Chairs, umbrellas, cabanas, coolers. We set it up at your spot on
            the beach, you show up and enjoy the day, we break it down at
            close. The friendliest setup crew on the island.
          </p>
          <div className="mt-8">
            <Link
              href="#book"
              className="inline-block px-8 py-3 rounded-full bg-[#e8654a] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#d2553c] transition-colors"
            >
              Reserve a setup →
            </Link>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-center">
          What we set up
        </h2>
        <p className="text-sm text-[#1a3a52]/70 text-center mb-10 max-w-xl mx-auto">
          Every rental includes setup at your access point and pickup at end
          of day. You don't haul anything.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BRONS_PRODUCTS.map((p) => (
            <article
              key={p.slug}
              className="bg-white rounded-2xl border border-[#1a3a52]/10 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] rounded-lg bg-[#f5b35a]/15 border border-[#f5b35a]/30 flex items-center justify-center mb-4">
                <span className="text-xs uppercase tracking-widest text-[#1a3a52]/40">
                  {p.label} photo
                </span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">
                {p.label}
              </h3>
              <p className="text-sm text-[#1a3a52]/80 leading-relaxed mb-4">
                {p.longDescription}
              </p>
              <div className="flex items-baseline justify-between border-t border-[#1a3a52]/10 pt-4">
                <span className="font-display text-3xl font-bold text-[#e8654a]">
                  ${(p.dailyTotalCents / 100).toFixed(0)}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#1a3a52]/60">
                  per day
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="bg-[#1a3a52] text-white py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-center">
            Reserve your setup
          </h2>
          <p className="text-sm text-white/70 text-center mb-8">
            We confirm by text within an hour. Free cancellation up to 24
            hours before your rental.
          </p>
          <BronsBookingForm />
        </div>
      </section>

      {/* Trust band */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h2 className="font-display text-xl font-bold mb-4">How it works</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-[#1a3a52]/80">
          <li>
            <p className="font-bold text-[#1a3a52] mb-2">1. Reserve online</p>
            <p>Pick your setup, dates, and beach access point. Pay your
              reservation fee in 60 seconds.</p>
          </li>
          <li>
            <p className="font-bold text-[#1a3a52] mb-2">2. We set up</p>
            <p>Crew shows up at your access point in the morning, sets
              everything up exactly where you want it.</p>
          </li>
          <li>
            <p className="font-bold text-[#1a3a52] mb-2">3. We break down</p>
            <p>End of day, we come back and break it down. You don't haul
              anything home.</p>
          </li>
        </ol>
        <p className="mt-10 text-xs uppercase tracking-widest text-[#1a3a52]/50">
          Bron's Beach Rentals · 314 E Avenue G, Port Aransas, TX
        </p>
      </section>
    </main>
  );
}
