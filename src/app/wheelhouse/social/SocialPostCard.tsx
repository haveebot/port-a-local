"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SocialPost } from "@/data/social-post-store";

interface Props {
  post: SocialPost;
  /** 1-based position in the pending list. Renders a "Up next" / "2 of 10" pill. */
  position?: number;
  /** Total in the pending list — paired with position for the "X of Y" label. */
  total?: number;
}

function ordinal(n: number): string {
  if (n === 1) return "Up next";
  if (n === 2) return "On deck";
  if (n === 3) return "After that";
  return `${n}th up`;
}

const TRIGGER_LABEL: Record<string, string> = {
  event_published: "New event",
  event_milestone_30d: "30 days out",
  event_milestone_14d: "2 weeks out",
  event_milestone_7d: "1 week out",
  event_milestone_1d: "Tomorrow",
  event_today: "Today",
  event_wrap: "Wrap",
  heritage_published: "Heritage",
  dispatch_published: "Dispatch",
  business_added: "New listing",
  glossary_active: "Feature spotlight",
  manual: "Manual",
};

/**
 * Convert ISO timestamp → "YYYY-MM-DDTHH:MM" in operator's local TZ
 * for use as <input type="datetime-local"> value (which is naive).
 */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** Reverse of isoToLocalInput — naive local input → ISO. */
function localInputToIso(local: string): string | null {
  if (!local) return null;
  const t = new Date(local).getTime();
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const future = ms >= 0;
  const min = Math.round(Math.abs(ms) / 60_000);
  const fmt = (n: number, unit: string) =>
    future ? `in ${n}${unit}` : `${n}${unit} ago`;
  if (min < 1) return future ? "imminent" : "just now";
  if (min < 60) return fmt(min, "m");
  const hr = Math.round(min / 60);
  if (hr < 24) return fmt(hr, "h");
  return fmt(Math.round(hr / 24), "d");
}

