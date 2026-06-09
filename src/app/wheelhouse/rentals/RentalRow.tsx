"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UnifiedRental } from "@/data/rentals-calendar";

function fmt(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function RentalRow({
  rental,
  cartVendorOptions,
}: {
  rental: UnifiedRental;
  cartVendorOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(rental.notes ?? "");

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/wheelhouse/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? data.result?.error ?? "action_failed");
        return null;
      }
      return data;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function sendUpdate() {
    if (!rental.vendorSlug) {
      setError("no vendor assigned");
      return;
    }
    if (!confirm(`Send a booking update to ${rental.vendorName}?`)) return;
    const data = await post({
      action: "send-update",
      source: rental.source,
      sessionId: rental.sessionId,
    });
    if (data) {
      const e = data.result.emailed ?? 0;
      const emailPart = e > 0 ? ` + ${e} email${e === 1 ? "" : "s"}` : "";
      setInfo(
        `Update sent to ${data.result.vendor} (${data.result.sent} text${data.result.sent === 1 ? "" : "s"}${emailPart})`,
      );
      startTransition(() => router.refresh());
    }
  }

  async function saveNote() {
    const data = await post({
      action: "set-note",
      source: rental.source,
      sessionId: rental.sessionId,
      note: noteDraft,
    });
    if (data) {
      setNoteOpen(false);
      setInfo(
        noteDraft.trim()
          ? "Note saved — it rides along in every vendor update from here."
          : "Note cleared.",
      );
      startTransition(() => router.refresh());
    }
  }

  async function reassign(slug: string) {
    const data = await post({
      action: "reassign",
      source: rental.source,
      sessionId: rental.sessionId,
      vendorSlug: slug,
    });
    if (data) {
      setReassignOpen(false);
      startTransition(() => router.refresh());
    }
  }

  const dateLabel =
    rental.endDate && rental.endDate !== rental.startDate
      ? `${fmt(rental.startDate)} → ${fmt(rental.endDate)}`
      : fmt(rental.startDate);

  return (
    <div className="py-3 first:pt-0 last:pb-0 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                rental.source === "beach"
                  ? "bg-sky-100 text-sky-800 border border-sky-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {rental.source === "beach" ? "🏖️ Beach" : "🛺 Cart"}
            </span>
            <p className="font-semibold text-navy-900">
              {rental.customerDisplay ?? "Customer"}
            </p>
            {rental.status === "assigned" ? (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Assigned
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-coral-100 text-coral-700 border border-coral-300">
                Unassigned
              </span>
            )}
          </div>
          <p className="text-xs text-navy-600 mt-0.5">
            {rental.itemLabel}
            {rental.numDays ? ` · ${rental.numDays} day${rental.numDays === 1 ? "" : "s"}` : ""}
            {rental.handoff ? ` · ${rental.handoff}` : ""}
          </p>
          <p className="text-[11px] text-navy-500 mt-1">
            <strong>{dateLabel}</strong> · Vendor:{" "}
            <strong>{rental.vendorName ?? "— none —"}</strong>
          </p>
          {rental.location && (
            <p className="text-[11px] text-navy-500 mt-0.5">📍 {rental.location}</p>
          )}
          {rental.notes && !noteOpen && (
            <p className="text-[11px] text-navy-500 mt-0.5 italic">📝 {rental.notes}</p>
          )}
          {noteOpen && (
            <div className="mt-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="e.g. Party arrives at 10am — have setup ready by then"
                className="w-full text-xs border border-navy-200 rounded px-2 py-1.5 bg-white"
                disabled={busy}
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={saveNote}
                  disabled={busy}
                  className="px-3 py-1 text-[11px] font-bold rounded bg-navy-700 text-white hover:bg-navy-800 disabled:opacity-40"
                >
                  {busy ? "…" : "Save note"}
                </button>
                <button
                  onClick={() => {
                    setNoteOpen(false);
                    setNoteDraft(rental.notes ?? "");
                  }}
                  className="text-[11px] text-navy-400 hover:text-navy-700"
                >
                  cancel
                </button>
                <span className="text-[10px] text-navy-300 ml-auto">
                  goes out with every vendor update
                </span>
              </div>
            </div>
          )}
          {reassignOpen && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-navy-500">Reassign to:</span>
              <select
                disabled={busy}
                defaultValue=""
                onChange={(e) => e.target.value && reassign(e.target.value)}
                className="text-xs border border-navy-200 rounded px-2 py-1 bg-white"
              >
                <option value="" disabled>
                  pick vendor…
                </option>
                {cartVendorOptions.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setReassignOpen(false)}
                className="text-[11px] text-navy-400 hover:text-navy-700"
              >
                cancel
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={sendUpdate}
            disabled={busy || pending || !rental.vendorSlug}
            className="px-3 py-1.5 text-xs font-bold rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-40"
          >
            {busy ? "…" : "Send update"}
          </button>
          {rental.source === "cart" && (
            <button
              onClick={() => setReassignOpen((o) => !o)}
              disabled={busy || pending}
              className="px-3 py-1 text-[11px] font-semibold rounded border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40"
            >
              Reassign
            </button>
          )}
          <button
            onClick={() => setNoteOpen((o) => !o)}
            disabled={busy || pending}
            className="px-3 py-1 text-[11px] font-semibold rounded border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40"
          >
            {rental.notes ? "Edit note" : "📝 Note"}
          </button>
        </div>
      </div>
      {info && <p className="text-[11px] text-emerald-700 mt-1">{info}</p>}
      {error && <p className="text-[11px] text-coral-600 mt-1">Error: {error}</p>}
    </div>
  );
}
