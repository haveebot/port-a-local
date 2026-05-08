"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  postId: number;
}

const TOP_UP_OPTIONS: { label: string; cents: number }[] = [
  { label: "+$1", cents: 100 },
  { label: "+$2", cents: 200 },
  { label: "+$5", cents: 500 },
];

/**
 * Tiny inline +$X / +$Y / +$Z dropdown for an active boost row. One click
 * lifts the lifetime_budget on Meta's adset so the post keeps serving
 * past its original cap. Cheaper than spawning a new campaign + Meta's
 * learning carries forward.
 */
export default function TopUpBoostButton({ postId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topUp = async (cents: number) => {
    setPending(true);
    setError(null);
    setResult(null);
    setOpen(false);
    try {
      const res = await fetch("/api/wheelhouse/social/boost/top-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: postId, additionalCents: cents }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        previousCents?: number;
        newCents?: number;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      }
      const prev = ((data.previousCents ?? 0) / 100).toFixed(2);
      const next = ((data.newCents ?? 0) / 100).toFixed(2);
      setResult(`$${prev} → $${next}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "top-up failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={pending}
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
        title="Add budget to this active boost"
      >
        {pending ? "…" : "💰 Top up"}
      </button>
      {open && !pending && (
        <span className="absolute z-10 top-full mt-1 right-0 flex items-center gap-1 bg-white border border-emerald-300 rounded-lg p-1 shadow-md">
          {TOP_UP_OPTIONS.map((opt) => (
            <button
              key={opt.cents}
              type="button"
              onClick={() => topUp(opt.cents)}
              className="text-[11px] font-mono font-bold px-2 py-1 rounded text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] text-navy-400 hover:text-navy-700 px-1"
            title="Cancel"
          >
            ✕
          </button>
        </span>
      )}
      {result && (
        <span className="text-[10px] text-emerald-700 font-mono">
          ✓ {result}
        </span>
      )}
      {error && (
        <span className="text-[10px] text-coral-700 font-mono" title={error}>
          ⚠ failed
        </span>
      )}
    </span>
  );
}
