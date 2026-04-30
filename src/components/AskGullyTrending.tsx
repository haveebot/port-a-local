/**
 * Trending Ask Gully questions — what tourists are asking right now.
 *
 * Server component that pulls last-24h top questions from
 * ask_gully_log and renders clickable chips routed to
 * /gully?q=<question>. Each click fires Ask Gully on landing.
 *
 * Graceful degradation: when not enough data has accumulated (the
 * minimum threshold is 2 asks per question), returns null so the
 * surface just doesn't render — no "trending" row showing zero
 * trends. Page falls back to the static vetted-chip set above this
 * component.
 *
 * Lives in server-component land so the DB read happens on the
 * server (cheap, cached briefly). The trending data is shared across
 * all visitors so per-request DB load stays trivial even at peak.
 */

import { getTrending } from "@/data/ask-gully-log-store";

interface Props {
  /** Variant tunes spacing + typography for the surface it lives in. */
  variant: "homepage" | "gully-empty";
}

// Briefly cache between requests so the surface is responsive without
// hammering the DB. 60s is short enough that "trending right now"
// stays accurate, long enough to make the cost trivial.
async function getTrendingCached() {
  return getTrending(24, 5, 2);
}

export default async function AskGullyTrending({ variant }: Props) {
  const trending = await getTrendingCached().catch(() => []);
  if (trending.length === 0) return null;

  if (variant === "homepage") {
    return (
      <div className="mt-6">
        <p className="text-xs text-coral-300 uppercase tracking-[0.2em] mb-3 inline-flex items-center justify-center gap-2 w-full flex-wrap">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.5 0.67c.74 1.95.13 4.04-1.42 5.14-.71.5-1.6.5-2.31 0a4.4 4.4 0 0 1-1.62-2.3c-.06-.21-.32-.3-.5-.16C5.43 5.04 3.5 8.36 3.5 11.5a8.5 8.5 0 1 0 17 0c0-5.83-2.8-11-7-10.83zM12 21a4 4 0 0 1-4-4c0-1.83 1.17-3.42 3-4l1 2c.62.06 1.34.41 1.84 1.05A2.99 2.99 0 0 1 16 17a4 4 0 0 1-4 4z" />
          </svg>
          Trending — what people asked today
          <span className="text-[10px] text-navy-400 font-mono normal-case tracking-normal">
            · last 24h
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {trending.map((t) => (
            <a
              key={t.query}
              href={`/gully?q=${encodeURIComponent(t.query)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-navy-800/60 text-sand-200 hover:bg-navy-700 hover:text-coral-200 border border-navy-700 transition-colors"
            >
              <span className="text-coral-300 font-mono text-[10px]">
                {t.count}×
              </span>
              {t.query}
            </a>
          ))}
        </div>
      </div>
    );
  }

  // gully-empty
  return (
    <div className="mt-8">
      <p className="text-sm font-semibold text-coral-300 uppercase tracking-wide mb-3 inline-flex items-center justify-center gap-2 w-full flex-wrap">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.5 0.67c.74 1.95.13 4.04-1.42 5.14-.71.5-1.6.5-2.31 0a4.4 4.4 0 0 1-1.62-2.3c-.06-.21-.32-.3-.5-.16C5.43 5.04 3.5 8.36 3.5 11.5a8.5 8.5 0 1 0 17 0c0-5.83-2.8-11-7-10.83zM12 21a4 4 0 0 1-4-4c0-1.83 1.17-3.42 3-4l1 2c.62.06 1.34.41 1.84 1.05A2.99 2.99 0 0 1 16 17a4 4 0 0 1-4 4z" />
        </svg>
        Trending today
        <span className="text-[10px] text-navy-400 font-mono normal-case tracking-normal">
          · last 24h
        </span>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {trending.map((t) => (
          <a
            key={t.query}
            href={`/gully?q=${encodeURIComponent(t.query)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-navy-800/60 text-sand-200 hover:bg-navy-700 hover:text-coral-200 border border-navy-700 transition-colors cursor-pointer"
          >
            <span className="text-coral-300 font-mono text-xs">{t.count}×</span>
            {t.query}
          </a>
        ))}
      </div>
    </div>
  );
}
