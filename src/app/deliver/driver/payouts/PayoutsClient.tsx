"use client";

import { useEffect, useState } from "react";
import type { DriverStatus } from "@/data/delivery-store";

export default function PayoutsClient({
  initialStatus,
  justReturnedFromStripe,
}: {
  initialStatus: DriverStatus;
  justReturnedFromStripe: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we just bounced back from Stripe, refresh account state
  useEffect(() => {
    if (!justReturnedFromStripe) return;
    void refresh();
  }, [justReturnedFromStripe]);

  async function refresh() {
    try {
      const res = await fetch("/api/deliver/driver/connect/refresh", {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok && data.payoutsEnabled !== undefined) {
        setStatus((s) => ({
          ...s,
          stripeAccountId: data.hasAccount ? s.stripeAccountId : null,
          payoutsEnabled: data.payoutsEnabled,
        }));
      }
    } catch (err) {
      console.error("[payouts refresh]", err);
    }
  }

  async function startOnboarding() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/deliver/driver/connect/start", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start onboarding.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  if (status.payoutsEnabled) {
    return (
      <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-6 text-center">
        <p className="font-display text-2xl font-bold text-emerald-300 mb-2">
          You&apos;re set ✓
        </p>
        <p className="text-sm text-emerald-200">
          Payouts hit your bank automatically after each delivery you
          complete. No more chasing Venmos.
        </p>
        <p className="text-[11px] text-sand-400 font-light mt-4">
          Need to update your bank? Tap below to re-open the Stripe form.
        </p>
        <button
          onClick={startOnboarding}
          disabled={busy}
          className="mt-3 text-sm text-emerald-300 underline decoration-emerald-500/50 disabled:opacity-50"
        >
          {busy ? "Opening Stripe…" : "Update payout details →"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-navy-800 border border-navy-700 rounded-2xl p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
          Set up payouts
        </p>
        <p className="font-display text-lg font-bold mb-3">
          Get paid automatically after every delivery.
        </p>
        <p className="text-sm text-sand-300 font-light">
          Stripe Express — same setup DoorDash, Uber Eats, and Lyft drivers
          use. Takes ~5 minutes, one time. We trigger the transfer when you
          mark a delivery done; it lands in your bank in 1–2 business days
          (or instantly for $0.50).
        </p>
        <p className="text-xs text-sand-400 font-light mt-3">
          You&apos;ll need: your address, last 4 of SSN, and bank account or
          debit card.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={startOnboarding}
        disabled={busy}
        className="w-full py-5 rounded-2xl text-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
      >
        {busy
          ? "Opening Stripe…"
          : status.stripeAccountId
            ? "Continue Stripe setup →"
            : "Set up auto-payouts →"}
      </button>

      {!status.payoutsEnabled && status.stripeAccountId && (
        <p className="text-[11px] text-sand-400 font-light text-center">
          Started but not finished. Stripe saves progress — pick up where
          you left off.
        </p>
      )}
    </div>
  );
}
