"use client";

import { useEffect, useState } from "react";

/**
 * First-look priority window panel — wheelhouse operator surface (H).
 * Shows pending + recently resolved first-look windows so the operator
 * can see at a glance whether Bron's (or any priority vendor) has acted
 * on a fresh lead, and how much window time is left.
 *
 * Updates every 10 seconds via setInterval to keep the countdown live.
 */

interface ActivityRow {
  id: number;
  leadId: string;
  vendorSlug: string;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "passed" | "expired";
  acceptedViaPhone: string | null;
  leadMetadata: {
    cartLabel: string;
    pickupShort: string;
    returnShort: string;
    numDays: number;
    customerName: string;
  };
  resolvedAt: string | null;
}

const STATUS_PILL: Record<ActivityRow["status"], { label: string; cls: string }> = {
  pending: {
    label: "⏱ Pending",
    cls: "bg-amber-100 text-amber-800 border-amber-300",
  },
  accepted: {
    label: "✅ Accepted",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  passed: {
    label: "↪ Passed",
    cls: "bg-sand-200 text-navy-700 border-sand-300",
  },
  expired: {
    label: "⌛ Timed out",
    cls: "bg-coral-100 text-coral-700 border-coral-300",
  },
};

function fmtCountdown(expiresAtIso: string, nowMs: number): string {
  const expiresMs = new Date(expiresAtIso).getTime();
  const remainingMs = expiresMs - nowMs;
  if (remainingMs <= 0) return "expiring…";
  const totalSec = Math.floor(remainingMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")} left`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function vendorNameFromSlug(slug: string): string {
  // Light formatting — drop the vendor lookup dependency from the
  // client component. `brons-beach-carts` → "Bron's Beach Carts".
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
    .replace(/^Brons\b/, "Bron's");
}

export default function FirstLookPanel({
  activity,
}: {
  activity: ActivityRow[];
}) {
  // Live clock — re-render every 10s so countdown stays current
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  if (activity.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold mb-2">
          First-look priority windows
        </h2>
        <p className="text-sm text-navy-500">
          No first-look activity yet. When a customer reserves a cart and a
          priority vendor is set (e.g. Bron&apos;s 30-min window), it&apos;ll
          show up here with a live countdown.
        </p>
      </section>
    );
  }

  const pending = activity.filter((a) => a.status === "pending");
  const recent = activity.filter((a) => a.status !== "pending").slice(0, 8);

  return (
    <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="font-display text-xl font-bold">
          First-look priority windows
        </h2>
        {pending.length > 0 && (
          <span className="text-[11px] uppercase tracking-widest px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            ⏱ {pending.length} live
          </span>
        )}
      </div>

      {pending.length > 0 && (
        <div className="space-y-2 mb-4">
          {pending.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-navy-900">
                    {vendorNameFromSlug(a.vendorSlug)}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_PILL[a.status].cls}`}
                  >
                    {STATUS_PILL[a.status].label}
                  </span>
                </div>
                <p className="text-xs text-navy-600 mt-1 truncate">
                  {a.leadMetadata.cartLabel} · {a.leadMetadata.pickupShort} to{" "}
                  {a.leadMetadata.returnShort} · {a.leadMetadata.customerName}
                </p>
                <p className="text-[11px] text-navy-400 mt-1">
                  Started {fmtTime(a.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-lg font-bold text-amber-700">
                  {fmtCountdown(a.expiresAt, now)}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-amber-600">
                  to expiry
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h3 className="text-[11px] uppercase tracking-widest text-navy-500 font-semibold mb-2 mt-2">
            Recent activity
          </h3>
          <ul className="divide-y divide-sand-200 text-xs">
            {recent.map((a) => (
              <li key={a.id} className="py-2 flex items-baseline gap-3 flex-wrap">
                <span className="font-bold text-navy-800">
                  {vendorNameFromSlug(a.vendorSlug)}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_PILL[a.status].cls}`}
                >
                  {STATUS_PILL[a.status].label}
                </span>
                <span className="text-navy-500 truncate">
                  {a.leadMetadata.cartLabel} ·{" "}
                  {a.leadMetadata.pickupShort}
                </span>
                {a.acceptedViaPhone && (
                  <span className="text-[10px] text-navy-400 font-mono">
                    via {a.acceptedViaPhone}
                  </span>
                )}
                <span className="text-[10px] text-navy-400 ml-auto">
                  {a.resolvedAt ? fmtTime(a.resolvedAt) : fmtTime(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
