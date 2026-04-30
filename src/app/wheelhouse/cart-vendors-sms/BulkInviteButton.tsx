"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BulkInviteButton({
  eligibleCount,
}: {
  eligibleCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fire() {
    if (
      !confirm(
        `Send opt-in SMS to ${eligibleCount} eligible cart vendors? Sequential pacing ~${Math.ceil(eligibleCount * 0.8)}s total. Idempotent — safe to re-run.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/wheelhouse/cart-vendor-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", slug: "all-active" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "request_failed");
      } else {
        setResult(
          `Sent ${data.sent} of ${data.total}${data.failed ? ` (${data.failed} failed)` : ""}.`,
        );
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={fire}
        disabled={busy || pending || eligibleCount === 0}
        className="px-4 py-2 text-sm font-bold rounded-lg bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy
          ? `Sending… (~${Math.ceil(eligibleCount * 0.8)}s)`
          : `Send invite to all ${eligibleCount} eligible vendors`}
      </button>
      {result && (
        <p className="text-[11px] text-emerald-700 font-mono">{result}</p>
      )}
      {error && <p className="text-[11px] text-coral-600">Error: {error}</p>}
    </div>
  );
}
