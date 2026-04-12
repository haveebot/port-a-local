import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { stories } from "@/data/stories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Port Aransas History — Stories from the Island | Port A Local",
  description:
    "The stories that shaped Port Aransas, Texas. From the Tarpon Era to Hurricane Celia, from Farley Boat Works to FDR's famous catch. Local history told by locals.",
};

function StoryCard({ story }: { story: (typeof stories)[number] }) {
  const isComingSoon = !story.published;

  return (
    <div
      className={`group relative rounded-2xl bg-white border border-sand-200 overflow-hidden ${
        isComingSoon ? "" : "card-hover"
      }`}
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-navy-600 via-coral-400 to-gold-400" />

      <div className="p-6 sm:p-8">
        {/* Category + Read Time */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-600 capitalize">
            {story.icon} {story.category}
          </span>
          <span className="text-xs text-navy-400">{story.readTime} read</span>
        </div>

        {/* Title */}
        <h3
          className={`font-display text-xl font-bold mb-2 ${
            isComingSoon
              ? "text-navy-700"
              : "text-navy-900 group-hover:text-coral-600 transition-colors"
          }`}
        >
          {story.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-navy-400 leading-relaxed mb-4 font-light">
          {story.subtitle}
        </p>

        {/* CTA or Coming Soon */}
        {isComingSoon ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-300">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            Coming Soon
          </span>
        ) : (
          <Link
            href={`/history/${story.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-coral-500 group-hover:text-coral-600 transition-colors"
          >
            Read the Story
            <svg
              className="w-4 h-4"
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
          </Link>
        )}
      </div>

      {/* Overlay for coming soon */}
      {isComingSoon && (
        <div className="absolute inset-0 bg-white/30 pointer-events-none" />
      )}
    </div>
  );
}

export default function HistoryPage() {
  const featured = stories.filter((s) => s.featured);
  const more = stories.filter((s) => !s.featured);

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
            Port Aransas Heritage
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Island Stories
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto mb-6">
            The people, places, and moments that shaped Port Aransas. Told by locals, built to last.
          </p>
          <p className="text-sm text-navy-300 font-light max-w-xl mx-auto">
            Port Aransas has been home to the Karankawa for 4,500 years, a U.S. President&apos;s fishing
            destination, and a community that has rebuilt itself after every storm. These stories deserve
            a digital home. This is it.
          </p>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Featured
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              The Big Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* More Stories */}
      {more.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                More to Explore
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                Deep Dives
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {more.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Preview */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Timeline
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-4">
              Port Aransas Through the Years
            </h2>
            <div className="coral-line max-w-xs mx-auto" />
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-sand-200" />

            {[
              { year: "~2000 BC", event: "Karankawa people inhabit the barrier islands", icon: "🏝️" },
              { year: "1855", event: "Lydia Ann Lighthouse construction begins", icon: "🏮" },
              { year: "~1909", event: "Town renamed from Tarpon to Port Aransas", icon: "📜" },
              { year: "1914", event: "Farley Boat Works established", icon: "⛵" },
              { year: "1937", event: "President FDR catches a tarpon with Barney Farley", icon: "🎣" },
              { year: "1970", event: "Hurricane Celia devastates the island", icon: "🌀" },
              { year: "2011", event: "Farley Boat Works revived by PAPHA", icon: "🔨" },
              { year: "2017", event: "Hurricane Harvey hits Port Aransas", icon: "⛈️" },
              { year: "2026", event: "Port A Local launches Island Stories", icon: "📖" },
            ].map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-center gap-6 mb-8 ${
                  i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 sm:left-1/2 w-3 h-3 rounded-full bg-coral-400 border-2 border-white -translate-x-1/2 z-10" />

                {/* Content */}
                <div
                  className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "sm:text-right sm:pr-8" : "sm:text-left sm:pl-8 sm:ml-auto"
                  }`}
                >
                  <span className="text-xs font-bold text-coral-500 tracking-wider">
                    {item.year}
                  </span>
                  <p className="text-navy-700 text-sm font-medium mt-1">
                    {item.icon} {item.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Know the Island&apos;s Story?
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            If you have photos, documents, or stories about Port Aransas history,
            we&apos;d love to hear from you. Every detail matters.
          </p>
          <a
            href="mailto:hello@portaransaslocal.com?subject=Port%20Aransas%20History"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl btn-coral text-sm font-semibold"
          >
            Share a Story
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
