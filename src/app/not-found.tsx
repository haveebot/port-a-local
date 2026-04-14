import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero area */}
      <section className="flex-1 hero-gradient relative flex items-center justify-center py-32 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        {/* Faint lighthouse watermark behind content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
          <LighthouseMark size={560} variant="light" detail="full" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          {/* Small foreground lighthouse */}
          <div className="flex justify-center mb-6">
            <LighthouseMark size={80} variant="light" detail="standard" />
          </div>

          <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            404 — Off the Chart
          </p>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-sand-50 mb-4 leading-tight">
            Lost at Sea
          </h1>

          <div className="gold-line max-w-xs mx-auto mb-6" />

          <p className="text-lg text-navy-200 font-light mb-4 leading-relaxed">
            Looks like this page washed out with the tide. It may have moved,
            been renamed, or just does not exist on the island.
          </p>

          <p className="text-navy-300 text-sm mb-10 font-mono">
            27°50′N · 97°03′W — but whatever you were looking for is not here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl btn-coral text-base font-semibold tracking-wide"
            >
              Back to Shore
            </Link>
            <Link
              href="/gully"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-sand-100 hover:bg-white/20 transition-all duration-300 text-base font-semibold tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Gully It
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
