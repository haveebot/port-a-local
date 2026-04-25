import TrackedAnchor from "@/components/analytics/TrackedAnchor";

/**
 * Merch spotlight section — for events where the merch is part of the
 * cultural footprint (TWAT shirts, Sandfest gear, anything iconic).
 * Editorial in tone. Doesn't host or sell anything; links out to the
 * official store and invites fans to send photos of where the gear
 * has shown up in the wild.
 */
export interface MerchSpotlightProps {
  /** Section headline */
  headline: string;
  /** Editorial body — 1–2 short paragraphs */
  body: string[];
  /** Optional pull quote / standout line */
  pullQuote?: string;
  /** Optional store URL on the org's site */
  storeUrl?: string;
  /** Where proceeds go, when relevant */
  proceedsTo?: string;
  /** Mailto subject for sighting submissions */
  sightingSubject: string;
}

export default function MerchSpotlight({
  headline,
  body,
  pullQuote,
  storeUrl,
  proceedsTo,
  sightingSubject,
}: MerchSpotlightProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-coral-300/50 bg-navy-900 text-sand-100 p-6 sm:p-8">
      {/* Decorative shirt outline */}
      <div className="absolute -top-6 -right-6 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-coral-400 w-full h-full">
          <path d="M30 18 L40 8 L60 8 L70 18 L88 28 L80 42 L72 38 L72 88 L28 88 L28 38 L20 42 L12 28 Z" />
        </svg>
      </div>

      <p className="text-coral-300 text-xs font-bold tracking-[0.25em] uppercase mb-3 relative">
        The merch
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 relative leading-tight">
        {headline}
      </h2>

      <div className="space-y-3 mb-5 relative max-w-2xl">
        {body.map((p, i) => (
          <p key={i} className="text-sm sm:text-base text-navy-200 font-light leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      {pullQuote && (
        <blockquote className="border-l-4 border-coral-400 pl-5 mb-6 relative max-w-2xl">
          <p className="text-base sm:text-lg font-display font-bold text-sand-50 leading-snug">
            &ldquo;{pullQuote}&rdquo;
          </p>
        </blockquote>
      )}

      {proceedsTo && (
        <p className="text-xs text-coral-200 font-semibold mb-5 relative">
          Proceeds support: <span className="text-sand-100">{proceedsTo}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3 relative">
        {storeUrl && (
          <TrackedAnchor
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            event="merch_store_clicked"
            properties={{ subject: sightingSubject }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-coral"
          >
            Where to buy
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </TrackedAnchor>
        )}
        <TrackedAnchor
          href={`mailto:hello@theportalocal.com?subject=${encodeURIComponent(sightingSubject)}`}
          event="merch_sighting_clicked"
          properties={{ subject: sightingSubject }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-coral-400/40 text-coral-200 hover:bg-coral-500/10 transition-colors"
        >
          Send a sighting photo
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </TrackedAnchor>
      </div>

      <p className="text-[11px] text-navy-400 font-light mt-5 relative italic max-w-xl">
        We don&apos;t sell or fulfill any of this — we just think the gear is
        worth covering. Spot one in the wild? Send a photo and we&apos;ll
        build a sightings gallery.
      </p>
    </section>
  );
}
