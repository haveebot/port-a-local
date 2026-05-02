"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Manual "Sync now" button for the Currently-boosting section. Triggers
 * the same sync the cron does on its hourly tick, then refreshes the
 * server component so the new numbers paint immediately. Useful when
 * iterating on a fresh boost and you want the feedback loop tighter than
 * the next :30 cron tick.
 */
export default function SyncBoostsButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/wheelhouse/social/boost/sync", {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        reason?: string;
        processed?: number;
        completed?: number;
        synced?: number;
        errors?: number;
      };
      if (!res.ok || !data.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (data.skipped) {
        setResult(`skipped — ${data.reason ?? "not configured"}`);
      } else {
        const parts: string[] = [];
        if (data.synced) parts.push(`${data.synced} synced`);
        if (data.completed) parts.push(`${data.completed} completed`);
        if (data.errors) parts.push(`${data.errors} errors`);
        setResult(parts.length ? parts.join(" · ") : "no active boosts");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "sync failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={sync}
        disabled={pending}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? "Syncing…" : "🔄 Sync now"}
      </button>
      {result && (
        <span className="text-[11px] text-emerald-700 font-mono">
          ✓ {result}
        </span>
      )}
      {error && (
        <span className="text-[11px] text-coral-700 font-mono">⚠ {error}</span>
      )}
    </div>
  );
}
