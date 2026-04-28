"use client";

import { useState } from "react";
import type {
  EmergencyEvent,
  EventKind,
  EventSeverity,
  EventStatus,
  UpdateKind,
} from "@/data/emergency-store";

interface Props {
  initialEvents: EmergencyEvent[];
  actor: string;
}

export default function EmergencyAdminClient({
  initialEvents,
  actor,
}: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [showCreate, setShowCreate] = useState(false);
  const [openUpdateFor, setOpenUpdateFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Create-event form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<EventSeverity>("warning");
  const [kind, setKind] = useState<EventKind>("general");
  const [startedAt, setStartedAt] = useState("");

  // Post-update form state (per event)
  const [updateBody, setUpdateBody] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateKind, setUpdateKind] = useState<UpdateKind>("info");
  const [updateSourceUrl, setUpdateSourceUrl] = useState("");
  const [updateSourceLabel, setUpdateSourceLabel] = useState("");

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  async function postJson(body: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/wheelhouse/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Request failed");
        setBusy(false);
        return null;
      }
      setBusy(false);
      return data;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
      return null;
    }
  }

  async function refreshList() {
    try {
      const res = await fetch("/api/wheelhouse/emergency", {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.events)) setEvents(data.events);
    } catch (e) {
      console.error(e);
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2 || summary.trim().length < 5) {
      setErr("Title + summary required");
      return;
    }
    const data = await postJson({
      action: "create-event",
      title: title.trim(),
      slug: (slug.trim() || autoSlug(title)).trim(),
      summary: summary.trim(),
      severity,
      kind,
      startedAt: startedAt
        ? new Date(startedAt).toISOString()
        : undefined,
    });
    if (data) {
      setEvents([data.event, ...events]);
      setTitle("");
      setSlug("");
      setSummary("");
      setStartedAt("");
      setShowCreate(false);
    }
  }

  async function submitUpdate(eventId: string) {
    if (updateBody.trim().length < 5) {
      setErr("Update body required (5+ chars)");
      return;
    }
    const data = await postJson({
      action: "post-update",
      eventId,
      body: updateBody.trim(),
      title: updateTitle.trim() || undefined,
      kind: updateKind,
      sourceUrl: updateSourceUrl.trim() || undefined,
      sourceLabel: updateSourceLabel.trim() || undefined,
    });
    if (data) {
      setUpdateBody("");
      setUpdateTitle("");
      setUpdateSourceUrl("");
      setUpdateSourceLabel("");
      setOpenUpdateFor(null);
      void refreshList();
    }
  }

  async function patchStatus(eventId: string, status: EventStatus) {
    if (
      status === "resolved" &&
      !window.confirm(
        "Mark this event resolved? Public page header will switch to the resolved state.",
      )
    )
      return;
    const data = await postJson({
      action: "patch-event",
      id: eventId,
      status,
    });
    if (data?.event) {
      setEvents(events.map((e) => (e.id === eventId ? data.event : e)));
    }
  }

  return (
    <div className="space-y-8">
      {/* CREATE EVENT */}
      <section className="bg-navy-800/60 border border-navy-700 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300">
            Create event
          </p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-xs text-coral-300 underline decoration-coral-500/50"
          >
            {showCreate ? "Hide" : "+ New event"}
          </button>
        </div>
        <p className="text-sm text-sand-300 font-light mb-4">
          Posts a /emergency/[slug] page that the public can visit.
          Banner is separate — trigger it at /wheelhouse/alerts with
          linkUrl pointing at this event's slug after creation.
        </p>

        {showCreate && (
          <form onSubmit={submitCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hurricane watch — Tropical Disturbance L21"
                className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={autoSlug(title) || "auto-generated from title"}
                  className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm font-mono text-sand-50 focus:border-coral-400 focus:outline-none"
                />
                <p className="text-[10px] text-sand-400 font-light mt-1">
                  Used in URL: /emergency/{slug.trim() || autoSlug(title) || "(auto)"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                  Started at
                </label>
                <input
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="One-paragraph orientation. What's happening, where, who's affected. Updates go below as the situation evolves."
                className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none resize-y"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as EventSeverity)
                  }
                  className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
                >
                  <option value="info">Info (navy)</option>
                  <option value="warning">Warning (coral)</option>
                  <option value="critical">Critical (red)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-1">
                  Kind
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as EventKind)}
                  className="w-full px-3 py-2.5 border border-navy-700 bg-navy-900 rounded-lg text-sm text-sand-50 focus:border-coral-400 focus:outline-none"
                >
                  <option value="weather">Weather</option>
                  <option value="evacuation">Evacuation</option>
                  <option value="road-closure">Road closure</option>
                  <option value="water-advisory">Water advisory</option>
                  <option value="fire">Fire</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {err && (
              <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create event →"}
            </button>
          </form>
        )}
      </section>

      {/* EVENT LIST + INLINE UPDATE */}
      <section>
        <p className="text-[10px] font-bold tracking-widest uppercase text-sand-400 mb-3">
          Events ({events.length})
        </p>
        {events.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center text-sm text-emerald-200">
            No events yet. Create one above when a situation begins.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e.id}
                className={`bg-navy-800/40 border ${e.status === "active" ? "border-coral-500/40" : "border-navy-700"} rounded-xl p-4`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${eventStatusChip(e.status)}`}
                    >
                      {e.status}
                    </span>
                    <span className="ml-2 text-[10px] tracking-widest uppercase text-sand-400">
                      {e.severity} · {e.kind}
                    </span>
                  </div>
                  <a
                    href={`/emergency/${e.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-coral-300 underline decoration-coral-500/50"
                  >
                    /emergency/{e.slug} ↗
                  </a>
                </div>
                <p className="font-display text-base font-bold text-sand-100 leading-tight">
                  {e.title}
                </p>
                <p className="text-xs text-sand-300 font-light mt-1 line-clamp-2">
                  {e.summary}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() =>
                      setOpenUpdateFor(
                        openUpdateFor === e.id ? null : e.id,
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-coral-500/20 text-coral-200 border border-coral-500/40 hover:bg-coral-500/30"
                  >
                    {openUpdateFor === e.id ? "Cancel" : "+ Update"}
                  </button>
                  {e.status !== "active" && (
                    <button
                      onClick={() => patchStatus(e.id, "active")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-navy-700 text-sand-200 border border-navy-600 hover:border-coral-500/40"
                    >
                      Mark active
                    </button>
                  )}
                  {e.status !== "watching" && (
                    <button
                      onClick={() => patchStatus(e.id, "watching")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-navy-700 text-sand-200 border border-navy-600 hover:border-coral-500/40"
                    >
                      Mark watching
                    </button>
                  )}
                  {e.status !== "resolved" && (
                    <button
                      onClick={() => patchStatus(e.id, "resolved")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>

                {openUpdateFor === e.id && (
                  <div className="mt-4 pt-4 border-t border-navy-700 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-sand-300 mb-1">
                        Update kind
                      </label>
                      <select
                        value={updateKind}
                        onChange={(ev) =>
                          setUpdateKind(ev.target.value as UpdateKind)
                        }
                        className="w-full px-3 py-2 border border-navy-700 bg-navy-900 rounded-lg text-xs text-sand-50 focus:border-coral-400 focus:outline-none"
                      >
                        <option value="info">Info</option>
                        <option value="conditions">Conditions</option>
                        <option value="warning">Warning</option>
                        <option value="decision">Decision</option>
                        <option value="all-clear">All-clear</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-sand-300 mb-1">
                        Title (optional)
                      </label>
                      <input
                        value={updateTitle}
                        onChange={(ev) => setUpdateTitle(ev.target.value)}
                        className="w-full px-3 py-2 border border-navy-700 bg-navy-900 rounded-lg text-xs text-sand-50 focus:border-coral-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-sand-300 mb-1">
                        Body *
                      </label>
                      <textarea
                        value={updateBody}
                        onChange={(ev) => setUpdateBody(ev.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-navy-700 bg-navy-900 rounded-lg text-xs text-sand-50 focus:border-coral-400 focus:outline-none resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2">
                      <input
                        type="url"
                        value={updateSourceUrl}
                        onChange={(ev) => setUpdateSourceUrl(ev.target.value)}
                        placeholder="Source URL (NWS, city, TxDOT, etc.)"
                        className="w-full px-3 py-2 border border-navy-700 bg-navy-900 rounded-lg text-xs text-sand-50 focus:border-coral-400 focus:outline-none"
                      />
                      <input
                        value={updateSourceLabel}
                        onChange={(ev) =>
                          setUpdateSourceLabel(ev.target.value)
                        }
                        placeholder="Source label"
                        className="w-full px-3 py-2 border border-navy-700 bg-navy-900 rounded-lg text-xs text-sand-50 focus:border-coral-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => submitUpdate(e.id)}
                      disabled={busy}
                      className="w-full py-2 rounded-lg text-xs font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
                    >
                      {busy ? "Posting…" : "Post update →"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] text-sand-500 font-light text-center">
        Posting as <span className="font-mono">{actor}</span>
      </p>
    </div>
  );
}

function eventStatusChip(status: EventStatus): string {
  switch (status) {
    case "active":
      return "bg-coral-500/20 text-coral-200 border-coral-500/40";
    case "watching":
      return "bg-navy-700 text-sand-200 border-navy-600";
    case "resolved":
      return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
    default:
      return "bg-navy-700 text-sand-200 border-navy-600";
  }
}
