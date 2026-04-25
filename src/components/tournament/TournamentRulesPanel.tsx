import type {
  TournamentRules,
  Division,
} from "@/data/tournament-results";

/**
 * Editorial rules panel — the rules organized cleanly with a
 * prominent "Official rules →" link to source. Per-division
 * sections collapse to keep the page scannable.
 */
export default function TournamentRulesPanel({
  rules,
  divisions,
}: {
  rules: TournamentRules;
  divisions: Division[];
}) {
  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sand-200 bg-sand-50/60">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-bold text-navy-900">
              Tournament rules
            </h3>
            <p className="text-xs text-navy-500 font-light mt-0.5">
              Editorial summary · {rules.edition} · official rules linked below
              are the source of truth.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={rules.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold btn-coral"
            >
              Official rules
              <svg
                className="w-3.5 h-3.5"
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
            {rules.officialPdfUrl && (
              <a
                href={rules.officialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-navy-200 text-navy-700 hover:bg-navy-50"
              >
                PDF
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Universal rules */}
      <section className="px-5 py-5 border-b border-sand-200">
        <p className="text-coral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
          Across every division
        </p>
        <ul className="space-y-2">
          {rules.universal.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm text-navy-700 font-light leading-relaxed">
              <span className="text-coral-500 flex-shrink-0 mt-0.5">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Per-division rules */}
      {rules.divisionNotes && Object.keys(rules.divisionNotes).length > 0 && (
        <section className="px-5 py-5 border-b border-sand-200">
          <p className="text-coral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
            By division
          </p>
          <div className="space-y-2">
            {divisions.map((d) => {
              const notes = rules.divisionNotes?.[d.slug];
              if (!notes || notes.length === 0) return null;
              return (
                <details key={d.slug} className="group bg-sand-50/60 rounded-lg border border-sand-200">
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
                    <span className="font-semibold text-navy-900 text-sm">
                      {d.name}
                    </span>
                    <svg
                      className="w-4 h-4 text-navy-400 transition-transform group-open:rotate-90"
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
                  </summary>
                  <ul className="px-4 pb-4 pt-1 space-y-1.5">
                    {notes.map((n, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-xs text-navy-600 font-light leading-relaxed"
                      >
                        <span className="text-coral-400 flex-shrink-0 mt-0.5">·</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* Archive */}
      {rules.archive && rules.archive.length > 0 && (
        <section className="px-5 py-5">
          <p className="text-coral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
            Past editions
          </p>
          <ul className="space-y-1.5">
            {rules.archive.map((a) => (
              <li key={a.year} className="text-sm">
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral-600 hover:text-coral-700 underline decoration-coral-200 hover:decoration-coral-500"
                  >
                    {a.label}
                  </a>
                ) : (
                  <span className="text-navy-600 font-light">{a.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Crowd-source footer */}
      <div className="px-5 py-4 border-t border-sand-200 bg-navy-900 text-sand-200">
        <p className="text-xs font-light leading-relaxed">
          <strong className="font-semibold text-coral-300">Have an older rules edition?</strong>{" "}
          Boatmen Inc. records, scanned PDFs, photos of historic posters — send to{" "}
          <a
            href="mailto:hello@theportalocal.com?subject=Deep%20Sea%20Roundup%20rules%20archive"
            className="text-coral-300 hover:text-coral-200 underline decoration-coral-500/30 hover:decoration-coral-400"
          >
            hello@theportalocal.com
          </a>{" "}
          and we&apos;ll add it to the archive with credit.
        </p>
      </div>
    </div>
  );
}
