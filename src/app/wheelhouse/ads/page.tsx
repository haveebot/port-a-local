import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  listCampaigns,
  fetchCampaignInsights,
  type CampaignSummary,
  type BoostInsights,
} from "@/lib/metaAds";
import { isMetaConfigured } from "@/lib/metaGraph";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";

export const dynamic = "force-dynamic";

/**
 * Ads — Meta Marketing API surface.
 *
 * Foundation for the full Ads tool. v0.1 is read-only: lists every
 * campaign the ad account owns (boost-created and standalone), grouped
 * by active vs paused/completed. Future PRs add Create / Pause / Resume
 * flows + custom-audience CRUD.
 *
 * Distinct from boosts: boosts amplify an existing FB post on a fixed
 * objective + limited budget. Ads run dedicated campaigns with arbitrary
 * objectives (Traffic / Awareness / Engagement / Leads / Sales), custom
 * audiences (site-visitor retargeting, lookalikes), and higher budgets.
 */

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_TRAFFIC: "Traffic",
  OUTCOME_AWARENESS: "Awareness",
  OUTCOME_ENGAGEMENT: "Engagement",
  OUTCOME_LEADS: "Leads",
  OUTCOME_SALES: "Sales",
  OUTCOME_APP_PROMOTION: "App promotion",
};

function objectiveLabel(o: string): string {
  return OBJECTIVE_LABELS[o] ?? o;
}

function formatBudget(cents: number | null): string {
  if (cents === null) return "—";
  const dollars = cents / 100;
  return `$${dollars.toFixed(dollars >= 100 ? 0 : 2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type CampaignWithInsights = CampaignSummary & {
  insights: BoostInsights | null;
};

function isActive(c: CampaignSummary): boolean {
  return c.status === "ACTIVE";
}

function formatSpend(cents: number | null | undefined): string {
  if (!cents) return "$0";
  const d = cents / 100;
  return `$${d >= 100 ? Math.round(d) : d.toFixed(2)}`;
}

function formatCount(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function AdsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const result = await listCampaigns({ limit: 200 });
  const meta = isMetaConfigured();
  const campaigns = result.campaigns ?? [];

  // Pull per-campaign insights in parallel. Each insight call is ~200-500ms;
  // 10 campaigns at once stays under the page-render budget. If any single
  // call fails, that row falls back to "no data" — the page still renders.
  const insightsList = result.stubbed
    ? campaigns.map(() => null)
    : await Promise.all(
        campaigns.map((c) =>
          fetchCampaignInsights(c.id)
            .then((r) => (r.ok ? r.insights ?? null : null))
            .catch(() => null),
        ),
      );
  const enriched = campaigns.map((c, i) => ({
    ...c,
    insights: insightsList[i],
  }));

  const active = enriched.filter(isActive);
  const past = enriched.filter((c) => !isActive(c));

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
        ]}
        current="🎯 Ads"
        right={
          <Link
            href="/wheelhouse/ads/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-coral-500 text-sand-50 hover:bg-coral-400 transition-colors whitespace-nowrap"
          >
            <span className="text-sm leading-none">+</span> Create ad
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* HEADER */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-sand-50 rounded-3xl px-6 py-7 shadow-lg">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Ads
          </h1>
          <p className="text-coral-200 text-sm leading-relaxed">
            Dedicated Meta ad campaigns — distinct from boosted posts. Real
            objectives, custom audiences, full Marketing API.
          </p>
          <div className="flex flex-wrap gap-2 text-xs mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${
                meta.fb
                  ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
                  : "bg-navy-500/30 text-navy-100 border-navy-400/40"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  meta.fb ? "bg-emerald-400" : "bg-navy-300"
                }`}
              />
              Marketing API · {result.stubbed ? "stub mode" : "live"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-navy-500/30 text-navy-100 border border-navy-400/40">
              🎯 {active.length} active
            </span>
            {past.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-navy-500/30 text-navy-100 border border-navy-400/40">
                📁 {past.length} past
              </span>
            )}
          </div>
        </section>

        {result.error && (
          <section className="bg-coral-50 border border-coral-300 rounded-2xl p-5 text-sm text-coral-900">
            <p className="font-semibold mb-1">Couldn&apos;t reach the Marketing API</p>
            <p className="text-coral-800 font-mono text-xs">{result.error}</p>
          </section>
        )}

        {result.stubbed && (
          <section className="bg-white border border-sand-300 rounded-2xl p-5 text-sm text-navy-700">
            <p className="font-semibold mb-1">Stub mode</p>
            <p className="text-navy-600 leading-relaxed">
              <code className="font-mono text-xs bg-sand-100 px-1 rounded">META_AD_ACCOUNT_ID</code>{" "}
              and / or{" "}
              <code className="font-mono text-xs bg-sand-100 px-1 rounded">META_PAGE_ACCESS_TOKEN</code>{" "}
              aren&apos;t set. The page works end-to-end; campaign data goes live
              once the credentials land in Vercel env.
            </p>
          </section>
        )}

        {!result.stubbed && campaigns.length === 0 && !result.error && (
          <section className="bg-white border border-sand-300 rounded-2xl p-10 text-center">
            <p className="text-navy-500 font-light">
              No campaigns in this ad account yet.
            </p>
            <p className="text-[11px] text-navy-400 mt-2">
              Boost campaigns from <code className="font-mono">/wheelhouse/social</code>{" "}
              will appear here once they fire. Standalone ads (Create flow)
              ships in a follow-up PR.
            </p>
          </section>
        )}

        {/* ACTIVE CAMPAIGNS */}
        {active.length > 0 && (
          <CampaignSection
            title="🎯 Active campaigns"
            sub="Currently spending"
            items={active}
            tone="emerald"
          />
        )}

        {/* PAST CAMPAIGNS */}
        {past.length > 0 && (
          <CampaignSection
            title="📁 Past campaigns"
            sub="Paused, completed, or with issues"
            items={past}
            tone="navy"
          />
        )}

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Foundation read-only view. Create / Pause / Resume + custom-audience
          management ship in follow-up PRs.
        </p>
      </div>
    </main>
  );
}

