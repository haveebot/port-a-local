import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stories, getStoryBySlug } from "@/data/stories";
import { storyContent } from "@/data/story-content";
import { ArticleSchema, BreadcrumbListSchema, PlaceSchema } from "@/components/StructuredData";

// Heritage stories that are about specific physical landmarks.
// PlaceSchema here gives these URLs rich-result eligibility for queries like
// "port aransas lighthouse," "tarpon inn," "farley boat works," etc.
const PHYSICAL_PLACES: Record<
  string,
  {
    name: string;
    description: string;
    type: "Place" | "TouristAttraction" | "LandmarksOrHistoricalBuildings";
  }
> = {
  "lydia-ann-lighthouse": {
    name: "Lydia Ann Lighthouse",
    description:
      "1857 Texas coastal lighthouse on Harbor Island guarding the Aransas Pass — one of the oldest operating lighthouses on the Gulf Coast.",
    type: "LandmarksOrHistoricalBuildings",
  },
  "farley-boat-works": {
    name: "Farley Boat Works",
    description:
      "Historic wooden boat shop at 716 W Ave C, Port Aransas. Revived in 2011 as a community boat-building workshop and maritime museum.",
    type: "TouristAttraction",
  },
  "port-aransas-museum": {
    name: "Port Aransas Museum",
    description:
      "The island's local history museum — maritime artifacts, Fresnel lens, photographic archives, generational records of Port Aransas families.",
    type: "TouristAttraction",
  },
  "chapel-on-the-dunes": {
    name: "Chapel on the Dunes",
    description:
      "Sand-dune chapel built in 1937 by Texas Poet Laureate Aline Carter. A handmade, still-standing landmark on Mustang Island.",
    type: "LandmarksOrHistoricalBuildings",
  },
  "tarpon-inn": {
    name: "The Tarpon Inn",
    description:
      "1886 coastal inn — host of President Franklin D. Roosevelt's 1937 tarpon-fishing visit. Historic lodging on the National Register.",
    type: "TouristAttraction",
  },
  "port-aransas-jetties": {
    name: "Port Aransas Jetties",
    description:
      "The north and south jetties guarding the Aransas Pass — a century-old coastal engineering project that remains a fishing, surfing, and walking destination.",
    type: "TouristAttraction",
  },
};
import SaveToTrip from "@/components/SaveToTrip";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/brand/PortalIcon";

