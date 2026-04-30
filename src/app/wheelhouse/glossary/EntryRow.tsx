"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GlossaryEntry, MarketingStatus } from "@/data/glossary-store";

const STATUS_PILL: Record<MarketingStatus, { label: string; cls: string }> = {
  active: {
    label: "Active",
    cls: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  },
  queued: {
    label: "Queued",
    cls: "bg-amber-100 text-amber-800 border border-amber-300",
  },
  parked: {
    label: "Parked",
    cls: "bg-sand-200 text-navy-700",
  },
  "do-not-surface": {
    label: "Internal",
    cls: "bg-navy-100 text-navy-600",
  },
};

const STATUS_OPTIONS: MarketingStatus[] = [
  "active",
  "queued",
  "parked",
  "do-not-surface",
];

export default function EntryRow({
  entry,
  isFirst,
  isLast,
}: {
  entry: GlossaryEntry;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState(entry.collaboratorNotes ?? "");
  const [status, setStatus] = useState<MarketingStatus>(entry.marketingStatus);
  const [error, setError] = useState<string | null>(null);

  async function patch(payload: Record<string, unknown>, action: string) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/wheelhouse/glossary/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "request_failed");
      } else {
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  }

  async function saveNotes() {
    await patch({ collaboratorNotes: notes || null }, "save-notes");
  }
  async function changeStatus(newStatus: MarketingStatus) {
    setStatus(newStatus);
    await patch({ marketingStatus: newStatus }, "change-status");
  }
  async function move(direction: "up" | "down") {
    await patch({ move: direction }, `move-${direction}`);
  }

  const pill = STATUS_PILL[entry.marketingStatus];

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-left w-full"
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="font-display font-bold text-navy-900">
                {entry.featureName}
              </p>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${pill.cls}`}
              >
                {pill.label}
              </span>
              {entry.collaboratorNotes && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-coral-100 text-coral-700">
                  Notes
                </span>
              )}
            </div>
            {entry.oneLiner && (
              <p className="text-sm text-navy-600 mt-1">{entry.oneLiner}</p>
            )}
            {entry.livesAt && (
              <p className="text-[11px] text-navy-500 font-mono mt-1">
                {entry.livesAt}
              </p>
            )}
          </button>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => move("up")}
            disabled={isFirst || !!busy}
            title="Move up within category"
            className="px-2 py-1 text-xs rounded border border-sand-200 hover:border-navy-300 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            onClick={() => move("down")}
            disabled={isLast || !!busy}
            title="Move down within category"
            className="px-2 py-1 text-xs rounded border border-sand-200 hover:border-navy-300 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-sand-200 space-y-3">
          {entry.notableBullets.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-navy-500 mb-1">
                What&apos;s notable
              </p>
              <ul className="text-sm text-navy-700 space-y-0.5 pl-4 list-disc">
                {entry.notableBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-widest text-navy-500 mb-1">
              Marketing status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const meta = STATUS_PILL[s];
                const isCurrent = s === status;
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={!!busy}
                    className={`px-2.5 py-1 text-[11px] rounded font-semibold ${
                      isCurrent
                        ? meta.cls + " ring-2 ring-offset-1 ring-coral-400"
                        : "bg-white border border-sand-300 text-navy-600 hover:border-navy-400"
                    }`}
                  >
                    {busy === "change-status" && isCurrent ? "…" : meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-navy-500 mb-1">
              Your notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your annotations — needs a photo, awaiting Aly verification, draft for IG, etc."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-sand-300 rounded focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-navy-400">
                Markdown OK · saved when you click save
              </p>
              <button
                onClick={saveNotes}
                disabled={busy === "save-notes" || notes === (entry.collaboratorNotes ?? "")}
                className="px-3 py-1 text-xs font-bold rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50"
              >
                {busy === "save-notes" ? "Saving…" : "Save notes"}
              </button>
            </div>
          </div>

          {entry.updatedAt && (
            <p className="text-[10px] text-navy-400">
              Last updated{" "}
              {new Date(entry.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              {entry.updatedBy && ` by ${entry.updatedBy}`}
            </p>
          )}
          {error && (
            <p className="text-[11px] text-coral-600">Error: {error}</p>
          )}
        </div>
      )}
    </div>
  );
}
