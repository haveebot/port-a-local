import type { PastChampion } from "@/data/tournament-results";

/**
 * Past champions archive — group by year, list per division.
 * Crowd-sourced: every entry can carry a sourceUrl for verification,
 * and the bottom of the section invites the public to send in
 * missing years.
 */
export default function PastChampionsBoard({
  champions,
  contactEmail = "hello@theportalocal.com",
}: {
  champions: PastChampion[];
  contactEmail?: string;
}) {
  // Group by year, newest first
  const grouped = new Map<number, PastChampion[]>();
  for (const c of champions) {
    if (!grouped.has(c.year)) grouped.set(c.year, []);
    grouped.get(c.year)!.push(c);
  }
  const years = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Header strip */}
      <div className="px-5 py-4 border-b border-sand-200 bg-sand-50/60">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-navy-900">
              Past champions
            </h3>
            <p className="text-xs text-navy-500 font-light mt-0.5">
              Selected winners from the perpetual trophy lineage. Sources cited
              per entry where verified.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-navy-400 font-semibold whitespace-nowrap">
            {champions.length} entr{champions.length === 1 ? "y" : "ies"}
          </span>
        </div>
      </div>

      {/* Years */}
      <div className="divide-y divide-sand-200">
        {years.map((year) => {
          const entries = grouped.get(year)!;
          return (
            <div key={year} className="px-5 py-5">
              <div className="flex items-baseline gap-3 mb-4">
                <h4 className="font-display text-2xl font-bold text-coral-600 tabular-nums">
                  {year}
                </h4>
                {entries[0]?.edition && (
                  <span className="text-xs font-semibold text-navy-400 uppercase tracking-widest">
                    {entries[0].edition}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries.map((c, i) => (
                  <div
                    key={`${c.year}-${c.angler}-${i}`}
                    className="bg-sand-50/60 border border-sand-200 rounded-lg p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
                        {c.division}
                      </p>
                      {c.category && (
                        <span className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider">
                          {c.category}
                        </span>
                      )}
                    </div>
                    <p className="font-display font-bold text-navy-900 text-base">
                      {c.angler}
                    </p>
                    {(c.boat || c.homePort) && (
                      <p className="text-xs text-navy-500 font-light mt-0.5">
                        {c.boat}
                        {c.boat && c.homePort && " · "}
                        {c.homePort}
                      </p>
                    )}
                    {(c.species || c.weight || c.length) && (
                      <p className="text-sm text-navy-700 font-medium mt-2 tabular-nums">
                        {c.species && (
                          <span className="font-normal text-navy-500">
                            {c.species}
                            {(c.weight || c.length) && " · "}
                          </span>
                        )}
                        {c.weight ?? c.length}
                      </p>
                    )}
                    {c.notes && (
                      <p className="text-xs text-navy-600 font-light leading-relaxed mt-2">
                        {c.notes}
                      </p>
                    )}
                    {c.sourceUrl && (
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-coral-600 hover:text-coral-700 underline decoration-coral-200 hover:decoration-coral-500 mt-2 inline-flex items-center gap-1"
                      >
                        Source
                        <svg
                          className="w-3 h-3"
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Crowd-sourced footer */}
      <div className="px-5 py-4 border-t border-sand-200 bg-navy-900 text-sand-200">
        <p className="text-xs font-light leading-relaxed">
          <strong className="font-semibold text-coral-300">
            Building this archive.
          </strong>{" "}
          Have results, photos, or family records from past Roundups?
          Send them to{" "}
          <a
            href={`mailto:${contactEmail}?subject=Deep%20Sea%20Roundup%20past%20champion`}
            className="text-coral-300 hover:text-coral-200 underline decoration-coral-500/30 hover:decoration-coral-400"
          >
            {contactEmail}
          </a>{" "}
          — credit goes back to whoever sourced the win.
        </p>
      </div>
    </div>
  );
}
