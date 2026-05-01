import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getTopQuestions,
  getContentGaps,
  getTopCitations,
  getTotals,
} from "@/data/ask-gully-log-store";
import { gullyItems, getGullyHref } from "@/lib/gullySearch";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";

export const dynamic = "force-dynamic";

/**
 * Ask Gully Insights — closes the tourist→ops loop by surfacing what
 * tourists are actually asking on /gully:
 *
 *   - Totals tile: question volume, cite rate, fallback rate
 *   - Top questions (last 7 days): what tourists ask repeatedly
 *   - Content gaps (last 14 days): questions that returned cited=0,
 *     ranked by frequency. These ARE the Heritage/Dispatch fodder
 *     priorities — no more "manufactured Dispatch angles" risk.
 *   - Top citations (last 30 days): which businesses Ask Gully sent
 *     traffic to. Real marketing data per vendor.
 *
 * Per memory feedback_pal_no_manufactured_dispatch.md: the gap report
 * surfaces what tourists actually want answered, not what we think
 * they want.
 */

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

export default async function AskGullyInsightsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const [totals, topQuestions, contentGaps, topCitations] = await Promise.all([
    getTotals(7),
    getTopQuestions(7, 10, 2),
    getContentGaps(14, 15),
    getTopCitations(30, 20),
  ]);

  // Resolve cited slug → name + href so the citations table reads
  // human, not slug-coded.
  const slugToItem = new Map(gullyItems.map((i) => [i.slug, i]));

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
        ]}
        current="🔍 Ask Gully"
        right={
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            powered by Heye Lab
          </span>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* TOTALS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h1 className="font-display text-2xl font-bold">Last 7 days</h1>
            <p className="text-[11px] text-navy-400 font-mono">
              source: ask_gully_log
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Stat label="Questions" value={String(totals.totalQuestions)} tone="navy" />
            <Stat label="Unique" value={String(totals.uniqueQuestions)} />
            <Stat
              label="Cite rate"
              value={pct(totals.citedRate)}
              tone={totals.citedRate >= 0.7 ? "emerald" : "navy"}
              hint="% with at least one citation"
            />
            <Stat
              label="Fallback rate"
              value={pct(totals.fallbackRate)}
              hint="% needing category/wrong-cat fallback"
            />
          </div>
          {totals.totalQuestions === 0 && (
            <p className="text-sm text-navy-500 mt-4">
              No data yet — Ask Gully logging started fresh. Questions will start appearing as tourists use the search.
            </p>
          )}
        </section>

        {/* TOP QUESTIONS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Top questions</h2>
          <p className="text-xs text-navy-500 mb-4">
            What tourists actually ask, last 7 days. Min 2 asks to filter noise.
          </p>
          {topQuestions.length === 0 ? (
            <p className="text-sm text-navy-500 italic">No repeat questions yet.</p>
          ) : (
            <div className="divide-y divide-sand-200">
              {topQuestions.map((q) => (
                <div
                  key={q.query}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="text-navy-800 truncate min-w-0 flex-1">
                    {q.query}
                  </span>
                  <span className="text-navy-500 text-xs whitespace-nowrap shrink-0">
                    avg {q.avgCited.toFixed(1)} cites · {relativeTime(q.lastAsked)}
                  </span>
                  <span className="font-semibold text-navy-900 font-mono tabular-nums whitespace-nowrap shrink-0 min-w-[42px] text-right">
                    {q.count}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CONTENT GAPS */}
        <section className="bg-coral-50 rounded-2xl border border-coral-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1 text-coral-900">
            Content gaps
          </h2>
          <p className="text-xs text-coral-700 mb-4">
            Questions in the last 14 days that returned <strong>cited=0</strong>.
            These are the Heritage / Dispatch / listing-tag priorities.
          </p>
          {contentGaps.length === 0 ? (
            <p className="text-sm text-coral-700 italic">
              No gap questions yet — every question got a citation. (Or no data yet.)
            </p>
          ) : (
            <div className="divide-y divide-coral-200">
              {contentGaps.map((g) => (
                <div
                  key={g.query}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="text-coral-900 truncate min-w-0 flex-1">
                    {g.query}
                  </span>
                  <span className="text-coral-700 text-xs whitespace-nowrap shrink-0">
                    {g.inferredCategory ? `cat: ${g.inferredCategory}` : "no inferred cat"} ·{" "}
                    {relativeTime(g.lastAsked)}
                  </span>
                  <span className="font-semibold text-coral-900 font-mono tabular-nums whitespace-nowrap shrink-0 min-w-[42px] text-right">
                    {g.count}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TOP CITATIONS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Top citations</h2>
          <p className="text-xs text-navy-500 mb-4">
            Businesses + pieces Ask Gully linked to most, last 30 days.
            Tangible "we sent you N customers" data per vendor.
          </p>
          {topCitations.length === 0 ? (
            <p className="text-sm text-navy-500 italic">
              No citations logged yet.
            </p>
          ) : (
            <div className="divide-y divide-sand-200">
              {topCitations.map((c) => {
                const item = slugToItem.get(c.slug);
                return (
                  <div
                    key={c.slug}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    {item ? (
                      <Link
                        href={getGullyHref(item)}
                        className="text-navy-800 hover:text-coral-700 underline-offset-2 hover:underline truncate min-w-0 flex-1"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="text-navy-500 truncate min-w-0 flex-1 italic">
                        {c.slug} (not in index)
                      </span>
                    )}
                    <span className="text-navy-500 text-xs whitespace-nowrap shrink-0">
                      {item?.type ?? "?"}
                    </span>
                    <span className="font-semibold text-navy-900 font-mono tabular-nums whitespace-nowrap shrink-0 min-w-[42px] text-right">
                      {c.count}×
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Anonymous query log. No PII. Fed by /api/gully/ask on every
          question-form search across /gully + homepage hero.
        </p>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
  hint,
}: {
  label: string;
  value: string;
  tone?: "navy" | "emerald";
  hint?: string;
}) {
  const valueClass = tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-4 min-w-0 overflow-hidden">
      <p
        className={`font-display text-2xl sm:text-3xl font-bold tabular-nums ${valueClass} truncate`}
        title={value}
      >
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-widest text-navy-500 mt-1">
        {label}
      </p>
      {hint && (
        <p className="text-[10px] text-navy-500 mt-1 leading-tight">{hint}</p>
      )}
    </div>
  );
}
