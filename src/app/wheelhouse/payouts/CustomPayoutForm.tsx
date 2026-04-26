"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DriverOption {
  id: string;
  name: string;
  payoutsEnabled: boolean;
  hasStripeAccount: boolean;
}

/**
 * Two-step custom-payout form:
 *   1. Pick runner + amount + optional memo
 *   2. Review screen ("send $X to Y?") before firing
 *
 * The review step is deliberate friction — these are real money transfers
 * that hit Stripe immediately, so a fat-finger six-figure tap should not
 * be one click away.
 */
export default function CustomPayoutForm({
  drivers,
  allActive,
}: {
  drivers: DriverOption[]; // payouts-eligible only
  allActive: DriverOption[]; // all active drivers (for "X of Y not eligible" messaging)
}) {
  const router = useRouter();
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [dollars, setDollars] = useState("");
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const driver = drivers.find((d) => d.id === driverId);
  const amountCents = Math.round(parseFloat(dollars || "0") * 100);
  const validAmount = amountCents >= 100 && amountCents <= 1_000_000;

  async function submit() {
    setBusy(true);
    setErr(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/wheelhouse/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          amountCents,
          memo: memo.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Transfer failed.");
      } else {
        setSuccess(
          `Sent $${(amountCents / 100).toFixed(2)} to ${driver?.name}. Stripe transfer ${data.transferId}.`,
        );
        setDollars("");
        setMemo("");
        setConfirming(false);
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (drivers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
        No runners have completed Stripe Connect onboarding yet.{" "}
        {allActive.length > 0 && (
          <span>
            ({allActive.length} active runner
            {allActive.length === 1 ? "" : "s"}, none payout-ready.)
          </span>
        )}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 space-y-4">
        <p className="font-bold text-amber-900">Confirm this transfer:</p>
        <div className="space-y-1.5 text-sm">
          <p>
            <span className="text-navy-500">To:</span>{" "}
            <strong>{driver?.name}</strong>
          </p>
          <p>
            <span className="text-navy-500">Amount:</span>{" "}
            <strong className="font-mono text-lg">
              ${(amountCents / 100).toFixed(2)}
            </strong>
          </p>
          {memo && (
            <p>
              <span className="text-navy-500">Memo:</span> {memo}
            </p>
          )}
        </div>
        <p className="text-xs text-navy-600 italic leading-relaxed">
          This fires a real Stripe Connect transfer. Funds move from PAL&apos;s
          Stripe balance into the runner&apos;s Connect account immediately.
          Their bank gets it on the next auto-payout cycle (daily after the
          initial Stripe hold clears).
        </p>
        {err && (
          <p className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2.5">
            {err}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 py-3 rounded-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Yes, send transfer"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="px-5 py-3 rounded-lg font-bold bg-sand-200 hover:bg-sand-300 text-navy-900 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-sm text-emerald-900">
          ✓ {success}
        </div>
      )}
      {err && !confirming && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-500 mb-1.5">
          Runner
        </label>
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="w-full px-4 py-3 border border-sand-300 rounded-lg bg-white"
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-500 mb-1.5">
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 font-mono">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="1"
            max="10000"
            inputMode="decimal"
            value={dollars}
            onChange={(e) => setDollars(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-sand-300 rounded-lg bg-white font-mono text-lg"
          />
        </div>
        <p className="text-xs text-navy-500 mt-1">Min $1.00 · Max $10,000.00</p>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-500 mb-1.5">
          Memo (optional)
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. April bonus, profit share, gas reimbursement"
          maxLength={140}
          className="w-full px-4 py-3 border border-sand-300 rounded-lg bg-white"
        />
        <p className="text-xs text-navy-500 mt-1">
          Stored as Stripe metadata for your records. Runner doesn&apos;t see this.
        </p>
      </div>

      <button
        onClick={() => {
          setErr(null);
          setSuccess(null);
          if (!driverId) {
            setErr("Pick a runner.");
            return;
          }
          if (!validAmount) {
            setErr("Enter an amount between $1 and $10,000.");
            return;
          }
          setConfirming(true);
        }}
        className="w-full py-3 rounded-lg font-bold bg-navy-900 hover:bg-navy-800 text-sand-50"
      >
        Review transfer →
      </button>
    </div>
  );
}
