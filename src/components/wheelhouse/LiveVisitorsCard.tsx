"use client";

import { useEffect, useState } from "react";

interface VisitorInfo {
  count: number;
  paths: Array<{ path: string; n: number }>;
}

const POLL_INTERVAL_MS = 15 * 1000;

export default function LiveVisitorsCard() {
  const [info, setInfo] = useState<VisitorInfo | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const res = await fetch("/api/wheelhouse/active-visitors", {
          cache: "no-store",
        });
        if (!res.ok) {
          setStale(true);
          return;
        }
        const data = (await res.json()) as VisitorInfo;
        if (!cancelled) {
          setInfo(data);
          setStale(false);
        }
      } catch {
        if (!cancelled) setStale(true);
      }
    }

    load();
    timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  const count = info?.count ?? 0;
  const tone =
    count === 0
      ? "bg-sand-100 text-navy-500"
      : count < 3
        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
        : "bg-emerald-100 text-emerald-900 border border-emerald-300";

  return (
    <div className={`rounded-xl px-4 py-3 mb-4 ${tone} ${stale ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            {count > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${count > 0 ? "bg-emerald-600" : "bg-navy-300"}`}
            ></span>
          </span>
          <p className="text-sm">
            <strong className="font-display text-base">{count}</strong>{" "}
            visitor{count === 1 ? "" : "s"} on the site right now
            {stale && <span className="text-[11px] ml-2 italic">(refreshing…)</span>}
          </p>
        </div>
        {info && info.paths.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-navy-700">
            {info.paths.slice(0, 4).map((p) => (
              <span key={p.path} className="px-2 py-0.5 bg-white/60 rounded-full font-mono">
                {p.path} <span className="text-navy-500">×{p.n}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