// Generate static pages for all stories that have content
export function generateStaticParams() {
  return stories
    .filter((s) => s.published && storyContent[s.slug])
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return {};

  return {
    title: `${story.title} — Port A Heritage | Port A Local`,
    description: story.description,
    openGraph: {
      title: story.title,
      description: story.subtitle,
      type: "article",
      publishedTime: story.date,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  const content = storyContent[slug];

  if (!story || !content || !story.published) {
    notFound();
  }

  // Find adjacent stories for navigation
  const publishedStories = stories.filter((s) => s.published && storyContent[s.slug]);
  const currentIndex = publishedStories.findIndex((s) => s.slug === slug);
  const prevStory = currentIndex > 0 ? publishedStories[currentIndex - 1] : null;
  const nextStory =
    currentIndex < publishedStories.length - 1
      ? publishedStories[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen">
      <ArticleSchema story={story} />
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Port A Heritage", path: "/history" },
          { name: story.title, path: `/history/${story.slug}` },
        ]}
      />
      {PHYSICAL_PLACES[story.slug] && (
        <PlaceSchema
          {...PHYSICAL_PLACES[story.slug]}
          url={`https://theportalocal.com/history/${story.slug}`}
        />
      )}
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-navy-300 mb-8">
            <Link
              href="/history"
              className="hover:text-coral-300 transition-colors"
            >
              Port A Heritage
            </Link>
            <span>/</span>
            <span className="text-navy-200 capitalize">{story.category}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <EmojiIcon emoji={story.icon} className="w-4 h-4" /> {story.category} · {story.readTime} read
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-sand-50 mb-4 leading-tight">
              {story.title}
            </h1>
            <SaveToTrip
              item={{ type: "story", slug: story.slug, name: story.title, category: story.category, icon: story.icon, tagline: story.subtitle }}
              size="md"
            />
          </div>

          <p className="text-lg sm:text-xl text-navy-200 font-light leading-relaxed">
            {story.subtitle}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8">
            {story.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-navy-700/50 text-navy-200 border border-navy-600/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Lede */}
          <p className="text-lg sm:text-xl text-navy-700 leading-relaxed font-light mb-12 first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-coral-500 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {content.lede}
          </p>

          <div className="coral-line max-w-xs mb-12" />

          {/* Sections */}
          {content.sections.map((section, i) => (
            <section key={i} className="mb-12">
              {section.heading && (
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
                  {section.heading}
                </h2>
              )}

              {/* Fact sidebar */}
              {section.fact && (
                <div className="float-right ml-8 mb-6 w-64 hidden lg:block">
                  <div className="bg-sand-50 border border-sand-200 rounded-xl p-5">
                    <p className="text-xs font-semibold text-coral-500 tracking-[0.15em] uppercase mb-3">
                      Key Facts
                    </p>
                    <dl className="space-y-2">
                      {section.fact.map((f) => (
                        <div key={f.label}>
                          <dt className="text-xs text-navy-400 font-medium">
                            {f.label}
                          </dt>
                          <dd className="text-sm text-navy-800 font-semibold">
                            {f.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {/* Mobile fact box */}
              {section.fact && (
                <div className="lg:hidden mb-6">
                  <div className="bg-sand-50 border border-sand-200 rounded-xl p-5">
                    <p className="text-xs font-semibold text-coral-500 tracking-[0.15em] uppercase mb-3">
                      Key Facts
                    </p>
                    <dl className="grid grid-cols-2 gap-3">
                      {section.fact.map((f) => (
                        <div key={f.label}>
                          <dt className="text-xs text-navy-400 font-medium">
                            {f.label}
                          </dt>
                          <dd className="text-sm text-navy-800 font-semibold">
                            {f.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {section.body.map((paragraph, j) => (
                <p
                  key={j}
                  className="text-base sm:text-lg text-navy-600 leading-relaxed mb-5 font-light"
                >
                  {paragraph}
                </p>
              ))}

              {/* Pull quote */}
              {section.pullQuote && (
                <blockquote className="my-10 pl-6 border-l-4 border-coral-400">
                  <p className="text-xl sm:text-2xl font-display font-bold text-navy-800 leading-snug mb-2">
                    &ldquo;{section.pullQuote.text}&rdquo;
                  </p>
                  {section.pullQuote.attribution && (
                    <cite className="text-sm text-navy-400 font-medium not-italic">
                      — {section.pullQuote.attribution}
                    </cite>
                  )}
                </blockquote>
              )}
            </section>
          ))}
        </div>
      </article>

      {/* Visit Today */}
      {content.visitToday && content.visitToday.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                See It Yourself
              </p>
              <h2 className="font-display text-2xl font-bold text-navy-900">
                What to Visit Today
              </h2>
            </div>

            <div className="grid gap-4">
              {content.visitToday.map((item) => (
                <div
                  key={item.place}
                  className="flex gap-4 bg-white rounded-xl border border-sand-200 p-5"
                >
                  <div className="w-10 h-10 rounded-full bg-coral-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-coral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{item.place}</h3>
                    <p className="text-sm text-navy-500 font-light mt-1">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Heritage */}
      {story.relatedStories && story.relatedStories.length > 0 && (() => {
        const related = story.relatedStories
          .map((s) => stories.find((st) => st.slug === s && st.published))
          .filter(Boolean);
        if (related.length === 0) return null;
        return (
          <section className="py-16 bg-sand-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                  Keep Reading
                </p>
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Related Heritage
                </h2>
              </div>
              <div className="grid gap-4">
                {related.map((r) => (
                  <Link
                    key={r!.slug}
                    href={`/history/${r!.slug}`}
                    className="flex gap-4 bg-white rounded-xl border border-sand-200 p-5 card-hover group"
                  >
                    <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <EmojiIcon emoji={r!.icon} className="w-5 h-5 text-navy-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors">
                        {r!.title}
                      </h3>
                      <p className="text-sm text-navy-500 font-light mt-1 line-clamp-2">
                        {r!.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Sources */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-navy-400 hover:text-navy-600 transition-colors list-none flex items-center gap-2">
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Sources ({content.sources.length})
            </summary>
            <ol className="mt-4 space-y-2 text-sm text-navy-500 list-decimal list-inside">
              {content.sources.map((source, i) => (
                <li key={i}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400 transition-colors"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      {/* Story Navigation */}
      <section className="py-12 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {prevStory ? (
              <Link
                href={`/history/${prevStory.slug}`}
                className="group flex items-center gap-3 text-navy-600 hover:text-coral-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                <div className="text-right">
                  <p className="text-xs text-navy-400">Previous</p>
                  <p className="text-sm font-semibold">{prevStory.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/history"
              className="text-sm font-medium text-navy-400 hover:text-coral-500 transition-colors"
            >
              All Heritage
            </Link>

            {nextStory ? (
              <Link
                href={`/history/${nextStory.slug}`}
                className="group flex items-center gap-3 text-navy-600 hover:text-coral-500 transition-colors"
              >
                <div>
                  <p className="text-xs text-navy-400">Next</p>
                  <p className="text-sm font-semibold">{nextStory.title}</p>
                </div>
                <svg
                  className="w-5 h-5"
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
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
