import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getPending,
  getRecent,
  getStats,
  type SocialPost,
} from "@/data/social-post-store";
import { isMetaConfigured } from "@/lib/metaGraph";
import SocialPostCard from "./SocialPostCard";
import RecentSent from "./RecentSent";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";
import AskHavee from "./AskHavee";

/**
 * Bucket pending posts into three visual tiers based on auto_send_at.
 * - 🔥 Firing soon: auto_send_at within next 24h (or in past — imminent)
 * - ⏰ Scheduled later: auto_send_at >= 24h out
 * - 📝 Stockpile: no auto_send_at (manual-fire only / drafts)
 *
 * display_order is preserved within each bucket — operator's manual
 * ordering carries through. Reorder buttons (↑↓) operate on display_order
 * globally, so an item can shuffle relative to items in adjacent buckets,
 * but its bucket assignment is determined purely by auto_send_at.
 */
function bucketPending(pending: SocialPost[]): {
  firingSoon: SocialPost[];
  scheduledLater: SocialPost[];
  stockpile: SocialPost[];
} {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const out = {
    firingSoon: [] as SocialPost[],
    scheduledLater: [] as SocialPost[],
    stockpile: [] as SocialPost[],
  };
  for (const p of pending) {
    if (!p.autoSendAt) {
      out.stockpile.push(p);
      continue;
    }
    const t = new Date(p.autoSendAt).getTime();
    if (t < now + dayMs) {
      out.firingSoon.push(p);
    } else {
      out.scheduledLater.push(p);
    }
  }
  return out;
}

export const dynamic = "force-dynamic";

/**
 * Wheelhouse social review queue.
 *
 * Shows:
 *   - Stats: pending count, sent in last 24h, failed in last 7d
 *   - META status indicator (live or stub mode based on env vars)
 *   - PENDING posts as review cards (Send / Edit / Skip)
 *   - RECENT history (last 30 across all statuses)
 *
 * Per Winston: review queue first, auto-fire later. Operator approves
 * each post before it fires to FB/IG. PAL brand voice is the surface
 * we cannot vibe-code, so human-in-the-loop is mandatory for v1.
 */

export default async function SocialQueuePage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const [pending, recent, stats] = await Promise.all([
    getPending(50),
    getRecent(30),
    getStats(),
  ]);
  const meta = isMetaConfigured();

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
        ]}
        current="📱 Social"
        right={
          <Link
            href="/wheelhouse/social/bank"
            className="text-[11px] text-coral-300 hover:text-coral-100 font-semibold whitespace-nowrap"
          >
            📚 Bank →
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* META STATUS */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h1 className="font-display text-2xl font-bold">Status</h1>
            <p className="text-[11px] text-navy-400 font-mono">
              source: social_post_queue
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <Stat label="Pending" value={String(stats.pending)} tone={stats.pending > 0 ? "coral" : "navy"} />
            <Stat label="Sent · 24h" value={String(stats.sent24h)} tone="emerald" />
            <Stat label="Failed · 7d" value={String(stats.failed7d)} tone={stats.failed7d > 0 ? "coral" : "navy"} />
            <Stat label="Total sent" value={String(stats.totalSent)} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
                meta.fb
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-navy-100 text-navy-600 border border-navy-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${meta.fb ? "bg-emerald-500" : "bg-navy-400"}`}
              />
              Facebook · {meta.fb ? "live" : "stub mode"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
                meta.ig
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-navy-100 text-navy-600 border border-navy-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${meta.ig ? "bg-emerald-500" : "bg-navy-400"}`}
              />
              Instagram · {meta.ig ? "live" : "stub mode"}
            </span>
          </div>
          {(!meta.fb || !meta.ig) && (
            <p className="text-xs text-navy-500 mt-3 leading-relaxed">
              <strong>Stub mode:</strong> Sends are logged but not actually
              posted. Drop <code>META_PAGE_ID</code>,{" "}
              <code>META_PAGE_ACCESS_TOKEN</code>, and{" "}
              <code>META_INSTAGRAM_ACCOUNT_ID</code> into Vercel env to go
              live.
            </p>
          )}
        </section>

        {/* ASK HAVEE — NL composer */}
        <AskHavee />

        {/* PENDING REVIEW — sectioned by fire-readiness */}
        <section className="bg-white rounded-2xl border border-coral-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">
            What&apos;s queued up
          </h2>
          <p className="text-xs text-navy-500 mb-4">
            Look these over and fire when ready. Sections below sort by
            fire-readiness — scheduled posts first, drafts at the bottom.
          </p>
          {pending.length === 0 ? (
            <p className="text-sm text-navy-500 italic">
              No posts pending. Triggers will populate this queue
              automatically.
            </p>
          ) : (
            <PendingSections pending={pending} />
          )}
        </section>

        {/* RECENT HISTORY — with FB click-through traffic per post */}
        <RecentSent recent={recent} />

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Stockpile the pond — fire what hits. Skip what doesn&apos;t.
        </p>
      </div>
    </main>
  );
}

function PendingSections({ pending }: { pending: SocialPost[] }) {
  const buckets = bucketPending(pending);
  const sections: {
    key: "firingSoon" | "scheduledLater" | "stockpile";
    icon: string;
    title: string;
    sub: string;
    tone: "coral" | "emerald" | "navy";
    items: SocialPost[];
  }[] = [
    {
      key: "firingSoon",
      icon: "🔥",
      title: "Firing soon",
      sub: "auto-fire within 24 hours",
      tone: "coral",
      items: buckets.firingSoon,
    },
    {
      key: "scheduledLater",
      icon: "⏰",
      title: "Scheduled later",
      sub: "auto-fire more than 24 hours out",
      tone: "emerald",
      items: buckets.scheduledLater,
    },
    {
      key: "stockpile",
      icon: "📝",
      title: "Stockpile",
      sub: "drafts — no auto-fire time set; manual Send only",
      tone: "navy",
      items: buckets.stockpile,
    },
  ];

  return (
    <div className="space-y-6">
      {sections
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <div key={s.key}>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3
                className={`font-display text-base font-bold flex items-center gap-2 ${
                  s.tone === "coral"
                    ? "text-coral-700"
                    : s.tone === "emerald"
                      ? "text-emerald-700"
                      : "text-navy-700"
                }`}
              >
                <span>{s.icon}</span>
                {s.title}
                <span className="text-[11px] font-mono font-normal text-navy-400">
                  ({s.items.length})
                </span>
              </h3>
              <p className="text-[11px] text-navy-400 italic">{s.sub}</p>
            </div>
            <div className="space-y-3">
              {s.items.map((p, i) => (
                <SocialPostCard
                  key={p.id}
                  post={p}
                  position={i + 1}
                  total={s.items.length}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string;
  tone?: "navy" | "emerald" | "coral";
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
    </div>
  );
}

