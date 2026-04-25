import type {
  Division,
  DivisionLeaderboard,
} from "@/data/tournament-results";

/**
 * Per-division leaderboard. Pulls best-in-class structure from billfish.com
 * and PGA-style scoreboards: tabular at desktop scale, stacked rows on
 * mobile, leader gets a coral row highlight + trophy mark, last-updated
 * timestamp at the top, "unofficial" flag when entries pre-date the
 * official board, empty state when weigh-ins haven't started.
 */
export default function LeaderboardTable({
  division,
  leaderboard,
  showCount = 5,
}: {
  division: Division;
  leaderboard?: DivisionLeaderboard;
  /** Show top N initially; "show all" toggle reveals the rest. Server-rendered, no client state. */
  showCount?: number;
}) {
  const entries = leaderboard?.entries ?? [];
  const visible = entries.slice(0, showCount);
  const remaining = entries.slice(showCount);

  const updatedDisplay = leaderboard?.updatedAt
    ? new Date(leaderboard.updatedAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const scoringLabel: Record<typeof division.scoring, string> = {
    weight: "Weight",
    length: "Length",
    count: "Count",
    release: "Releases",
  };

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-3 px-5 py-4 border-b border-sand-200 bg-sand-50/60">
        <div className="min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-bold text-navy-900">
            {division.name}
          </h3>
          <p className="text-xs text-navy-500 font-light mt-0.5 truncate">
            {division.short}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-navy-400 font-semibold">
            Scored by
          </p>
          <p className="text-sm font-semibold text-navy-700">
            {scoringLabel[division.scoring]}
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-navy-900 text-sand-100">
        <div className="flex items-center gap-2 text-xs">
          {entries.length > 0 ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500" />
              </span>
              <span className="font-semibold tracking-wider uppercase text-coral-300">
                Live
              </span>
              {leaderboard?.unofficial && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  Unofficial
                </span>
              )}
            </>
          ) : (
            <span className="text-navy-300 font-medium">
              {leaderboard?.status ?? "Weigh-ins haven't started"}
            </span>
          )}
        </div>
        {updatedDisplay && (
          <span className="text-[11px] font-mono text-navy-300">
            as of {updatedDisplay}
          </span>
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sand-100 text-navy-300 mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-navy-600 font-light leading-relaxed max-w-sm mx-auto">
            Live leaderboard fills in as fish hit the scale. Check back during
            weigh-in windows or refresh the page.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sand-200 text-[10px] uppercase tracking-widest text-navy-400 font-semibold">
                  <th className="px-5 py-2.5 text-left w-12">#</th>
                  <th className="px-5 py-2.5 text-left">Angler · Boat</th>
                  <th className="px-5 py-2.5 text-left">Species</th>
                  <th className="px-5 py-2.5 text-right tabular-nums">
                    {scoringLabel[division.scoring]}
                  </th>
                  <th className="px-5 py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <LeaderRow
                    key={`${entry.rank}-${entry.angler}`}
                    entry={entry}
                    scoring={division.scoring}
                  />
                ))}
                {remaining.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-3 border-t border-sand-200">
                      <details className="group">
                        <summary className="cursor-pointer list-none text-xs font-semibold text-coral-600 hover:text-coral-700 inline-flex items-center gap-1.5">
                          Show all {entries.length}
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
                        <table className="w-full mt-3">
                          <tbody>
                            {remaining.map((entry) => (
                              <LeaderRow
                                key={`${entry.rank}-${entry.angler}-x`}
                                entry={entry}
                                scoring={division.scoring}
                              />
                            ))}
                          </tbody>
                        </table>
                      </details>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked */}
          <div className="sm:hidden divide-y divide-sand-200">
            {visible.map((entry) => (
              <LeaderCardMobile
                key={`${entry.rank}-${entry.angler}-m`}
                entry={entry}
                scoring={division.scoring}
              />
            ))}
            {remaining.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-coral-600 inline-flex items-center gap-1.5">
                  Show all {entries.length}
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
                {remaining.map((entry) => (
                  <LeaderCardMobile
                    key={`${entry.rank}-${entry.angler}-mx`}
                    entry={entry}
                    scoring={division.scoring}
                  />
                ))}
              </details>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function scoreOf(
  entry: { weight?: string; length?: string; count?: number },
  scoring: ScoringMode,
): string {
  if (scoring === "weight") return entry.weight ?? "—";
  if (scoring === "length") return entry.length ?? "—";
  if (scoring === "count" || scoring === "release")
    return entry.count !== undefined ? `${entry.count}` : "—";
  return "—";
}

type ScoringMode = "weight" | "length" | "count" | "release";

function LeaderRow({
  entry,
  scoring,
}: {
  entry: import("@/data/tournament-results").LeaderboardEntry;
  scoring: ScoringMode;
}) {
  const isLeader = entry.rank === 1;
  const time = entry.caughtAt
    ? new Date(entry.caughtAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <tr
      className={
        isLeader
          ? "bg-coral-50/70 border-l-4 border-coral-500"
          : "hover:bg-sand-50/40 border-l-4 border-transparent"
      }
    >
      <td className="px-5 py-3 align-middle">
        <span
          className={
            isLeader
              ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral-500 text-white text-xs font-bold tabular-nums"
              : "inline-flex items-center justify-center w-7 h-7 rounded-full bg-sand-100 text-navy-600 text-xs font-bold tabular-nums"
          }
        >
          {entry.rank}
        </span>
      </td>
      <td className="px-5 py-3 align-middle">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-navy-900 text-sm">
            {entry.angler}
          </span>
          {entry.isJunior && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-700 border border-blue-500/30">
              Jr
            </span>
          )}
          {entry.isWoman && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-coral-500/15 text-coral-700 border border-coral-500/30">
              TWA
            </span>
          )}
        </div>
        {(entry.boat || entry.homePort) && (
          <p className="text-xs text-navy-500 font-light mt-0.5">
            {entry.boat}
            {entry.boat && entry.homePort && " · "}
            {entry.homePort}
          </p>
        )}
      </td>
      <td className="px-5 py-3 align-middle text-sm text-navy-700">
        {entry.species ?? "—"}
      </td>
      <td className="px-5 py-3 align-middle text-right">
        <span
          className={
            isLeader
              ? "font-display font-bold text-navy-900 tabular-nums text-lg"
              : "font-semibold text-navy-700 tabular-nums text-sm"
          }
        >
          {scoreOf(entry, scoring)}
        </span>
        {entry.notes && (
          <p className="text-[11px] text-navy-400 font-light mt-0.5">
            {entry.notes}
          </p>
        )}
      </td>
      <td className="px-5 py-3 align-middle text-right text-xs text-navy-500 font-mono tabular-nums">
        {time}
      </td>
    </tr>
  );
}