export default function SocialPostCard({ post, position, total }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleAt, setScheduleAt] = useState(() =>
    isoToLocalInput(post.autoSendAt),
  );
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<
    | null
    | "send"
    | "skip"
    | "save"
    | "schedule"
    | "unschedule"
    | "upload"
    | "removeImage"
    | "moveUp"
    | "moveDown"
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function callApi(
    action: "send" | "skip" | "edit" | "schedule" | "image" | "move",
    body?: object,
  ) {
    const res = await fetch(`/api/wheelhouse/social/${post.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const data = (await res.json()) as { error?: string; stubbed?: boolean };
    if (!res.ok) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return data;
  }

  async function onMove(direction: "up" | "down") {
    setBusy(direction === "up" ? "moveUp" : "moveDown");
    setError(null);
    try {
      await callApi("move", { direction });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onUploadFile(file: File) {
    setBusy("upload");
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/wheelhouse/social/upload", {
        method: "POST",
        body: fd,
      });
      const upData = (await up.json()) as { url?: string; error?: string; detail?: string };
      if (!up.ok || !upData.url) {
        throw new Error(upData.detail ?? upData.error ?? `HTTP ${up.status}`);
      }
      await callApi("image", { imageUrl: upData.url });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
      setUploading(false);
    }
  }

  async function onRemoveImage() {
    setBusy("removeImage");
    setError(null);
    try {
      await callApi("image", { imageUrl: null });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSend() {
    setBusy("send");
    setError(null);
    try {
      const data = await callApi("send");
      if (data.stubbed) {
        // Stub mode — posted nothing, just logged. Refresh anyway.
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSkip() {
    if (!confirm("Skip this post? It won't be sent.")) return;
    setBusy("skip");
    setError(null);
    try {
      await callApi("skip");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSaveEdit() {
    if (caption.trim().length < 1) {
      setError("Caption can't be empty");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      await callApi("edit", { caption: caption.trim() });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSaveSchedule() {
    const iso = localInputToIso(scheduleAt);
    if (!iso) {
      setError("Pick a date/time");
      return;
    }
    if (new Date(iso).getTime() < Date.now() - 60_000) {
      setError("Time is in the past");
      return;
    }
    setBusy("schedule");
    setError(null);
    try {
      await callApi("schedule", { autoSendAt: iso });
      setScheduling(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onUnschedule() {
    setBusy("unschedule");
    setError(null);
    try {
      await callApi("schedule", { autoSendAt: null });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const channelLabel =
    post.channel === "facebook"
      ? "Facebook"
      : post.channel === "instagram"
        ? "Instagram"
        : "X";
  const triggerLabel = TRIGGER_LABEL[post.triggerType] ?? post.triggerType;

  const isUpNext = position === 1;
  return (
    <div
      className={`border rounded-xl p-4 ${
        isUpNext
          ? "border-coral-400 bg-coral-50/40 ring-1 ring-coral-200"
          : "border-sand-300 bg-sand-50/50"
      }`}
    >
      {position !== undefined && total !== undefined && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isUpNext
                ? "bg-coral-500 text-white"
                : "bg-navy-100 text-navy-700"
            }`}
          >
            {isUpNext ? "🔥 " : ""}
            {ordinal(position)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-navy-500 font-mono">
              {position} of {total} · #{post.id}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onMove("up")}
                disabled={position === 1 || busy !== null}
                title="Move up"
                aria-label="Move up"
                className="px-2 py-1 text-xs rounded border border-sand-300 hover:border-navy-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busy === "moveUp" ? "…" : "↑"}
              </button>
              <button
                onClick={() => onMove("down")}
                disabled={position === total || busy !== null}
                title="Move down"
                aria-label="Move down"
                className="px-2 py-1 text-xs rounded border border-sand-300 hover:border-navy-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busy === "moveDown" ? "…" : "↓"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-coral-50 text-coral-700 border border-coral-200">
          {triggerLabel}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-navy-50 text-navy-700 border border-navy-200">
          {channelLabel}
        </span>
        {post.triggerRef && (
          <span className="text-[11px] text-navy-500 font-mono truncate">
            ref: {post.triggerRef}
          </span>
        )}
        {post.scheduledFor && (
          <span className="text-[11px] text-navy-500 ml-auto">
            scheduled · {new Date(post.scheduledFor).toLocaleString()}
          </span>
        )}
        {post.autoSendAt && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 ml-auto"
            title={new Date(post.autoSendAt).toLocaleString()}
          >
            ⏱ auto-fire {relativeTime(post.autoSendAt)}
          </span>
        )}
      </div>

      {editing ? (
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={Math.min(12, Math.max(4, caption.split("\n").length + 1))}
          className="w-full text-sm text-navy-800 bg-white border border-sand-300 rounded-lg px-3 py-2 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-coral-300"
        />
      ) : (
        <pre className="whitespace-pre-wrap text-sm text-navy-800 leading-relaxed font-sans bg-white border border-sand-200 rounded-lg p-3">
          {post.caption}
        </pre>
      )}

      {post.linkUrl && (
        <p className="text-xs text-navy-500 mt-2 truncate">
          Link → {post.linkUrl}
        </p>
      )}

      {/* IMAGE MODE — toggle between OG link card and custom uploaded photo */}
      <div className="mt-3 p-3 rounded-lg bg-sand-100 border border-sand-200">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-navy-700 mb-2">
          Image
        </p>
        {post.imageUrl ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt="custom upload"
              className="w-24 h-24 object-cover rounded-md border border-sand-300 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-700 font-semibold mb-1">
                📷 Photo mode (custom image)
              </p>
              <p className="text-[11px] text-navy-500 leading-relaxed mb-2">
                Posts as a photo — no link card preview. Link still appears in caption text.
              </p>
              <button
                onClick={onRemoveImage}
                disabled={busy !== null}
                className="text-[11px] font-semibold text-coral-700 hover:text-coral-900 disabled:opacity-50"
              >
                {busy === "removeImage" ? "Removing…" : "Remove image (use OG instead)"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-700 font-semibold mb-0.5">
                🔗 Link mode (auto OG preview)
              </p>
              <p className="text-[11px] text-navy-500 leading-relaxed">
                FB will show the link card from {post.linkUrl ? "the URL above" : "the post caption"}.
                Upload a custom image to switch to photo mode.
              </p>
            </div>
            <label
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 ${
                busy !== null
                  ? "border-sand-300 text-navy-400 cursor-not-allowed"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {uploading ? "Uploading…" : "📤 Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy !== null}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(f);
                  e.target.value = ""; // allow re-select of same filename
                }}
              />
            </label>
          </div>
        )}
        <p className="text-[10px] text-navy-400 mt-2">
          PNG / JPG / WEBP · ≤8MB · 1200×630 best for FB · 1080×1080 best for IG
        </p>
      </div>

      {error && (
        <div className="text-xs text-coral-700 bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}

      {scheduling && (
        <div className="flex items-center gap-2 mt-3 flex-wrap p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 shrink-0">
            Auto-fire at
          </label>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="flex-1 min-w-[12rem] text-xs bg-white border border-emerald-300 rounded-md px-2 py-1.5 font-mono text-navy-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            onClick={onSaveSchedule}
            disabled={busy !== null || !scheduleAt}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === "schedule" ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setScheduling(false);
              setScheduleAt(isoToLocalInput(post.autoSendAt));
              setError(null);
            }}
            disabled={busy !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 text-emerald-700 hover:bg-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={onSaveEdit}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-sand-50 hover:bg-navy-800 disabled:opacity-50"
            >
              {busy === "save" ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setCaption(post.caption);
                setError(null);
              }}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-sand-300 text-navy-700 hover:bg-sand-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSend}
              disabled={busy !== null}
              className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50"
            >
              {busy === "send" ? "Sending…" : "Send"}
            </button>
            <button
              onClick={() => setEditing(true)}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-sand-300 text-navy-700 hover:bg-sand-100 disabled:opacity-50"
            >
              Edit
            </button>
            {post.autoSendAt ? (
              <button
                onClick={onUnschedule}
                disabled={busy !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                title={`Cancel auto-fire (${new Date(post.autoSendAt).toLocaleString()})`}
              >
                {busy === "unschedule" ? "Cancelling…" : "Unschedule"}
              </button>
            ) : (
              <button
                onClick={() => setScheduling(true)}
                disabled={busy !== null || scheduling}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-sand-300 text-navy-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
              >
                ⏱ Schedule
              </button>
            )}
            <button
              onClick={onSkip}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-sand-300 text-navy-500 hover:bg-sand-100 hover:text-coral-700 disabled:opacity-50 ml-auto"
            >
              {busy === "skip" ? "Skipping…" : "Skip"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
