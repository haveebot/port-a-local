"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to an ISO event start. Renders the largest non-zero
 * unit at hero scale, with finer units below. Self-updates every second.
 */
export default function EventCountdown({
  startISO,
  endISO,
}: {
  startISO: string;
  endISO?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startMs = new Date(startISO).getTime();
  const endMs = endISO ? new Date(endISO).getTime() : startMs + 86_400_000;

  // Skeleton on first render (server) — avoids hydration mismatch
  if (now === null) {
    return (
      <div className="rounded-2xl border border-coral-500/30 bg-coral-500/10 px-6 py-5 inline-flex items-baseline gap-3 text-sand-50">
        <span className="font-display font-bold text-4xl tabular-nums">—</span>
        <span className="text-coral-300/80 text-sm uppercase tracking-widest">
          Loading…
        </span>
      </div>
    );
  }

  // Mid-event
  if (now >= startMs && now < endMs) {
    return (
      <div className="rounded-2xl border-2 border-coral-400 bg-coral-500/15 px-6 py-5 inline-flex items-center gap-4 text-sand-50">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-coral-400" />
        </span>
        <span className="font-display font-bold text-2xl sm:text-3xl">
          Happening now
        </span>
        <span className="text-coral-200 text-sm uppercase tracking-widest hidden sm:inline">
          Live coverage below
        </span>
      </div>
    );
  }

  // After end
  if (now >= endMs) {
    return (
      <div className="rounded-2xl border border-navy-400/30 bg-navy-700/40 px-6 py-5 inline-flex items-baseline gap-3 text-sand-100">
        <span className="font-display font-bold text-2xl">Wrapped</span>
        <span className="text-navy-200 text-sm uppercase tracking-widest">
          Recap below
        </span>
      </div>
    );
  }

  // Pre-event
  const diffMs = startMs - now;
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  // Format: 2 digits for h/m/s
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-coral-500/30 bg-coral-500/10 backdrop-blur-sm px-6 py-5 inline-flex items-end gap-5 text-sand-50">
      <div className="flex flex-col items-start">
        <span className="text-coral-300/80 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
          Festival starts in
        </span>
        <span className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tabular-nums leading-none mt-1">
          {days}{" "}
          <span className="text-coral-300/90 font-display font-light text-2xl sm:text-3xl lg:text-4xl">
            day{days === 1 ? "" : "s"}
          </span>
        </span>
      </div>
      <div className="flex items-baseline gap-2 text-sand-200 tabular-nums pb-1">
        <span className="text-lg sm:text-xl font-semibold">{pad(hours)}</span>
        <span className="text-[10px] uppercase tracking-widest text-navy-300">
          hr
        </span>
        <span className="text-lg sm:text-xl font-semibold ml-2">
          {pad(minutes)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-navy-300">
          min
        </span>
        <span className="text-lg sm:text-xl font-semibold ml-2 hidden sm:inline">
          {pad(seconds)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-navy-300 hidden sm:inline">
          sec
        </span>
      </div>
    </div>
  );
}
