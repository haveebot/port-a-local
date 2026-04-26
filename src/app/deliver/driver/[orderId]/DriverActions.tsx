"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/data/delivery-types";

export default function DriverActions({
  orderId,
  status,
  driverIdInOrder,
  thisDriverId,
}: {
  orderId: string;
  status: OrderStatus;
  driverIdInOrder: string | null;
  thisDriverId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isMine = driverIdInOrder === thisDriverId;

  async function call(
    path: "claim" | "status",
    body?: Record<string, unknown>,
  ) {
    setBusy(true);
    setErr(null);
    try {
      const url = `/api/deliver/order/${orderId}/${path}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? data.reason ?? "Action failed.");
      } else {
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (status === "delivered") {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-5 text-center">
          <p className="font-display text-xl font-bold text-emerald-300">
            Delivered ✓
          </p>
          <p className="text-xs text-sand-400 mt-1">
            Payout hits your bank in 1-2 business days. Stripe handles it
            automatically.
          </p>
        </div>
        <a
          href="/deliver/driver"
          className="block w-full py-4 rounded-xl text-base font-bold text-center bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-50"
        >
          ← Back to runner home
        </a>
      </div>
    );
  }

  if (status === "canceled" || status === "refunded") {
    return (
      <div className="space-y-3">
        <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-5 text-center">
          <p className="font-display text-xl font-bold text-red-300">
            {status === "canceled" ? "Canceled" : "Refunded"}
          </p>
        </div>
        <a
          href="/deliver/driver"
          className="block w-full py-4 rounded-xl text-base font-bold text-center bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-50"
        >
          ← Back to runner home
        </a>
      </div>
    );
  }

  // Order still in flight
  if (status === "dispatching") {
    return (
      <>
        {err && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <button
          onClick={() => call("claim")}
          disabled={busy}
          className="w-full py-5 rounded-xl text-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:bg-coral-500/50"
        >
          {busy ? "Claiming…" : "Claim this delivery"}
        </button>
        <p className="text-[11px] text-sand-400 text-center font-light">
          First driver to tap wins. If someone else got it first, you&apos;ll
          see it here.
        </p>
      </>
    );
  }

  if (!isMine) {
    return (
      <div className="space-y-3">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-5 text-center">
          <p className="font-display text-base font-bold">
            Already claimed by another runner
          </p>
          <p className="text-xs text-sand-400 mt-1">
            Status: <span className="font-mono">{status}</span>
          </p>
        </div>
        <a
          href="/deliver/driver"
          className="block w-full py-4 rounded-xl text-base font-bold text-center bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-50"
        >
          ← Back to runner home
        </a>
      </div>
    );
  }

  if (status === "claimed") {
    return (
      <>
        {err && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <button
          onClick={() => call("status", { status: "picked_up" })}
          disabled={busy}
          className="w-full py-5 rounded-xl text-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:bg-coral-500/50"
        >
          {busy ? "Updating…" : "Picked up"}
        </button>
      </>
    );
  }

  if (status === "picked_up") {
    return (
      <>
        {err && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <button
          onClick={() => call("status", { status: "delivered" })}
          disabled={busy}
          className="w-full py-5 rounded-xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-600/50"
        >
          {busy ? "Updating…" : "Delivered"}
        </button>
      </>
    );
  }

  return null;
}
