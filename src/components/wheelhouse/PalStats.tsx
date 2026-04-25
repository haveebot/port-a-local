import type { PalStats } from "@/data/wheelhouse-store";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function deltaPct(today: number, yesterday: number): {
  label: string;
  tone: "up" | "down" | "flat";
} | null {
  if (yesterday === 0) {
    if (today === 0) return null;
    return { label: "new", tone: "up" };
  }
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  if (pct === 0) return { label: "0%", tone: "flat" };
  return {
    label: `${pct > 0 ? "+" : ""}${pct}%`,
    tone: pct > 0 ? "up" : "down",
  };
}

export default function PalStatsCard({ stats }: { stats: PalStats }) {
  const delta = deltaPct(stats.totalToday, stats.totalYesterday);
  const toneClass =
    delta?.tone === "up"
      ? "text-emerald-600"
      : delta?.tone === "down"
        ? "text-red-600"
        : "text-navy-400";

  return (
    <section className="mb-6 bg-white border border-sand-200 rounded-xl overflow-hidden">
      <header className="px-5 py-3 border-b border-sand-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
            PAL Traffic · Last 24h
          </span>
          {!stats.hasData && (
            <span className="text-xs text-navy-400 font-light">
              Drain not ingesting yet — events appear here once configured.
            </span>
          )}
        </div>
        <a
          href="https://vercel.com/haveebots-projects/port-a-local/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-navy-500 hover:text-coral-600 underline decoration-sand-300 hover:decoration-coral-400"
        >
          Vercel dashboard ↗
        </a>
      </header>

      {stats.hasData ? (
        <>
          <div className="px-5 py-4 border-b border-sand-100 flex items-baseline gap-4 flex-wrap">
            <div>
              <span className="font-display text-3xl font-bold text-navy-900 tabular-nums">
                {formatNumber(stats.totalToday)}
              </span>
              <span className="text-xs text-navy-500 ml-2">pageviews</span>
            </div>
            {delta && (
              <span
                className={`text-sm font-mono tabular-nums ${toneClass}`}
                title={`Yesterday: ${formatNumber(stats.totalYesterday)}`}
              >
                {delta.label}
                <span className="text-navy-400 font-light ml-1">
                  vs yesterday
                </span>
              </span>
            )}
            <span className="text-xs text-navy-400 font-mono tabular-nums ml-auto">
              {formatNumber(stats.totalLast7d)} / 7d
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-100">
            <StatColumn
              label="Top pages"
              empty="No pageviews in window"
              rows={stats.topPaths.map((p) => ({
                key: p.path,
                left: p.path,
                right: formatNumber(p.views),
              }))}
            />
            <StatColumn
              label="Top events"
              empty="No custom events tracked"
              rows={stats.topEvents.map((e) => ({
                key: e.eventName,
                left: e.eventName,
                right: formatNumber(e.count),
              }))}
            />
          </div>

          {stats.topCountries.length > 0 && (
            <div className="px-5 py-3 border-t border-sand-100 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold tracking-widest uppercase text-navy-400">
                Top regions
              </span>
              {stats.topCountries.map((c) => (
                <span
                  key={c.country}
                  className="text-xs text-navy-600 font-mono"
                >
                  {c.country}{" "}
                  <span className="text-navy-400 tabular-nums">
                    {formatNumber(c.views)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-navy-500 font-light">
            No traffic data yet. Once the Vercel Web Analytics Drain is
            configured, pageviews will start streaming into this card within
            a few minutes.
          </p>
        </div>
      )}
    </section>
  );
}

function StatColumn({
  label,
  rows,
  empty,
}: {
  label: string;
  rows: { key: string; left: string; right: string }[];
  empty: string;
}) {
  return (
    <div className="px-5 py-3">
      <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-2">
        {label}
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-navy-400 font-light italic">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-navy-700 truncate font-mono text-xs">
                {r.left}
              </span>
              <span className="text-navy-900 font-mono tabular-nums text-xs flex-shrink-0">
                {r.right}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
