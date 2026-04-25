import type { TournamentResults } from "@/data/tournament-results";

/**
 * Compact "Milestones & records" grid. Verified facts only — speculative
 * records belong in the crowd-source pipeline, not here. Each milestone
 * gets a year, a label, and a value (the headline number/name) plus
 * optional detail.
 */
export default function MilestonesPanel({
  milestones,
}: {
  milestones: NonNullable<TournamentResults["milestones"]>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {milestones.map((m, i) => (
        <article
          key={i}
          className="bg-white border border-sand-200 rounded-xl p-5"
        >
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
              {m.label}
            </p>
            {m.year && (
              <span className="text-[10px] font-mono text-navy-400 tabular-nums">
                {m.year}
              </span>
            )}
          </div>
          <p className="font-display text-xl font-bold text-navy-900 leading-tight mb-2">
            {m.value}
          </p>
          {m.detail && (
            <p className="text-xs text-navy-600 font-light leading-relaxed">
              {m.detail}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
