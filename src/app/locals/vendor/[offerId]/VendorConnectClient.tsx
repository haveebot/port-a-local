"use client";

import { useCallback, useEffect, useState } from "react";

interface Props {
  offerId: string;
  sig: string;
  initialStripeAccountId: string | null;
  initialPayoutsEnabled: boolean;
  justReturnedFromStripe: boolean;
}

export default function VendorConnectClient({
  offerId,
  sig,
  initialStripeAccountId,
  initialPayoutsEnabled,
  justReturnedFromStripe,
}: Props) {
  const [stripeAccountId, setStripeAccountId] = useState(
    initialStripeAccountId,
  );
  const [payoutsEnabled, setPayoutsEnabled] = useState(initialPayoutsEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/locals/vendor/connect/refresh?id=${encodeURIComponent(
          offerId,
        )}&s=${encodeURIComponent(sig)}`,
      );
      const data = await res.json();
      if (res.ok && data.payoutsEnabled !== undefined) {
        setPayoutsEnabled(!!data.payoutsEnabled);
        if (data.hasAccount === false) {
          setStripeAccountId(null);
        }
      }
    } catch (err) {
      console.error("[vendor connect refresh]", err);
    }
  }, [offerId, sig]);

  useEffect(() => {
    if (!justReturnedFromStripe) return;
    void refresh();
  }, [justReturnedFromStripe, refresh]);

  async function startOnboarding() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/locals/vendor/connect/start?id=${encodeURIComponent(
          offerId,
        )}&s=${encodeURIComponent(sig)}`,
        { method: "POST" },
      );
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

  async function openDashboard() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/locals/vendor/connect/dashboard?id=${encodeURIComponent(
          offerId,
        )}&s=${encodeURIComponent(sig)}`,
        { method: "POST" },
      );
      const data = await res.json();
      setBusy(false);
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't open Stripe dashboard.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (payoutsEnabled) {
    return (
      <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-6">
        <p className="font-display text-2xl font-bold text-emerald-300 mb-2">
          You&apos;re set ✓
        </p>
        <p className="text-sm text-emerald-200 font-light">
          Stripe is live. Every sale auto-deposits to your bank in 1–2
          business days.
        </p>
        {error && (
          <p className="text-xs text-red-200 mt-3">{error}</p>
        )}
        <button
          onClick={openDashboard}
          disabled={busy}
          className="mt-4 w-full py-3 rounded-xl text-sm font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 disabled:opacity-50"
        >
          {busy ? "Opening Stripe…" : "Open Stripe dashboard →"}
        </button>
        <p className="text-[11px] text-sand-400 font-light text-center mt-3">
          Bank info, payout schedule, instant payouts — all in Stripe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-navy-800 border border-navy-700 rounded-2xl p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
          Set up payouts
        </p>
        <p className="font-display text-lg font-bold mb-3">
          Get paid automatically on every sale.
        </p>
        <p className="text-sm text-sand-300 font-light">
          Stripe Express — same setup Etsy + Shopify sellers use. Takes
          ~5 minutes, one time. PAL triggers the transfer when a
          customer buys; it lands in your bank in 1–2 business days.
        </p>
        <p className="text-xs text-sand-400 font-light mt-3">
          You&apos;ll need: your address, last 4 of SSN, and bank
          account or debit card.
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
          : stripeAccountId
            ? "Continue Stripe setup →"
            : "Set up auto-payouts →"}
      </button>

      {!payoutsEnabled && stripeAccountId && (
        <p className="text-[11px] text-sand-400 font-light text-center">
          Started but not finished. Stripe saves progress — pick up
          where you left off.
        </p>
      )}

      <p className="text-[11px] text-sand-500 font-light text-center leading-relaxed">
        Skip and PAL will relay payouts manually until you set this up.
        Auto is way smoother for both of us.
      </p>
    </div>
  );
}
