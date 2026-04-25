"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  THREAD_STATE_META,
  type ThreadState,
} from "@/data/wheelhouse-types";

const TRANSITION_ORDER: ThreadState[] = [
  "open",
  "awaiting:winston",
  "awaiting:collie",
  "awaiting:nick",
  "awaiting:winston-claude",
  "awaiting:collie-claude",
  "awaiting:nick-claude",
  "blocked",
  "done",
  "archived",
];

export default function StateTransitions({
  threadId,
  current,
}: {
  threadId: string;
  current: ThreadState;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ThreadState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transition = async (newState: ThreadState) => {
    if (newState === current) return;
    setPending(newState);
    setError(null);
    try {
      const res = await fetch(`/api/wheelhouse/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Transition failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
      <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-2">
        Move to
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TRANSITION_ORDER.map((s) => {
          const meta = THREAD_STATE_META[s];
          const isCurrent = s === current;
          return (
            <button
              key={s}
              onClick={() => transition(s)}
              disabled={isCurrent || pending === s}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide transition-colors ${
                isCurrent
                  ? "bg-navy-900 text-sand-50 cursor-default"
                  : "bg-white border border-sand-300 text-navy-600 hover:border-coral-400 hover:text-coral-600 disabled:opacity-50"
              }`}
            >
              {pending === s ? "…" : meta.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-coral-600 font-medium mt-2">{error}</p>
      )}
    </div>
  );
}
