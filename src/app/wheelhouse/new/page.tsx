"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import {
  PARTICIPANTS,
  type MessageType,
  type ParticipantId,
} from "@/data/wheelhouse-types";
import MessageTypePill from "@/components/wheelhouse/MessageTypePill";

const TYPE_ORDER: MessageType[] = [
  "request",
  "update",
  "approval-needed",
  "blocked",
  "decision",
  "fyi",
];

export default function NewThreadPage() {
  const router = useRouter();
  const [me, setMe] = useState<ParticipantId | null>(null);

  // Read identity from cookie via a client-side fetch (cookie is httpOnly,
  // so we ask the server for who we are)
  useEffect(() => {
    fetch("/api/wheelhouse/whoami")
      .then((r) => r.json())
      .then((data) => setMe(data?.who ?? null))
      .catch(() => {});
  }, []);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [participants, setParticipants] = useState<ParticipantId[]>([]);
  const [type, setType] = useState<MessageType>("update");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill self as a participant once identity loads
  useEffect(() => {
    if (me && participants.length === 0) {
      setParticipants([me]);
    }
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleParticipant = (id: ParticipantId) => {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    if (title.trim().length < 5) {
      setError("Title too short.");
      return;
    }
    if (participants.length === 0) {
      setError("Pick at least one participant.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/wheelhouse/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
          participants,
          authorId: me,
          state: "open",
          initialMessage: body.trim()
            ? { type, body: body.trim() }
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Couldn't create the thread.");
        return;
      }
      const data = await res.json();
      router.replace(`/wheelhouse/${data.thread.id}`);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <LighthouseMark size={28} variant="light" detail="icon" />
            <p className="font-display text-base font-bold text-sand-50">
              The Wheelhouse
            </p>
          </Link>
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Cancel
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">
          New thread
        </h1>

        <form
          onSubmit={submit}
          className="bg-white border border-sand-200 rounded-2xl p-6 space-y-5"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
            >
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What's this about?"
              className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
            >
              Tags <span className="text-navy-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tournament, twat, outreach"
              className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-2">
              Participants
            </label>
            <div className="flex flex-wrap gap-2">
              {PARTICIPANTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    participants.includes(p.id)
                      ? "bg-navy-900 text-sand-50"
                      : "bg-sand-100 text-navy-600 hover:bg-sand-200"
                  }`}
                >
                  {p.name}
                  {p.kind === "agent" && (
                    <span className="text-[10px] opacity-60 ml-1">agent</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-sand-200 pt-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-2">
              First post (optional)
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TYPE_ORDER.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`transition-all ${type === t ? "ring-2 ring-coral-400 ring-offset-1 rounded" : "opacity-60 hover:opacity-100"}`}
                >
                  <MessageTypePill type={t} />
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Optional opening message. You can leave blank and post messages once the thread exists."
              className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 resize-y"
            />
          </div>

          {error && (
            <p className="text-sm text-coral-600 font-medium">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/wheelhouse"
              className="text-sm font-medium text-navy-500 hover:text-coral-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !me}
              className="px-5 py-2 rounded-lg text-sm font-semibold btn-coral disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create thread"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