function LeaderCardMobile({
  entry,
  scoring,
}: {
  entry: import("@/data/tournament-results").LeaderboardEntry;
  scoring: ScoringMode;
}) {
  const isLeader = entry.rank === 1;
  const time = entry.caughtAt
    ? new Date(entry.caughtAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={
        isLeader
          ? "px-5 py-3.5 bg-coral-50/70 border-l-4 border-coral-500"
          : "px-5 py-3.5 border-l-4 border-transparent"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className={
              isLeader
                ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral-500 text-white text-xs font-bold tabular-nums flex-shrink-0 mt-0.5"
                : "inline-flex items-center justify-center w-7 h-7 rounded-full bg-sand-100 text-navy-600 text-xs font-bold tabular-nums flex-shrink-0 mt-0.5"
            }
          >
            {entry.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-navy-900 text-sm">
                {entry.angler}
              </span>
              {entry.isJunior && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-700 border border-blue-500/30">
                  Jr
                </span>
              )}
              {entry.isWoman && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-coral-500/15 text-coral-700 border border-coral-500/30">
                  TWA
                </span>
              )}
            </div>
            {(entry.boat || entry.species) && (
              <p className="text-xs text-navy-500 font-light mt-0.5 truncate">
                {entry.species}
                {entry.species && entry.boat && " · "}
                {entry.boat}
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className={
              isLeader
                ? "font-display font-bold text-navy-900 tabular-nums text-lg leading-none"
                : "font-semibold text-navy-700 tabular-nums text-sm leading-none"
            }
          >
            {scoreOf(entry, scoring)}
          </p>
          {time && (
            <p className="text-[10px] text-navy-400 font-mono tabular-nums mt-1">
              {time}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
