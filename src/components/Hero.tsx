import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
      {/* Subtle palm pattern overlay */}
      <div className="absolute inset-0 palm-pattern opacity-30" />

      {/* Large lighthouse watermark — right side, low opacity */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none hidden md:block">
        <LighthouseMark size={620} variant="light" detail="full" />
      </div>

      {/* Coral accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 coral-line" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-8">
            <LighthouseMark size={14} variant="light" detail="icon" />
            The Official Local Guide to Port Aransas, TX
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-sand-50 leading-[1.1] mb-8">
            Discover{" "}
            <span className="text-coral-400 italic">Port Aransas</span>
            <br />
            Like a Local
          </h1>

          <p className="text-xl text-navy-200/80 leading-relaxed mb-12 max-w-2xl font-light">
            Every business on Port A Local is vetted and approved by people who actually
            live here. No paid placements. No algorithms. Just honest recommendations
            from your neighbors on the island.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#explore"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl btn-coral text-lg tracking-wide"
            >
              Explore the Island
              <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/dispatch"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-sand-200 font-semibold text-lg hover:text-coral-300 border border-sand-200/20 hover:border-coral-500/40 transition-all duration-300"
            >
              <LighthouseMark size={16} variant="light" detail="icon" className="mr-2" />
              Read the Dispatch
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg relative">
          <div>
            <div className="text-3xl font-display font-bold text-coral-400">130+</div>
            <div className="text-sm text-navy-300 mt-1 tracking-wide">Vetted Businesses</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-gold-400">100%</div>
            <div className="text-sm text-navy-300 mt-1 tracking-wide">Locally Approved</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-sand-300">Free</div>
            <div className="text-sm text-navy-300 mt-1 tracking-wide">No Paid Listings</div>
          </div>
        </div>

        {/* Coordinates tag */}
        <div className="mt-10 text-[10px] font-mono tracking-widest text-navy-400">
          27°50′N · 97°03′W
        </div>
      </div>
    </section>
  );
}
