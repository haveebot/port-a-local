"use client";

import { useState } from "react";
import type { PALAlert, AlertSeverity } from "@/data/alerts-store";

interface Props {
  initialActive: PALAlert | null;
  initialHistory: PALAlert[];
  actor: string;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function severityChip(severity: AlertSeverity): { label: string; cls: string } {
  switch (severity) {
    case "critical":
      return {
        label: "Critical",
        cls: "bg-red-500/20 text-red-200 border-red-500/40",
      };
    case "warning":
      return {
        label: "Warning",
        cls: "bg-coral-500/20 text-coral-200 border-coral-500/40",
      };
    case "spotlight":
      return {
        label: "Spotlight",
        cls: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
      };
    case "info":
    default:
      return {
        label: "Info",
        cls: "bg-navy-700 text-sand-200 border-navy-600",
      };
  }
}

export default function AlertsAdminClient({
  initialActive,
  initialHistory,
  actor,
}: Props) {
  const [active, setActive] = useState(initialActive);
  const [history, setHistory] = useState(initialHistory);

  const [severity, setSeverity] = useState<AlertSeverity>("warning");
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = message.trim().length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/wheelhouse/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          severity,
          message: message.trim(),
          linkUrl: linkUrl.trim() || undefined,
          linkLabel: linkLabel.trim() || undefined,
          expiresAt: expiresAt
            ? new Date(expiresAt).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Could not create alert.");
        setBusy(false);
        return;
      }
      setActive(data.alert);
      setHistory([data.alert, ...history.filter((h) => h.id !== data.alert.id)]);
      setMessage("");
      setLinkUrl("");
      setLinkLabel("");
      setExpiresAt("");
      setBusy(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function dismissActive() {
    if (!active) return;
    if (
      !window.confirm(
        `Dismiss this alert?\n\n"${active.message}"\n\nThe banner will disappear from the public site immediately.`,
      )
    )
      return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/wheelhouse/alerts?id=${encodeURIComponent(active.id)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Could not dismiss.");
        setBusy(false);
        return;
      }
      setActive(null);
      setHistory((h) => h.map((x) => (x.id === data.alert.id ? data.alert : x)));
      setBusy(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ACTIVE ALERT */}
      {active ? (
        <section className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-300">
              Active alert · live on every PAL page
            </p>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${severityChip(active.severity).cls}`}
            >
              {severityChip(active.severity).label}
            </span>
          </div>
          <p className="text-base font-medium text-sand-100 leading-relaxed whitespace-pre-wrap">
            {active.message}
          </p>
          {active.linkUrl && (
            <p className="mt-3 text-sm">
              <span className="text-sand-400">CTA: </span>
              <a
                href={active.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="text-coral-300 underline decoration-coral-400/60"
              >
                {active.linkLabel ?? active.linkUrl}
              </a>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[11px] text-sand-400 font-mono">
            <span>Created: {fmt(active.createdAt)}</span>
            {active.expiresAt && (
              <span>Expires: {fmt(active.expiresAt)}</span>
            )}
            <span>By: {active.createdBy}</span>
          </div>
          <button
            onClick={dismissActive}
            disabled={busy}
            className="mt-5 px-5 py-2.5 rounded-lg text-sm font-bold bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 disabled:opacity-50"
          >
            Dismiss alert (clears banner site-wide)
          </button>
        </section>
      ) : (
        <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
          <p className="text-sm text-emerald-200">
            <span className="font-bold">No active alert.</span> The banner is dormant.
          </p>
        </section>
      )}

      {/* CREATE FORM */}
      <section className="bg-navy-800/60 border border-navy-700 rounded-2xl p-5 sm:p-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
          Trigger a new alert
        </p>
        <p className="text-sm text-sand-300 font-light mb-5">
          Creating a new alert auto-dismisses any prior active alert
          (single-active invariant). Banner appears on the next page
          load across the entire site.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-2">
              Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["spotlight", "info", "warning", "critical"] as AlertSeverity[]).map(
                (s) => {
                  const chip = severityChip(s);
                  const selected = severity === s;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={
                        selected
                          ? `px-3 py-3 rounded-lg border-2 ${chip.cls} font-bold text-sm transition-all`
                          : "px-3 py-3 rounded-lg border-2 border-navy-700 bg-navy-900 text-sand-300 font-medium text-sm hover:border-coral-500/40 transition-all"
                      }
                    >
                      {chip.label}
                      <span className="block text-[10px] font-light opacity-75 mt-0.5 normal-case">
                        {s === "info"
                          ? "community / heads-up · navy"
                          : s === "warning"
                            ? "advisory / road closure · coral"
                            : "evacuation / life-safety · red"}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={
                "e.g. critical → Mandatory evacuation in effect for Port Aransas. Leave by 9 PM tonight.\n\n" +
                "warning → Boil-water advisory through Friday. Run cold tap 3 minutes before drinking.\n\n" +
                "info → 4th of July fireworks tonight at 9 PM, Roberts Point Park. Free, family-friendly.\n\n" +
                "info → PAHS Graduation, Saturday 5/14 at 6 PM, Mustang Stadium."
              }
              className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none resize-y"
              required
            />
            <p className="text-[11px] text-sand-400 font-light mt-1">
              Plain language. What&apos;s happening, what to do (or
              when / where). 1–2 sentences. The banner pins to the
              top of every PAL page until dismissed or expired.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                CTA link URL (optional)
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/emergency/harvey-2027 or https://…"
                className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                CTA label
              </label>
              <input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="More info →"
                className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
              Auto-expire at (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
            />
            <p className="text-[11px] text-sand-400 font-light mt-1">
              Leave blank to keep until manually dismissed. Set a time to
              auto-clear (e.g., end of advisory window).
            </p>
          </div>

          {err && (
            <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!valid || busy}
            className="w-full py-3.5 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
          >
            {busy ? "Triggering…" : "Trigger alert →"}
          </button>

          <p className="text-[11px] text-sand-500 font-light text-center">
            Will appear at the top of every PAL page within seconds.
            Posting as <span className="font-mono">{actor}</span>.
          </p>
        </form>
      </section>

      {/* HISTORY */}
      {history.length > 0 && (
        <section>
          <p className="text-[10px] font-bold tracking-widest uppercase text-sand-400 mb-2">
            Recent alerts ({history.length})
          </p>
          <div className="space-y-2">
            {history.map((a) => {
              const chip = severityChip(a.severity);
              return (
                <div
                  key={a.id}
                  className={`bg-navy-800/40 border ${a.active ? "border-coral-500/40" : "border-navy-700"} rounded-lg p-3 sm:p-4`}
                >
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${chip.cls}`}
                    >
                      {chip.label}
                    </span>
                    {a.active && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Live
                      </span>
                    )}
                    <span className="text-[11px] text-sand-400 font-mono ml-auto">
                      {fmt(a.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-sand-200 whitespace-pre-wrap">
                    {a.message}
                  </p>
                  {a.linkUrl && (
                    <p className="mt-1 text-[11px] text-sand-400 font-mono break-all">
                      → {a.linkUrl}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
