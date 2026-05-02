import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getStats as getSocialStats,
  getPending as getSocialPending,
  getCurrentlyBoosting,
} from "@/data/social-post-store";
import { getAllGlossaryEntries } from "@/data/glossary-store";
import { listImages } from "@/data/image-library-store";
import { getActiveAlert } from "@/data/alerts-store";
import { getTopCitations } from "@/data/ask-gully-log-store";
import { getUpcomingMilestones } from "@/lib/eventMilestones";
import { isMetaConfigured } from "@/lib/metaGraph";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";

export const dynamic = "force-dynamic";

/**
 * Marketing Hub — the tile-based launcher for everything Collie touches.
 *
 * Designed for a consumer-app operator: big tappable tiles, dynamic
 * stats, time-of-day greeting using the wheelhouse_who cookie. Each
 * tile is the entry point to a deeper tool (queue, bank, glossary,
 * ask-gully). One screen, fast scan, fast hop.
 */

function timeGreeting(): string {
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Hey";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function MarketingHubPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const [
    socialStats,
    socialPending,
    glossaryEntries,
    bankImages,
    activeAlert,
    topCitations,
    currentlyBoosting,
  ] = await Promise.all([
    getSocialStats(),
    getSocialPending(50),
    getAllGlossaryEntries().catch(() => []),
    listImages({ limit: 200 }).catch(() => []),
    getActiveAlert().catch(() => null),
    getTopCitations(7, 5).catch(() => []),
    getCurrentlyBoosting().catch(() => []),
  ]);
  const upcoming = getUpcomingMilestones(60);
  const meta = isMetaConfigured();

  const glossaryUnreviewed = glossaryEntries.filter(
    (e) => e.marketingStatus === "queued",
  ).length;
  const glossaryActive = glossaryEntries.filter(
    (e) => e.marketingStatus === "active",
  ).length;

  const greeting = `${timeGreeting()}, ${capitalize(who)} 👋`;

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[{ label: "🏠 Wheelhouse", href: "/wheelhouse" }]}
        current="📊 Marketing"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* GREETING + AT-A-GLANCE */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-sand-50 rounded-3xl px-6 py-7 shadow-lg">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            {greeting}
          </h1>
          <p className="text-coral-200 text-sm leading-relaxed mb-4">
            Here&apos;s what&apos;s happening on the Port A Local marketing front today.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <BadgeStat
              icon="🔥"
              label={`${socialStats.pending} pending`}
              tone={socialStats.pending > 0 ? "coral" : "muted"}
            />
            <BadgeStat
              icon="📤"
              label={`${socialStats.sent24h} sent today`}
              tone="emerald"
            />
            <BadgeStat
              icon="📚"
              label={`${bankImages.length} in bank`}
              tone="muted"
            />
            <BadgeStat
              icon="📖"
              label={`${glossaryActive} active`}
              tone="muted"
            />
            {activeAlert && (
              <BadgeStat
                icon="🚨"
                label="alert live"
                tone="coral"
              />
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-3 gap-3">
          <QuickAction
            href="/wheelhouse/social/bank"
            icon="📤"
            label="Upload"
            sublabel="to the Bank"
          />
          <QuickAction
            href="/wheelhouse/social"
            icon="✏️"
            label="Compose"
            sublabel="a new post"
          />
          <QuickAction
            href="/wheelhouse/ask-gully"
            icon="🔥"
            label="What's hot"
            sublabel="this week"
          />
        </section>

        {/* MAIN TILES */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Tile
            href="/wheelhouse/social"
            icon="📱"
            title="Social"
            stat={`${socialStats.pending} queued`}
            statTone={socialStats.pending > 0 ? "coral" : "muted"}
            sub={`${socialStats.sent24h} sent today`}
          />
          <Tile
            href="/wheelhouse/social#recent"
            icon="📊"
            title="Post performance"
            stat={`${socialStats.totalSent} sent`}
            statTone="muted"
            sub="click-through analytics"
          />
          <Tile
            href="/wheelhouse/social/bank"
            icon="📚"
            title="Bank"
            stat={`${bankImages.length} ${bankImages.length === 1 ? "image" : "images"}`}
            statTone="muted"
            sub="image collateral"
          />
          <Tile
            href="/wheelhouse/glossary"
            icon="📖"
            title="Glossary"
            stat={`${glossaryActive} active`}
            statTone={glossaryUnreviewed > 0 ? "coral" : "emerald"}
            sub={
              glossaryUnreviewed > 0
                ? `${glossaryUnreviewed} need eyes`
                : "all reviewed"
            }
          />
          <Tile
            href="/wheelhouse/ask-gully"
            icon="🔍"
            title="Ask Gully"
            stat={`${topCitations.length} hot`}
            statTone="muted"
            sub="top citations"
          />
        </section>

        {/* COMING UP — collapsed view of upcoming milestones */}
        {upcoming.length > 0 && (
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
              <h2 className="font-display text-lg font-bold">📆 Coming up</h2>
              <p className="text-[11px] text-navy-500">
                Posts that auto-queue on these dates
              </p>
            </div>
            <div className="divide-y divide-sand-200">
              {upcoming.slice(0, 5).map((m) => (
                <div
                  key={`${m.event.slug}-${m.kind}`}
                  className="flex items-center gap-3 py-2 text-sm flex-wrap"
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
                  <span className="text-xs text-navy-500 font-mono whitespace-nowrap shrink-0">
                    {new Date(m.fireDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
            {!meta.fb && (
              <p className="text-[11px] text-navy-500 mt-3 italic">
                Note: Meta in stub mode — these will queue but not auto-fire
                until <code>META_PAGE_ACCESS_TOKEN</code> is set.
              </p>
            )}
          </section>
        )}

        {/* ACTIVE BOOSTS — paid promotions currently spending */}
        {currentlyBoosting.length > 0 && (
          <section className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <span>🚀</span>
                Currently boosting
                <span className="text-[11px] font-mono font-normal text-navy-400">
                  ({currentlyBoosting.length})
                </span>
              </h2>
              <p className="text-[11px] text-navy-500 italic">
                Paid promotions in flight — Meta is showing these to people
                beyond your followers
              </p>
            </div>
            <div className="divide-y divide-sand-200">
              {currentlyBoosting.map((p) => {
                const insights = p.boostInsights as
                  | {
                      reach?: number;
                      impressions?: number;
                      clicks?: number;
                      spendCents?: number;
                    }
                  | null;
                const hasInsights = !!(
                  insights && (insights.reach || insights.impressions)
                );
                const reach = insights?.reach ?? 0;
                const clicks = insights?.clicks ?? 0;
                const spend = ((insights?.spendCents ?? 0) / 100).toFixed(2);
                const fbUrl = p.externalPostUrl;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 py-3 text-sm flex-wrap"
                  >
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-300 shrink-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                        aria-hidden
                      />
                      Active
                    </span>
                    <span className="text-navy-800 truncate min-w-0 flex-1">
                      {p.caption.slice(0, 80)}
                      {p.caption.length > 80 ? "…" : ""}
                    </span>
                    <span className="text-[11px] font-mono whitespace-nowrap shrink-0 text-navy-600">
                      {hasInsights ? (
                        <>
                          {reach}r · {clicks}c · ${spend}
                        </>
                      ) : (
                        <span className="italic opacity-70">syncing…</span>
                      )}
                    </span>
                    {fbUrl && (
                      <a
                        href={fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-coral-700 hover:text-coral-900 font-semibold whitespace-nowrap shrink-0"
                      >
                        View on FB ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-navy-400 mt-3">
              Insights populate ~1 hour after each boost starts. Full breakdown
              + history at{" "}
              <Link
                href="/wheelhouse/social#recent"
                className="text-coral-700 hover:text-coral-900 font-semibold"
              >
                Post performance
              </Link>
              .
            </p>
          </section>
        )}

        {/* LATELY — top citations show what's getting clicks via Gully */}
        {topCitations.length > 0 && (
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
              <h2 className="font-display text-lg font-bold">📈 Lately</h2>
              <p className="text-[11px] text-navy-500">
                What tourists are landing on via Gully · last 7 days
              </p>
            </div>
            <div className="divide-y divide-sand-200">
              {topCitations.slice(0, 5).map((c) => (
                <div
                  key={c.slug}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="text-navy-800 truncate min-w-0 flex-1 font-mono text-[11px]">
                    {c.slug}
                  </span>
                  <span className="font-semibold text-navy-900 font-mono tabular-nums whitespace-nowrap shrink-0">
                    {c.count}×
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Marketing Hub aggregates the surfaces above. Every tile is one tap
          away — and one tap home from anywhere via the breadcrumb.
        </p>
      </div>
    </main>
  );
}

function BadgeStat({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: "coral" | "emerald" | "muted";
}) {
  const cls =
    tone === "coral"
      ? "bg-coral-500/20 text-coral-100 border-coral-400/40"
      : tone === "emerald"
        ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
        : "bg-navy-500/30 text-navy-100 border-navy-400/40";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${cls}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function QuickAction({
  href,
  icon,
  label,
  sublabel,
}: {
  href: string;
  icon: string;
  label: string;
  sublabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-1 px-3 py-4 bg-white rounded-2xl border border-sand-300 hover:border-coral-400 hover:bg-coral-50/40 transition-all shadow-sm hover:shadow-md text-center"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="font-display text-sm font-bold text-navy-900">
        {label}
      </span>
      <span className="text-[10px] text-navy-500">{sublabel}</span>
    </Link>
  );
}

function Tile({
  href,
  icon,
  title,
  stat,
  sub,
  statTone,
}: {
  href: string;
  icon: string;
  title: string;
  stat: string;
  sub: string;
  statTone: "coral" | "emerald" | "muted";
}) {
  const statCls =
    statTone === "coral"
      ? "text-coral-700"
      : statTone === "emerald"
        ? "text-emerald-700"
        : "text-navy-700";
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 p-5 bg-white rounded-2xl border border-sand-300 hover:border-coral-400 hover:shadow-lg transition-all shadow-sm relative overflow-hidden"
    >
      <span className="text-3xl">{icon}</span>
      <h3 className="font-display text-lg font-bold text-navy-900 group-hover:text-coral-700 transition-colors">
        {title}
      </h3>
      <div>
        <p className={`text-sm font-bold ${statCls} tabular-nums`}>{stat}</p>
        <p className="text-[11px] text-navy-500 leading-tight mt-0.5">{sub}</p>
      </div>
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 text-navy-300 group-hover:text-coral-500 group-hover:translate-x-1 transition-all"
      >
        →
      </span>
    </Link>
  );
}
