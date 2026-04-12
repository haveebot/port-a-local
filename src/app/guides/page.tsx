import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { guides } from "@/data/guides";
import { businesses } from "@/data/businesses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Guides — Port Aransas, TX | Port A Local",
  description:
    "Curated guides to the best of Port Aransas. Happy hours, date nights, pet-friendly spots, sunset views, live music, and more — all vetted by locals.",
};

function guideMatchCount(matchTags: string[], cats?: string[]): number {
  return businesses.filter((b) => {
    const tagMatch = b.tags.some((t) =>
      matchTags.some((mt) => t.toLowerCase().includes(mt.toLowerCase()))
    );
    const catMatch = !cats || cats.includes(b.category);
    return tagMatch && catMatch;
  }).length;
}

export default function GuidesIndex() {
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
            Curated by Locals
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Local Guides
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            The best of Port Aransas, organized by what matters. Every spot vetted by locals, no paid placements.
          </p>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const count = guideMatchCount(guide.matchTags, guide.categories);
              return (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group relative rounded-2xl bg-white border border-sand-200 overflow-hidden card-hover"
                >
                  <div className="h-1 bg-gradient-to-r from-navy-600 via-coral-400 to-gold-400" />
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{guide.icon}</span>
                      <span className="text-xs text-navy-400">{count} spots</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-navy-900 group-hover:text-coral-600 transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-navy-400 leading-relaxed font-light line-clamp-2">
                      {guide.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
