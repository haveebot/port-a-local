"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DriverStatus } from "@/data/delivery-store";

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function relativeFuture(iso: string): string {
  const mins = Math.floor((new Date(iso).getTime() - Date.now()) / 60_000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export default function OnlineToggle({
  initialStatus,
}: {
  initialStatus: DriverStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const path = status.isOnline ? "offline" : "online";
      const res = await fetch(`/api/deliver/driver/${path}`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Toggle failed.");
      } else {
        setStatus(data.status);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const isOnline = status.isOnline;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
          Status
        </p>
        <p className="font-display text-4xl font-bold">
          {isOnline ? (
            <span className="text-emerald-400">ON DUTY</span>
          ) : (
            <span className="text-sand-300">Off duty</span>
          )}
        </p>
        {isOnline && status.onlineUntil && (
          <p className="text-xs text-sand-400 font-light mt-2">
            Auto-off in {relativeFuture(status.onlineUntil)} unless you toggle
            sooner
          </p>
        )}
        {!isOnline && status.lastOfflineAt && (
          <p className="text-xs text-sand-500 font-light mt-2">
            Last off-duty {relativeTime(status.lastOfflineAt)}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={toggle}
        disabled={busy}
        className={
          isOnline
            ? "w-full py-6 rounded-2xl text-xl font-bold bg-sand-700 hover:bg-sand-800 text-sand-50 disabled:opacity-50"
            : "w-full py-6 rounded-2xl text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
        }
      >
        {busy
          ? "Updating…"
          : isOnline
            ? "Go off duty"
            : "I'm here — go on duty"}
      </button>
    </div>
  );
}
