import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero area */}
      <section className="flex-1 hero-gradient relative flex items-center justify-center py-32">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            404 — Page Not Found
          </p>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-sand-50 mb-4 leading-tight">
            Lost at Sea
          </h1>

          <div className="gold-line max-w-xs mx-auto mb-6" />

          <p className="text-lg text-navy-200 font-light mb-4 leading-relaxed">
            Looks like this page washed out with the tide. It may have moved, been
            renamed, or just doesn&apos;t exist on the island.
          </p>

          <p className="text-navy-300 text-sm mb-10">
            No worries — the good stuff is still right here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl btn-coral text-base font-semibold tracking-wide"
            >
              Back to Shore
            </Link>
            <Link
              href="/#explore"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-sand-100 hover:bg-white/20 transition-all duration-300 text-base font-semibold tracking-wide"
            >
              Browse the Directory
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
