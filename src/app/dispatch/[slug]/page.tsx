import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  dispatches,
  getDispatchBySlug,
} from "@/data/dispatches";
import { dispatchContent } from "@/data/dispatch-content";
import { stories } from "@/data/stories";
import { DispatchSchema } from "@/components/StructuredData";
import type { Metadata } from "next";

export function generateStaticParams() {
  return dispatches
    .filter((d) => d.published && dispatchContent[d.slug])
    .map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dispatch = getDispatchBySlug(slug);
  if (!dispatch) return {};

  return {
    title: `${dispatch.title} — Dispatch | Port A Local`,
    description: dispatch.description,
    openGraph: {
      title: dispatch.title,
      description: dispatch.subtitle,
      type: "article",
      publishedTime: dispatch.date,
      modifiedTime: dispatch.updatedAt,
    },
  };
}

export default async function DispatchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dispatch = getDispatchBySlug(slug);
  const content = dispatchContent[slug];

  if (!dispatch || !content || !dispatch.published) {
    notFound();
  }

  const publishedDate = new Date(dispatch.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const publishedDispatches = dispatches.filter(
    (d) => d.published && dispatchContent[d.slug],
  );
  const currentIndex = publishedDispatches.findIndex((d) => d.slug === slug);
  const prev = currentIndex > 0 ? publishedDispatches[currentIndex - 1] : null;
  const next =
    currentIndex < publishedDispatches.length - 1
      ? publishedDispatches[currentIndex + 1]
      : null;

  // Related heritage stories (cross-link from Dispatch into Heritage)
  const relatedHeritage = (dispatch.relatedStories || [])
    .map((s) => stories.find((st) => st.slug === s && st.published))
    .filter(Boolean) as typeof stories;

  return (
    <main className="min-h-screen">
      <DispatchSchema dispatch={dispatch} />
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-navy-300 mb-8">
            <Link
              href="/dispatch"
              className="hover:text-coral-300 transition-colors"
            >
              Dispatch
            </Link>
            <span>/</span>
            <span className="text-navy-200 capitalize">{dispatch.category}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            {dispatch.icon} {dispatch.category} · {dispatch.readTime} read
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-sand-50 mb-4 leading-tight">
            {dispatch.title}
          </h1>

          <p className="text-lg sm:text-xl text-navy-200 font-light leading-relaxed mb-6">
            {dispatch.subtitle}
          </p>

          {/* Byline */}
          <div className="flex items-center gap-3 text-xs text-navy-300 mt-4">
            <span className="font-semibold tracking-wide uppercase text-coral-300">
              Port A Local
            </span>
            <span className="text-navy-400">·</span>
            <time dateTime={dispatch.date}>Published {publishedDate}</time>
            {dispatch.updatedAt && (
              <>
                <span className="text-navy-400">·</span>
                <time dateTime={dispatch.updatedAt}>
                  Updated{" "}
                  {new Date(dispatch.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {dispatch.tags.slice(0, 8).map((tag) => (
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

      {/* Article */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Lede */}
          <p className="text-lg sm:text-xl text-navy-700 leading-relaxed font-light mb-12 first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-coral-500 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {content.lede}
          </p>

          <div className="coral-line max-w-xs mb-12" />

          {content.sections.map((section, i) => (
            <section key={i} className="mb-12">
              {section.heading && (
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
                  {section.heading}
                </h2>
              )}

              {/* Stat callout — full width, above body */}
              {section.callout && (
                <div className="mb-8 bg-sand-50 border border-sand-200 rounded-xl p-6 sm:p-7">
                  <p className="text-xs font-semibold text-coral-500 tracking-[0.15em] uppercase mb-4">
                    {section.callout.label}
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {section.callout.items.map((item) => (
                      <div key={item.label} className="flex justify-between items-baseline gap-4 border-b border-sand-200/80 pb-2">
                        <dt className="text-sm text-navy-500 font-medium">
                          {item.label}
                        </dt>
                        <dd className="text-sm text-navy-900 font-semibold text-right tabular-nums">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {section.body.map((paragraph, j) => (
                <p
                  key={j}
                  className="text-base sm:text-lg text-navy-700 leading-relaxed mb-5 font-light"
                >
                  {paragraph}
                </p>
              ))}

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

      {/* Related Heritage */}
      {relatedHeritage.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                Background
              </p>
              <h2 className="font-display text-2xl font-bold text-navy-900">
                Related Heritage
              </h2>
              <p className="text-sm text-navy-500 font-light mt-1">
                The history that sets up this moment.
              </p>
            </div>
            <div className="grid gap-4">
              {relatedHeritage.map((r) => (
                <Link
                  key={r.slug}
                  href={`/history/${r.slug}`}
                  className="flex gap-4 bg-white rounded-xl border border-sand-200 p-5 card-hover group"
                >
                  <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0 text-lg">
                    {r.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-sm text-navy-500 font-light mt-1 line-clamp-2">
                      {r.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <details className="group" open>
            <summary className="cursor-pointer text-sm font-semibold text-navy-500 hover:text-navy-700 transition-colors list-none flex items-center gap-2">
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

      {/* Nav between dispatches */}
      <section className="py-12 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {prev ? (
              <Link
                href={`/dispatch/${prev.slug}`}
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
                  <p className="text-sm font-semibold">{prev.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/dispatch"
              className="text-sm font-medium text-navy-400 hover:text-coral-500 transition-colors whitespace-nowrap"
            >
              All Dispatch
            </Link>

            {next ? (
              <Link
                href={`/dispatch/${next.slug}`}
                className="group flex items-center gap-3 text-navy-600 hover:text-coral-500 transition-colors"
              >
                <div>
                  <p className="text-xs text-navy-400">Next</p>
                  <p className="text-sm font-semibold">{next.title}</p>
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
