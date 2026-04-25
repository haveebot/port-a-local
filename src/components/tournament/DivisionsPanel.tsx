import type { Division } from "@/data/tournament-results";

/**
 * Renders all tournament divisions as a clean grid with optional
 * collapsible rules. Static — no client state. Lives on the
 * pre-event page.
 */
export default function DivisionsPanel({
  divisions,
}: {
  divisions: Division[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {divisions.map((d) => (
        <div
          key={d.slug}
          className="bg-white border border-sand-200 rounded-xl p-5"
        >
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h3 className="font-display font-bold text-navy-900 text-lg">
              {d.name}
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-coral-600 whitespace-nowrap">
              {d.scoring === "weight"
                ? "Heaviest"
                : d.scoring === "length"
                  ? "Longest"
                  : d.scoring === "release"
                    ? "Most Released"
                    : "Most Caught"}
            </span>
          </div>

          <p className="text-sm text-navy-600 font-light leading-relaxed mb-3">
            {d.short}
          </p>

          {d.categories && d.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {d.categories.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-sand-100 text-navy-600 border border-sand-200"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <details className="group">
            <summary className="cursor-pointer list-none text-xs font-semibold text-navy-500 hover:text-coral-600 inline-flex items-center gap-1.5">
              Rules
              <svg
                className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
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
            <p className="text-xs text-navy-500 font-light leading-relaxed mt-2.5 pl-1 border-l-2 border-coral-100 pl-3">
              {d.rules}
            </p>
            {d.prize && (
              <p className="text-xs text-navy-700 font-medium mt-2 pl-3">
                Prize: {d.prize}
              </p>
            )}
          </details>
        </div>
      ))}
    </div>
  );
}
