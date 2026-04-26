"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Missed {
  orderId: string;
  driverId: string;
  driverName: string;
  signupNumber: number;
  driverPayoutCents: number;
  deliveredAt: string;
  restaurantId: string;
  restaurantName: string;
}

/**
 * One-click backfill list. Each missed payout has a "Backfill →"
 * button that hits /api/wheelhouse/payouts with the right runner +
 * amount + memo ("Backfill — order [id]"). Successful backfill
 * removes the row from the list (router.refresh re-pulls the page).
 *
 * Per-row busy state so multiple backfills can fire in parallel
 * without UI confusion.
 */
export default function MissedPayoutsList({ missed }: { missed: Missed[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  function fmt(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function backfill(m: Missed) {
    setBusy((s) => new Set(s).add(m.orderId));
    setErrors((e) => {
      const next = new Map(e);
      next.delete(m.orderId);
      return next;
    });
    try {
      const res = await fetch("/api/wheelhouse/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: m.driverId,
          amountCents: m.driverPayoutCents,
          memo: `Backfill — order ${m.orderId} (${m.restaurantName})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) =>
          new Map(e).set(m.orderId, data.error ?? "Backfill failed."),
        );
      } else {
        // Server-render rerun — the row will be filtered out of the
        // missed list after recordDriverTransfer wrote a row.
        router.refresh();
      }
    } catch (err) {
      setErrors((e) =>
        new Map(e).set(
          m.orderId,
          err instanceof Error ? err.message : String(err),
        ),
      );
    } finally {
      setBusy((s) => {
        const next = new Set(s);
        next.delete(m.orderId);
        return next;
      });
    }
  }

  const totalMissedCents = missed.reduce(
    (s, m) => s + m.driverPayoutCents,
    0,
  );

  return (
    <div className="space-y-2.5">
      {missed.map((m) => {
        const isBusy = busy.has(m.orderId);
        const err = errors.get(m.orderId);
        return (
          <div
            key={m.orderId}
            className="bg-white rounded-lg border border-amber-200 p-3 sm:p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="font-display font-bold text-navy-900">
                    Driver #{m.signupNumber}
                  </span>
                  <span className="text-xs text-navy-500">
                    ({m.driverName})
                  </span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {fmt(m.driverPayoutCents)}
                  </span>
                </div>
                <p className="text-xs text-navy-600">
                  {m.restaurantName} · order{" "}
                  <span className="font-mono">{m.orderId}</span>
                </p>
                <p className="text-[11px] text-navy-500 font-mono mt-0.5">
                  Delivered {fmtDate(m.deliveredAt)}
                </p>
                {err && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mt-2">
                    {err}
                  </p>
                )}
              </div>
              <button
                onClick={() => backfill(m)}
                disabled={isBusy}
                className="px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 text-navy-900 disabled:opacity-50 whitespace-nowrap"
              >
                {isBusy ? "Sending…" : "Backfill →"}
              </button>
            </div>
          </div>
        );
      })}
      {missed.length > 1 && (
        <p className="text-xs text-amber-800 font-mono pt-2 text-right">
          Total missed: {fmt(totalMissedCents)} across {missed.length}{" "}
          {missed.length === 1 ? "order" : "orders"}
        </p>
      )}
    </div>
  );
}
