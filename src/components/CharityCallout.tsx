import type { EventDetails } from "@/data/events";

/**
 * Prominent callout for events with a charitable beneficiary. Reusable
 * across any event whose `charity` field is populated. Designed to
 * carry visual weight without feeling like a donation banner — the
 * pull-quote leads, the donate button is restrained.
 */
export default function CharityCallout({
  charity,
}: {
  charity: NonNullable<EventDetails["charity"]>;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-purple-300/60 bg-gradient-to-br from-purple-50 via-sand-50 to-purple-100/50 p-6 sm:p-8">
      {/* Decorative purple door silhouette */}
      <div className="absolute -top-4 -right-4 w-32 h-32 sm:w-40 sm:h-40 opacity-10 pointer-events-none">
        <svg
          viewBox="0 0 100 140"
          fill="currentColor"
          className="text-purple-700 w-full h-full"
        >
          <rect x="10" y="10" width="80" height="120" rx="6" />
          <rect x="20" y="20" width="60" height="100" rx="3" fill="white" />
          <circle cx="70" cy="70" r="3" fill="currentColor" />
        </svg>
      </div>

      <p className="text-purple-700 text-xs font-bold tracking-[0.25em] uppercase mb-3 relative">
        Why this tournament exists
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-4 relative leading-tight">
        Every dollar that doesn&apos;t go to the winners goes to{" "}
        <span className="text-purple-700">{charity.name}</span>
        {charity.formerly && (
          <span className="block text-base font-light text-navy-500 mt-1 italic">
            (formerly {charity.formerly})
          </span>
        )}
      </h2>

      <blockquote className="border-l-4 border-purple-400 pl-5 mb-5 relative">
        <p className="text-base sm:text-lg font-display font-bold text-navy-800 leading-snug">
          &ldquo;{charity.pageTagline}&rdquo;
        </p>
      </blockquote>

      <p className="text-sm sm:text-base text-navy-700 font-light leading-relaxed mb-5 max-w-2xl relative">
        {charity.mission}
      </p>

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 relative">
        {charity.impactStat && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-purple-600 mb-1">
              {charity.impactStat.label}
            </p>
            <p className="font-display font-bold text-navy-900 text-2xl tabular-nums">
              {charity.impactStat.value}
            </p>
          </div>
        )}
        {charity.serviceArea && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-purple-600 mb-1">
              Service area
            </p>
            <p className="text-sm font-semibold text-navy-900">
              {charity.serviceArea}
            </p>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-3 relative">
        <a
          href={charity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-colors"
        >
          About {charity.name}
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
        </a>
        {charity.donateUrl && (
          <a
            href={charity.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white transition-colors"
          >
            Donate directly
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </a>
        )}
      </div>

      <p className="text-[11px] text-navy-500 font-light mt-5 relative italic max-w-xl">
        Port A Local has no financial relationship with the tournament or the
        charity — we&apos;re a local site that thinks more eyes on this work
        is the right move.
      </p>
    </section>
  );
}
