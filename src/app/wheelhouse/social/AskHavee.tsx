"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ComposeResult {
  ok: boolean;
  status: "drafted" | "clarify" | "declined" | "error";
  postId?: number;
  caption?: string;
  linkUrl?: string;
  question?: string;
  reason?: string;
}

/**
 * "Ask Havee" composer card — at the top of /wheelhouse/social.
 * Operator types a natural-language prompt → inline Claude agent
 * drafts a caption, picks a URL, queues it as pending. Operator
 * reviews the new card in the list below.
 *
 * Three result shapes:
 *  - drafted: queued, refresh the list
 *  - clarify: show the agent's question, let operator answer + retry
 *  - declined: show the reason, let operator try a different prompt
 */
export default function AskHavee() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);

  async function onSubmit() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/wheelhouse/social/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = (await res.json()) as ComposeResult;
      setResult(data);
      if (data.status === "drafted") {
        setPrompt("");
        router.refresh();
      }
    } catch (err) {
      setResult({
        ok: false,
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-gradient-to-br from-coral-500/10 via-white to-white rounded-2xl border-2 border-coral-300 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">✨</span>
        <h2 className="font-display text-xl font-bold text-navy-900">
          AI Composer — draft a post
        </h2>
      </div>
      <p className="text-xs text-navy-600 mb-3 leading-relaxed">
        Tell me what you want — I&apos;ll draft a caption in your voice,
        pick the right link, and drop it in the queue for your review.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={busy}
        rows={3}
        placeholder='e.g. "fishing tournament season is here, link to the events page" — or "let people know about today\&#39;s live music" — or "spotlight the fishing report"'
        className="w-full text-sm bg-white border border-coral-200 rounded-lg px-3 py-2 leading-relaxed focus:outline-none focus:ring-2 focus:ring-coral-300 disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
        <p className="text-[10px] text-navy-400">
          ⌘/Ctrl + Enter to send · powered by Heye Lab
        </p>
        <button
          onClick={onSubmit}
          disabled={busy || !prompt.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Drafting…" : "✨ Draft post"}
        </button>
      </div>

      {result && result.status === "drafted" && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <p className="font-bold mb-1">
            ✅ Drafted post #{result.postId} — added to queue
          </p>
          <p className="text-emerald-700 leading-relaxed">
            Scroll down to review, edit if needed, and send when ready.
          </p>
        </div>
      )}

      {result && result.status === "clarify" && (
        <div className="mt-4 p-3 rounded-lg bg-coral-50 border border-coral-200 text-xs text-navy-800">
          <p className="font-bold mb-1">🤔 Need a bit more:</p>
          <p className="leading-relaxed mb-2">{result.question}</p>
          <button
            onClick={() => {
              setResult(null);
              const t = document.querySelector("textarea");
              if (t instanceof HTMLTextAreaElement) t.focus();
            }}
            className="text-coral-700 font-semibold hover:text-coral-900"
          >
            Edit your prompt →
          </button>
        </div>
      )}

      {result && result.status === "declined" && (
        <div className="mt-4 p-3 rounded-lg bg-navy-50 border border-navy-200 text-xs text-navy-800">
          <p className="font-bold mb-1">🚫 Declined:</p>
          <p className="leading-relaxed">{result.reason}</p>
        </div>
      )}

      {result && result.status === "error" && (
        <div className="mt-4 p-3 rounded-lg bg-coral-100 border border-coral-300 text-xs text-coral-900">
          <p className="font-bold mb-1">⚠️ Error:</p>
          <p className="leading-relaxed font-mono">{result.reason}</p>
        </div>
      )}
    </section>
  );
}
