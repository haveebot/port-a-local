"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ClaimData {
  stripe_session_id: string;
  claimed_by_slug: string | null;
  claimed_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  product: string | null;
  qty: number | null;
  setup_date: string | null;
  num_days: number | null;
  vendor_amount_cents: number | null;
  paid_out_at: string | null;
  transfer_id: string | null;
}

function fmtUsd(cents: number | null): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function setupCutoffDateStr(setupDate: string | null): string | null {
  if (!setupDate) return null;
  const setup = new Date(`${setupDate}T00:00:00-05:00`); // CT midnight
  const cutoff = new Date(setup.getTime() - 72 * 60 * 60 * 1000);
  return cutoff.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}

export default function ClaimRow({ claim }: { claim: ClaimData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const claimed = !!claim.claimed_at;
  const paid = !!claim.paid_out_at;
  const cutoff = setupCutoffDateStr(claim.setup_date);
  const cutoffPassed =
    claim.setup_date &&
    new Date(`${claim.setup_date}T00:00:00-05:00`).getTime() -
      72 * 60 * 60 * 1000 <
      Date.now();

  async function payNow() {
    if (!confirm(`Force payout for ${claim.customer_name ?? "this claim"} (${fmtUsd(claim.vendor_amount_cents)} to ${claim.claimed_by_slug})?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/wheelhouse/beach-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual-payout",
          sessionId: claim.stripe_session_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.result?.error ?? data.result?.skipReason ?? data.error ?? "payout_failed");
        setBusy(false);
        return;
      }
      setInfo(`Paid: ${data.result.transferId}`);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-semibold text-navy-900">
              {claim.customer_name ?? "Customer"}
            </p>
            {paid ? (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Paid out
              </span>
            ) : claimed ? (
              cutoffPassed ? (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Past cutoff · awaiting payout
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-sand-200 text-navy-700">
                  Claimed · refundable
                </span>
              )
            ) : (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-coral-100 text-coral-700 border border-coral-300">
                Unclaimed
              </span>
            )}
          </div>
          <p className="text-xs text-navy-600 mt-0.5">
            {claim.qty}× {claim.product} · {claim.num_days} day
            {claim.num_days === 1 ? "" : "s"} · setup{" "}
            <strong>{claim.setup_date}</strong>
          </p>
          <p className="text-[11px] text-navy-500 mt-1">
            Vendor: <strong>{claim.claimed_by_slug ?? "—"}</strong> · Owed:{" "}
            <strong>{fmtUsd(claim.vendor_amount_cents)}</strong>
            {cutoff && !paid && ` · Refund cutoff: ${cutoff} CT`}
          </p>
          {claim.paid_out_at && (
            <p className="text-[10px] text-emerald-700 font-mono mt-1">
              Paid: {fmtDate(claim.paid_out_at)} · {claim.transfer_id}
            </p>
          )}
        </div>
        {!paid && claimed && (
          <button
            onClick={payNow}
            disabled={busy || pending}
            className="px-3 py-1.5 text-xs font-bold rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50 shrink-0"
          >
            {busy ? "Paying…" : "Pay now"}
          </button>
        )}
      </div>
      {info && <p className="text-[11px] text-emerald-700 mt-1">{info}</p>}
      {error && <p className="text-[11px] text-coral-600 mt-1">Error: {error}</p>}
    </div>
  );
}
