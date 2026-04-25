"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import PortalIcon from "@/components/brand/PortalIcon";

/**
 * Dispatch topic-suggestion form.
 *
 * Editorial model (Winston, 2026-04-25 session): hybrid — we still write
 * our own pieces, but a real share of Dispatch starts from reader
 * submissions. This form is the public on-ramp for that.
 *
 * Submissions are SILENT by design:
 * - No name or contact captured (one textarea, that's it)
 * - No acknowledgment email sent back
 * - No tracking ID returned
 * - Submitter sees a single confirmation panel and that's the entire
 *   transaction. If a piece comes from their submission, they'll see
 *   it on /dispatch — same as everyone else.
 *
 * Per Winston: "like Craigslist. They see the article they can wonder
 * if it is theirs or tell their friends."
 */
export default function DispatchTipForm() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const tip = topic.trim();
    if (tip.length < 10) {
      setErrorMsg("A sentence or two minimum — give us something to work with.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/dispatch/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Intentionally no name / no contact — silent submission policy
        body: JSON.stringify({ tip }),
      });
      if (!res.ok) throw new Error("Submission failed");
      try {
        track("dispatch_tip_submitted", { length: tip.length });
      } catch {
        // never block UX on analytics errors
      }
      setStatus("success");
      setTopic("");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again, or email hello@theportalocal.com directly if it's urgent.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-8">
        <PortalIcon name="check" className="w-14 h-14 mx-auto mb-4 text-coral-400" />
        <h3 className="font-display text-2xl font-bold text-sand-50 mb-3">
          Submission received
        </h3>
        <p className="text-navy-200 font-light leading-relaxed mb-3">
          That&apos;s it — no email confirmation, no follow-up, no record on
          our end tied to you. We review submissions on a rolling basis. If
          a piece comes out of yours, it&apos;ll show up here. You can wonder.
          Or tell your friends.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-coral-300 hover:text-coral-200 underline decoration-coral-500/30 hover:decoration-coral-400"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto text-left space-y-5">
      <div>
        <label htmlFor="tip" className="block text-sm font-semibold text-sand-100 mb-2">
          What should we be writing about?
        </label>
        <textarea
          id="tip"
          name="tip"
          required
          minLength={10}
          rows={6}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="A topic, a closure, a rent hike, a pattern hiding in plain sight, a development you don't trust, a question nobody's answering. Sourced or rumored — send them both. We'll review like we would any topic."
          className="w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 text-sand-50 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-coral-400/50 transition-all text-sm leading-relaxed"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-coral-300 text-center">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl btn-coral text-sm font-semibold tracking-wide disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit"}
      </button>

      <p className="text-center text-xs text-navy-400/80 leading-relaxed">
        Submissions are anonymous by default — we don&apos;t ask for your
        name and we don&apos;t reply. By submitting, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-coral-300">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-coral-300">Privacy Policy</Link>.
      </p>
    </form>
  );
}
