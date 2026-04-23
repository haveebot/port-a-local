import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { dispatches } from "@/data/dispatches";
import type { Metadata } from "next";
import DispatchTipForm from "@/components/DispatchTipForm";

export const metadata: Metadata = {
  title: "Dispatch — Port Aransas Editorial & Analysis | Port A Local",
  description:
    "Current-events editorial, analysis, and investigation from Port A Local. The stories dashboards don't tell about Port Aransas, Texas.",
};

function DispatchCard({
  dispatch,
  size = "md",
}: {
  dispatch: (typeof dispatches)[number];
  size?: "md" | "lg";
}) {
  const date = new Date(dispatch.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/dispatch/${dispatch.slug}`}
      className="group relative rounded-2xl bg-white border border-sand-200 overflow-hidden card-hover block"
    >
      <div className="h-1 bg-gradient-to-r from-coral-500 via-coral-400 to-gold-400" />

      <div className={`p-6 ${size === "lg" ? "sm:p-10" : "sm:p-8"}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-coral-50 text-coral-600 capitalize">
            {dispatch.icon} {dispatch.category}
          </span>
          <span className="text-xs text-navy-400">{dispatch.readTime} read</span>
        </div>

        <h3
          className={`font-display font-bold mb-3 text-navy-900 group-hover:text-coral-600 transition-colors ${
            size === "lg" ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {dispatch.title}
        </h3>

        <p
          className={`text-navy-500 leading-relaxed mb-4 font-light ${
            size === "lg" ? "text-base sm:text-lg" : "text-sm"
          }`}
        >
          {dispatch.subtitle}
        </p>

        <div className="flex items-center justify-between text-xs text-navy-400">
          <span>{date}</span>
          <span className="inline-flex items-center gap-1 text-coral-500 font-semibold group-hover:text-coral-600 transition-colors">
            Read
            <svg
              className="w-3.5 h-3.5"
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
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DispatchIndexPage() {
  const published = dispatches.filter((d) => d.published);
  const featured = published.filter((d) => d.featured);
  const more = published.filter((d) => !d.featured);

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
            Port A Dispatch
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Dispatch
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto mb-6">
            Features, analysis and reporting on the island as it is — not as it&apos;s advertised.
          </p>
          <p className="text-sm text-navy-300 font-light max-w-xl mx-auto">
            Heritage preserves what Port Aransas has been. Dispatch is where we look at what it
            is becoming. Sourced, specific, and local.
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                Latest
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                Featured Dispatch
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {featured.map((d) => (
                <DispatchCard key={d.slug} dispatch={d} size="lg" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More */}
      {more.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                More
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                The Archive
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {more.map((d) => (
                <DispatchCard key={d.slug} dispatch={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state fallback — if only one dispatch is live */}
      {published.length < 3 && (
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="coral-line max-w-xs mx-auto mb-6" />
            <p className="font-display text-xl text-navy-800 mb-3">
              More on the way.
            </p>
            <p className="text-sm text-navy-500 font-light">
              Dispatch is new. If you see something on the island worth reporting on — a
              closure, a change in how something works, a pattern hiding in plain sight —
              we&apos;d like to hear about it.
            </p>
          </div>
        </section>
      )}

      {/* Tip line */}
      <section className="py-20 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
              Got a tip?
            </h2>
            <p className="text-lg text-navy-200 font-light">
              If you know something about Port Aransas that the dashboards don&apos;t, we&apos;re
              listening.
            </p>
          </div>
          <DispatchTipForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