function CampaignSection({
  title,
  sub,
  items,
  tone,
}: {
  title: string;
  sub: string;
  items: CampaignWithInsights[];
  tone: "emerald" | "navy";
}) {
  const accent = tone === "emerald" ? "border-emerald-300" : "border-sand-300";
  return (
    <section className={`bg-white rounded-2xl border ${accent} p-6 shadow-sm`}>
      <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          {title}
          <span className="text-[11px] font-mono font-normal text-navy-400">
            ({items.length})
          </span>
        </h2>
        <p className="text-[11px] text-navy-500 italic">{sub}</p>
      </div>
      <div className="divide-y divide-sand-200">
        {items.map((c) => (
          <CampaignRow key={c.id} campaign={c} />
        ))}
      </div>
    </section>
  );
}

function CampaignRow({ campaign }: { campaign: CampaignWithInsights }) {
  const statusTone =
    campaign.status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : campaign.status === "PAUSED"
        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
        : "bg-sand-100 text-navy-600 border-sand-300";

  return (
    <div className="flex items-center gap-3 py-3 text-sm flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border shrink-0 ${statusTone}`}
      >
        {campaign.status}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-navy-800 truncate">
          {campaign.name || <span className="italic text-navy-400">(unnamed)</span>}
        </p>
        <p className="text-[11px] text-navy-500 mt-0.5">
          <span className="font-semibold">{objectiveLabel(campaign.objective)}</span>
          {campaign.isBoost && (
            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coral-50 text-coral-700 border border-coral-200 text-[9px] uppercase font-semibold tracking-wider">
              boost
            </span>
          )}
        </p>
      </div>
      <div className="text-right shrink-0 tabular-nums">
        {campaign.insights && campaign.insights.impressions > 0 ? (
          <>
            <p className="text-[11px] text-navy-700 font-semibold">
              {formatCount(campaign.insights.reach)}r ·{" "}
              {formatCount(campaign.insights.clicks)}c ·{" "}
              {formatSpend(campaign.insights.spendCents)}
            </p>
            <p className="text-[10px] text-navy-500">
              CTR {campaign.insights.ctr.toFixed(2)}% ·{" "}
              {formatBudget(campaign.dailyBudgetCents)}/day
            </p>
          </>
        ) : (
          <p className="text-[11px] text-navy-500">
            {formatBudget(campaign.dailyBudgetCents)}
            <span className="text-navy-400">/day</span>
          </p>
        )}
        {(campaign.startTime || campaign.stopTime) && (
          <p className="text-[10px] text-navy-400">
            {formatDate(campaign.startTime)}
            {campaign.startTime && campaign.stopTime && " → "}
            {formatDate(campaign.stopTime)}
          </p>
        )}
      </div>
    </div>
  );
}
