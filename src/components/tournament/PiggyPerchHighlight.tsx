import type { TournamentResults } from "@/data/tournament-results";

/**
 * The only fishing contest where the smallest fish is a trophy.
 * Renders the kids' Piggy Perch contest as a special highlight section
 * that pre-event shows the format and day-of fills with winners.
 */
export default function PiggyPerchHighlight({
  piggy,
}: {
  piggy: NonNullable<TournamentResults["piggyPerch"]>;
}) {
  const hasWinners = piggy.awards.some((a) => a.winner);

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-coral-300 bg-gradient-to-br from-coral-50 via-sand-50 to-coral-100/40 p-6 sm:p-8">
      {/* Decorative pig wave */}
      <div className="absolute top-3 right-4 text-5xl sm:text-7xl opacity-20 select-none pointer-events-none">
        🐷
      </div>

      <p className="text-coral-600 text-xs font-bold tracking-[0.25em] uppercase mb-3 relative">
        The Kids&apos; Division
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-3 relative">
        Piggy Perch
      </h2>
      <p className="text-base text-navy-700 font-light leading-relaxed mb-5 max-w-2xl relative">
        The only fishing contest where the smallest fish is a trophy.
        Bait and tackle provided — kids show up, get rigged, and start
        catching pinfish (the &ldquo;piggy perch&rdquo; nickname comes from
        the noises they make when handled).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-sand-200">
          <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-0.5">
            When
          </p>
          <p className="text-sm font-semibold text-navy-900">
            {piggy.startTime}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-sand-200">
          <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-0.5">
            Where
          </p>
          <p className="text-sm font-semibold text-navy-900">
            {piggy.location}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-coral-600 mb-3 relative">
          {hasWinners ? "2026 winners" : "Awards"}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 relative">
          {piggy.awards.map((a) => (
            <div
              key={a.category}
              className="bg-white rounded-lg p-3 border border-sand-200"
            >
              <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-widest mb-1">
                {a.label}
              </p>
              {a.winner ? (
                <>
                  <p className="text-sm font-display font-bold text-navy-900">
                    {a.winner}
                  </p>
                  {a.age && (
                    <p className="text-[11px] text-navy-500 font-light mt-0.5">
                      Age {a.age}
                    </p>
                  )}
                  {a.detail && (
                    <p className="text-[11px] text-navy-600 font-light mt-1">
                      {a.detail}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-navy-400 font-light italic">
                  TBD
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-navy-500 font-light mt-5 relative max-w-xl">
        {piggy.note}
      </p>
    </section>
  );
}
