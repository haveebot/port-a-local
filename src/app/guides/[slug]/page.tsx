import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuideBySlug } from "@/data/guides";
import { businesses } from "@/data/businesses";
import type { Metadata } from "next";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | Port A Local`,
    description: guide.metaDescription,
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const matched = businesses
    .filter((b) => {
      const tagMatch = b.tags.some((t) =>
        guide.matchTags.some((mt) => t.toLowerCase().includes(mt.toLowerCase()))
      );
      const catMatch = !guide.categories || guide.categories.includes(b.category);
      return tagMatch && catMatch;
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <main className="min-h-screen">
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
            <span className="text-navy-200">{guide.title}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{guide.icon}</span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-sand-50 leading-tight">
              {guide.title}
            </h1>
          </div>

          <p className="text-lg text-navy-200 font-light max-w-2xl mb-4">
            {guide.subtitle}
          </p>

          <p className="text-sm text-navy-300 max-w-2xl font-light">
            {guide.description}
          </p>

          <p className="text-sm text-navy-400 mt-6">
            {matched.length} {matched.length === 1 ? "spot" : "spots"} in this guide
          </p>
        </div>
      </section>

      {/* Results */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {matched.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matched.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🌊</span>
              <p className="text-navy-400 font-light">
                No spots matched this guide yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* More Guides */}
      <section className="py-16 bg-sand-50 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              More Guides
            </h2>
            <Link
              href="/guides"
              className="text-sm font-medium text-coral-500 hover:text-coral-600 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides
              .filter((g) => g.slug !== guide.slug)
              .slice(0, 3)
              .map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group flex items-center gap-4 rounded-xl bg-white border border-sand-200 p-5 card-hover"
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <p className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors text-sm">
                      {g.title}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">{g.subtitle}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
