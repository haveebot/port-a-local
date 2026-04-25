"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MESSAGE_TYPE_META,
  type MessageType,
  type ParticipantId,
} from "@/data/wheelhouse-types";
import MessageTypePill from "./MessageTypePill";

const TYPE_ORDER: MessageType[] = [
  "request",
  "update",
  "approval-needed",
  "blocked",
  "decision",
  "fyi",
];

export default function MessageComposer({
  threadId,
  authorId,
}: {
  threadId: string;
  authorId: ParticipantId;
}) {
  const router = useRouter();
  const [type, setType] = useState<MessageType>("update");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 3) {
      setError("Message body too short.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/wheelhouse/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, type, body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Submission failed.");
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-sand-50 border border-sand-200 rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-[10px] font-bold tracking-widest uppercase text-navy-400">
          Type
        </span>
        {TYPE_ORDER.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={`transition-all ${type === t ? "ring-2 ring-coral-400 ring-offset-1 rounded" : "opacity-60 hover:opacity-100"}`}
            title={MESSAGE_TYPE_META[t].hint}
          >
            <MessageTypePill type={t} />
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="What's the update? Markdown allowed. Be specific."
        className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-y"
      />

      {error && (
        <p className="text-sm text-coral-600 font-medium mt-2">{error}</p>
      )}

      <div className="flex items-center justify-between gap-3 mt-3">
        <p className="text-[11px] text-navy-400 font-light">
          Posting as {authorId}.
        </p>
        <button
          type="submit"
          disabled={submitting || body.trim().length < 3}
          className="px-5 py-2 rounded-lg text-sm font-semibold btn-coral disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
