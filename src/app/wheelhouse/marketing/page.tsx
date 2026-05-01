import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStats as getSocialStats, getPending as getSocialPending } from "@/data/social-post-store";
import { getAllGlossaryEntries } from "@/data/glossary-store";
import { getTopCitations } from "@/data/ask-gully-log-store";
import { getUpcomingMilestones } from "@/lib/eventMilestones";
import { gullyItems, getGullyHref } from "@/lib/gullySearch";
import { isMetaConfigured } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";

/**
 * Marketing hub — consolidates the operator surfaces that live in
 * the marketing lane: glossary status, social review queue, upcoming
 * post triggers, and content-priority signal from Ask Gully.
 *
 * Per Winston 2026-04-30 (porch of the Tarpon Inn): "the glossary
 * and social review can basically go into one marketing tool."
 *
 * Hub doesn't replace deep pages — those keep their own URLs for
 * direct linking. This is the "what's happening at a glance" view
 * the operator opens when they're not going somewhere specific.
 */

function relativeTime(iso: string, opts?: { future?: boolean }): string {
  const ms = opts?.future
    ? new Date(iso).getTime() - Date.now()
    : Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return opts?.future ? "imminent" : "just now";
  if (min < 60) return opts?.future ? `in ${min}m` : `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return opts?.future ? `in ${hr}h` : `${hr}h ago`;
  const day = Math.round(hr / 24);
  return opts?.future ? `in ${day}d` : `${day}d ago`;
}

export default async function MarketingHubPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const [socialStats, socialPending, glossaryEntries, topCitations] =
    await Promise.all([
      getSocialStats(),
      getSocialPending(50),
      getAllGlossaryEntries().catch(() => []),
      getTopCitations(7, 10).catch(() => []),
    ]);
  const upcoming = getUpcomingMilestones(60);
  const meta = isMetaConfigured();

  const glossaryUnreviewed = glossaryEntries.filter(
    (e) => e.marketingStatus === "queued",
  ).length;
  const glossaryActive = glossaryEntries.filter(
    (e) => e.marketingStatus === "active",
  ).length;

  // Resolve cited slug → name for the citations table
  const slugToItem = new Map(gullyItems.map((i) => [i.slug, i]));

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">Marketing</p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Glossary · Social · Triggers
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* PENDING ACTION */}
        <section className="bg-coral-50 rounded-2xl border border-coral-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1 text-coral-900">
            Pending action
          </h2>
          <p className="text-xs text-coral-700 mb-4">
            What needs operator attention right now.
          </p>
          {socialStats.pending === 0 && glossaryUnreviewed === 0 ? (
            <p className="text-sm text-coral-700 italic">
              All clear — no posts waiting to send, no glossary entries waiting on Collie.
            </p>
          ) : (
            <div className="space-y-2">
              {socialStats.pending > 0 && (
                <Link
                  href="/wheelhouse/social"
                  className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-coral-200 hover:border-coral-400 transition-colors"
                >
                  <span className="text-sm text-navy-800">
                    <strong>{socialStats.pending}</strong>{" "}
                    {socialStats.pending === 1 ? "social post" : "social posts"} awaiting review
                  </span>
                  <span className="text-xs text-coral-700 font-semibold">→ Send / Edit / Skip</span>
                </Link>
              )}
              {glossaryUnreviewed > 0 && (
                <Link
                  href="/wheelhouse/glossary"
                  className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-coral-200 hover:border-coral-400 transition-colors"
                >
                  <span className="text-sm text-navy-800">
                    <strong>{glossaryUnreviewed}</strong> glossary{" "}
                    {glossaryUnreviewed === 1 ? "entry" : "entries"} unreviewed by Collie
                  </span>
                  <span className="text-xs text-coral-700 font-semibold">→ Review</span>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* UPCOMING TRIGGERS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Upcoming triggers</h2>
          <p className="text-xs text-navy-500 mb-4">
            Posts the milestone cron will auto-queue, next 60 days.
            Each lands in the Social review queue before firing.
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-navy-500 italic">
              No upcoming event milestones. Add events to <code>events.ts</code>{" "}
              with <code>published: true</code> to populate.
            </p>
          ) : (
            <div className="divide-y divide-sand-200">
              {upcoming.slice(0, 12).map((m) => (
                <div
                  key={`${m.event.slug}-${m.kind}`}
                  className="flex items-center gap-3 py-2.5 text-sm flex-wrap"
                >
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-coral-50 text-coral-700 border border-coral-200 shrink-0">
                    {m.label}
                  </span>
                  <Link
                    href={`/events/${m.event.slug}`}
                    className="text-navy-800 hover:text-coral-700 truncate min-w-0 flex-1"
                  >
                    {m.event.name}
                  </Link>
                  <span className="text-xs text-navy-500 whitespace-nowrap shrink-0">
                    {relativeTime(m.fireDate, { future: true })}
                  </span>
                  <span className="text-xs text-navy-400 font-mono whitespace-nowrap shrink-0">
                    {new Date(m.fireDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!meta.fb && (
            <p className="text-[11px] text-navy-500 mt-4 italic">
              Meta in stub mode — when these triggers fire they'll log to the queue
              but Send won't actually post until <code>META_PAGE_ACCESS_TOKEN</code>{" "}
              is configured.
            </p>
          )}
        </section>

        {/* LAST 7 DAYS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Last 7 days</h2>
          <p className="text-xs text-navy-500 mb-4">
            Volume + signal across the marketing surfaces.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Stat label="Posts sent" value={String(socialStats.sent24h)} hint="last 24h" />
            <Stat label="Posts failed" value={String(socialStats.failed7d)} hint="last 7d" tone={socialStats.failed7d > 0 ? "coral" : "navy"} />
            <Stat label="Glossary active" value={String(glossaryActive)} hint="surfaces marketed" />
            <Stat label="Total posts shipped" value={String(socialStats.totalSent)} hint="all time" tone="emerald" />
          </div>
          {topCitations.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-widest text-navy-500 mb-2">
                Top Ask Gully citations · last 7 days
              </p>
              <p className="text-xs text-navy-500 mb-3 leading-relaxed">
                Businesses + pieces tourists landed on through Gully's AI answers.
                Tangible &quot;we sent N customers your way&quot; data per vendor.
              </p>
              <div className="divide-y divide-sand-200">
                {topCitations.slice(0, 5).map((c) => {
                  const item = slugToItem.get(c.slug);
                  return (
                    <div
                      key={c.slug}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      {item ? (
                        <Link
                          href={getGullyHref(item)}
                          className="text-navy-800 hover:text-coral-700 truncate min-w-0 flex-1"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="text-navy-500 truncate min-w-0 flex-1 italic">
                          {c.slug}
                        </span>
                      )}
                      <span className="font-semibold text-navy-900 font-mono tabular-nums whitespace-nowrap shrink-0">
                        {c.count}×
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* DEEP LINKS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Deep dives</h2>
          <p className="text-xs text-navy-500 mb-4">
            Specialized tools — the hub above is the daily check-in,
            these are where the work happens.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DeepLink
              href="/wheelhouse/social"
              title="Social review queue"
              detail="Send / edit / skip posts before they fire to FB / IG"
            />
            <DeepLink
              href="/wheelhouse/glossary"
              title="Glossary"
              detail="Collie's marketing-status workspace per PAL feature"
            />
            <DeepLink
              href="/wheelhouse/ask-gully"
              title="Ask Gully insights"
              detail="Top questions, content gaps, citation leaderboard"
            />
          </div>
        </section>

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Marketing hub aggregates the surfaces; the milestone cron will auto-queue
          posts once enabled. Until then, posts queue manually via the Social tool.
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
  tone?: "navy" | "emerald" | "coral";
  hint?: string;
}) {
  const valueClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "coral"
        ? "text-coral-600"
        : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-4 min-w-0 overflow-hidden">
      <p
        className={`font-display text-2xl sm:text-3xl font-bold tabular-nums ${valueClass} truncate`}
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

function DeepLink({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 bg-sand-100 hover:bg-coral-50 rounded-lg border border-sand-300 hover:border-coral-300 transition-colors"
    >
      <p className="font-display text-base font-bold text-navy-900 mb-1">{title}</p>
      <p className="text-xs text-navy-500 leading-relaxed">{detail}</p>
    </Link>
  );
}
