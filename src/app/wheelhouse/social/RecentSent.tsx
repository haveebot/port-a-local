"use client";

import { useEffect, useState, useMemo } from "react";
import type { SocialPost } from "@/data/social-post-store";
import ResendButton from "./ResendButton";

interface PostTraffic {
  id: number;
  fbClicks: number;
  fbUniqueSessions: number;
  totalClicks: number;
  totalUniqueSessions: number;
  baselineDailyAvg: number | null;
}

interface PostTrafficDetail extends PostTraffic {
  hourlyFbClicks: { hour: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  path: string | null;
  externalPostUrl: string | null;
}

interface Props {
  recent: SocialPost[];
}

type SortMode = "newest" | "performance";

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

function formatHour(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + ":00Z");
  const hr = d.getHours();
  return `${hr}:00`;
}

function shortReferrer(ref: string): string {
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return ref.slice(0, 30);
  }
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

function TrafficBadge({
  traffic,
  loading,
}: {
  traffic: PostTraffic | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <span className="text-[11px] text-navy-400 font-mono whitespace-nowrap shrink-0">
        📊 …
      </span>
    );
  }
  if (!traffic) {
    return null;
  }
  const fb = traffic.fbClicks;
  const total = traffic.totalClicks;
  const baseline = traffic.baselineDailyAvg ?? 0;
  // Bumped above baseline = green; same as baseline = neutral; missing data = gray
  const tone =
    total === 0
      ? "text-navy-300"
      : total > Math.max(2, baseline * 2)
        ? "text-emerald-700"
        : "text-navy-600";
  return (
    <span
      className={`text-[11px] font-mono whitespace-nowrap shrink-0 ${tone}`}
      title={`${fb} from FB / ${total} total clicks · baseline ${baseline}/day pre-post`}
    >
      📊 {fb}fb · {total}all
    </span>
  );
}

