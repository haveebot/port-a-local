import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getPending,
  getRecent,
  getStats,
} from "@/data/social-post-store";
import { isMetaConfigured } from "@/lib/metaGraph";
import SocialPostCard from "./SocialPostCard";
import ResendButton from "./ResendButton";

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

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) {
    const future = -ms;
    const min = Math.round(future / 60_000);
    if (min < 60) return `in ${min}m`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `in ${hr}h`;
    return `in ${Math.round(hr / 24)}d`;
  }
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

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
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">
            Social review queue
          </p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            FB · IG
          </span>
        </div>
      </header>

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

        {/* PENDING REVIEW */}
        <section className="bg-white rounded-2xl border border-coral-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">
            Pending review
          </h2>
          <p className="text-xs text-navy-500 mb-4">
            Auto-triggered drafts. Edit caption if needed → Send / Skip.
          </p>
          {pending.length === 0 ? (
            <p className="text-sm text-navy-500 italic">
              No posts pending. Triggers will populate this queue
              automatically.
            </p>
          ) : (
            <div className="space-y-3">
              {pending.map((p, i) => (
                <SocialPostCard
                  key={p.id}
                  post={p}
                  position={i + 1}
                  total={pending.length}
                />
              ))}
            </div>
          )}
        </section>

        {/* RECENT HISTORY */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-1">Recent</h2>
          <p className="text-xs text-navy-500 mb-4">
            Last 30 across all statuses.
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-navy-500 italic">No posts yet.</p>
          ) : (
            <div className="divide-y divide-sand-200">
              {recent.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center gap-3 text-sm"
                >
                  <StatusPill status={p.status} />
                  <span className="text-xs text-navy-500 font-mono w-12 shrink-0">
                    {p.channel === "facebook" ? "FB" : p.channel === "instagram" ? "IG" : "X"}
                  </span>
                  <span className="text-[11px] text-navy-400 font-mono shrink-0">
                    #{p.id}
                  </span>
                  <span className="text-navy-800 truncate min-w-0 flex-1">
                    {p.caption.slice(0, 90)}
                    {p.caption.length > 90 ? "…" : ""}
                  </span>
                  <span className="text-xs text-navy-500 whitespace-nowrap shrink-0">
                    {p.sentAt
                      ? `sent ${relativeTime(p.sentAt)}`
                      : relativeTime(p.createdAt)}
                  </span>
                  {p.status !== "pending" && <ResendButton postId={p.id} />}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Per Winston: review queue first, auto-fire flips on after 30 days
          of clean output. Brand voice is the surface we cannot vibe-code.
        </p>
      </div>
    </main>
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

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "pending"
      ? "bg-coral-50 text-coral-700 border-coral-200"
      : status === "sent"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "skipped"
          ? "bg-navy-100 text-navy-500 border-navy-200"
          : "bg-coral-100 text-coral-800 border-coral-300";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${cls} shrink-0`}
    >
      {status}
    </span>
  );
}
