"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SocialPost } from "@/data/social-post-store";

interface Props {
  post: SocialPost;
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

export default function SocialPostCard({ post }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [busy, setBusy] = useState<null | "send" | "skip" | "save">(null);
  const [error, setError] = useState<string | null>(null);

  async function callApi(action: "send" | "skip" | "edit", body?: object) {
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

  const channelLabel =
    post.channel === "facebook"
      ? "Facebook"
      : post.channel === "instagram"
        ? "Instagram"
        : "X";
  const triggerLabel = TRIGGER_LABEL[post.triggerType] ?? post.triggerType;

  return (
    <div className="border border-sand-300 rounded-xl p-4 bg-sand-50/50">
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
      {post.imageUrl && (
        <p className="text-xs text-navy-500 mt-1 truncate">
          Image → {post.imageUrl}
        </p>
      )}

      {error && (
        <div className="text-xs text-coral-700 bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mt-3">
          {error}
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