function DetailPanel({
  detail,
  onClose,
}: {
  detail: PostTrafficDetail;
  onClose: () => void;
}) {
  const maxHourly = Math.max(1, ...detail.hourlyFbClicks.map((h) => h.count));
  const totalHourlyFb = detail.hourlyFbClicks.reduce(
    (sum, h) => sum + h.count,
    0,
  );
  return (
    <div className="mt-2 mb-3 rounded-lg bg-sand-50 border border-sand-300 p-4 space-y-4">
      {/* Top metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-white rounded-md border border-sand-200 p-2">
          <p className="font-display text-2xl font-bold text-navy-900 tabular-nums">
            {detail.fbClicks}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-navy-500 mt-0.5">
            FB clicks
          </p>
        </div>
        <div className="bg-white rounded-md border border-sand-200 p-2">
          <p className="font-display text-2xl font-bold text-navy-900 tabular-nums">
            {detail.fbUniqueSessions}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-navy-500 mt-0.5">
            FB unique
          </p>
        </div>
        <div className="bg-white rounded-md border border-sand-200 p-2">
          <p className="font-display text-2xl font-bold text-navy-900 tabular-nums">
            {detail.totalClicks}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-navy-500 mt-0.5">
            All clicks
          </p>
        </div>
        <div className="bg-white rounded-md border border-sand-200 p-2">
          <p className="font-display text-2xl font-bold text-navy-900 tabular-nums">
            {detail.baselineDailyAvg ?? "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-navy-500 mt-0.5">
            Baseline /day
          </p>
        </div>
      </div>

      {/* Hourly bar chart for first 24h FB clicks */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-navy-700 mb-2">
          First 24h · FB clicks per hour ({totalHourlyFb} total)
        </p>
        {detail.hourlyFbClicks.length === 0 ? (
          <p className="text-[11px] text-navy-400 italic">
            No FB-referred clicks in first 24h.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-20 bg-white border border-sand-200 rounded-md p-2">
            {detail.hourlyFbClicks.map((h) => (
              <div
                key={h.hour}
                className="flex-1 flex flex-col items-center justify-end min-w-0"
                title={`${h.hour}: ${h.count} clicks`}
              >
                <div
                  className="w-full bg-coral-500 rounded-t-sm"
                  style={{ height: `${(h.count / maxHourly) * 100}%` }}
                />
                <span className="text-[9px] text-navy-400 font-mono mt-0.5 truncate w-full text-center">
                  {formatHour(h.hour)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top referrers */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-navy-700 mb-2">
          Top referrers · 7 days
        </p>
        {detail.topReferrers.length === 0 ? (
          <p className="text-[11px] text-navy-400 italic">
            No referrer data — most visitors arrived directly.
          </p>
        ) : (
          <div className="space-y-1">
            {detail.topReferrers.slice(0, 6).map((r) => (
              <div
                key={r.referrer}
                className="flex items-center gap-2 text-[11px]"
              >
                <span className="text-navy-700 font-mono truncate min-w-0 flex-1">
                  {shortReferrer(r.referrer)}
                </span>
                <span className="text-navy-500 font-mono tabular-nums shrink-0">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with FB link + close */}
      <div className="flex items-center justify-between pt-2 border-t border-sand-200 text-[11px]">
        {detail.externalPostUrl ? (
          <a
            href={detail.externalPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral-700 hover:text-coral-900 font-semibold"
          >
            View on FB ↗
          </a>
        ) : (
          <span />
        )}
        <button
          onClick={onClose}
          className="text-navy-500 hover:text-navy-700 font-semibold"
        >
          ✕ close
        </button>
      </div>
    </div>
  );
}

export default function RecentSent({ recent }: Props) {
  const [trafficMap, setTrafficMap] = useState<Map<number, PostTraffic>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [openDetailId, setOpenDetailId] = useState<number | null>(null);
  const [detailMap, setDetailMap] = useState<Map<number, PostTrafficDetail>>(
    new Map(),
  );
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadTraffic() {
    setError(null);
    try {
      const res = await fetch("/api/wheelhouse/social/post-traffic", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { posts: PostTraffic[] };
      const m = new Map<number, PostTraffic>();
      for (const p of data.posts) m.set(p.id, p);
      setTrafficMap(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTraffic();
  }, []);

  async function onToggleDetail(id: number) {
    if (openDetailId === id) {
      setOpenDetailId(null);
      return;
    }
    setOpenDetailId(id);
    if (detailMap.has(id)) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/wheelhouse/social/post-traffic?id=${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const detail = (await res.json()) as PostTrafficDetail;
      setDetailMap((prev) => new Map(prev).set(id, detail));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDetailLoading(false);
    }
  }

  const sorted = useMemo(() => {
    if (sortMode === "newest") return recent;
    return [...recent].sort((a, b) => {
      const ta = trafficMap.get(a.id)?.fbClicks ?? -1;
      const tb = trafficMap.get(b.id)?.fbClicks ?? -1;
      return tb - ta;
    });
  }, [recent, sortMode, trafficMap]);

  return (
    <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <h2 className="font-display text-xl font-bold">Recently sent</h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-sand-300 overflow-hidden text-[11px] font-semibold">
            <button
              onClick={() => setSortMode("newest")}
              className={`px-2 py-1 ${
                sortMode === "newest"
                  ? "bg-navy-900 text-sand-50"
                  : "text-navy-700 hover:bg-sand-50"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortMode("performance")}
              className={`px-2 py-1 ${
                sortMode === "performance"
                  ? "bg-navy-900 text-sand-50"
                  : "text-navy-700 hover:bg-sand-50"
              }`}
            >
              Top performers
            </button>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              setDetailMap(new Map());
              loadTraffic();
            }}
            disabled={refreshing || loading}
            className="text-[11px] text-navy-500 hover:text-coral-700 font-mono disabled:opacity-50"
            title="Reload traffic data"
          >
            {refreshing ? "↻ …" : "↻ refresh"}
          </button>
        </div>
      </div>
      <p className="text-xs text-navy-500 mb-4">
        Last 30 — what shipped, what was skipped. Click 📊 on any sent post to
        see its hourly click pattern + referrers. Meta won&apos;t tell us
        impressions; click-throughs are what we measure.
      </p>

      {error && (
        <div className="text-xs text-coral-700 bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {recent.length === 0 ? (
        <p className="text-sm text-navy-500 italic">No posts yet.</p>
      ) : (
        <div className="divide-y divide-sand-200">
          {sorted.map((p) => {
            const isOpen = openDetailId === p.id;
            const traffic = trafficMap.get(p.id) ?? null;
            const detail = detailMap.get(p.id) ?? null;
            const canShowTraffic = p.status === "sent";
            return (
              <div key={p.id} className="py-3">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <StatusPill status={p.status} />
                  <span className="text-xs text-navy-500 font-mono w-12 shrink-0">
                    {p.channel === "facebook"
                      ? "FB"
                      : p.channel === "instagram"
                        ? "IG"
                        : "X"}
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
                  {canShowTraffic && (
                    <button
                      onClick={() => onToggleDetail(p.id)}
                      className="hover:bg-sand-100 rounded px-1.5 py-0.5"
                      aria-label="Show traffic detail"
                    >
                      <TrafficBadge traffic={traffic} loading={loading} />
                    </button>
                  )}
                  {p.status !== "pending" && <ResendButton postId={p.id} />}
                </div>
                {isOpen && (
                  <>
                    {detailLoading && !detail ? (
                      <p className="mt-2 text-[11px] text-navy-400 italic">
                        Loading detail…
                      </p>
                    ) : detail ? (
                      <DetailPanel
                        detail={detail}
                        onClose={() => setOpenDetailId(null)}
                      />
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
