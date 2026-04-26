"use client";

import { useState } from "react";

export default function LookupForm() {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"emailed" | "no-match" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const valid = phone.trim().replace(/\D/g, "").length >= 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/deliver/driver/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not look you up.");
        setSubmitting(false);
        return;
      }
      setDone(data.matched ? "emailed" : "no-match");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  if (done === "emailed") {
    return (
      <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-6 text-center">
        <p className="font-display text-xl font-bold text-emerald-300 mb-2">
          Sent ✓
        </p>
        <p className="text-sm text-emerald-200">
          Check your inbox. The email has both your on/off-duty link and
          your Stripe payouts setup link. If it doesn&apos;t arrive within
          a few minutes, check spam or email{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-emerald-400 hover:text-emerald-100"
          >
            hello@theportalocal.com
          </a>
          .
        </p>
      </div>
    );
  }

  if (done === "no-match") {
    return (
      <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-6 text-center">
        <p className="font-display text-xl font-bold text-amber-300 mb-2">
          No match yet
        </p>
        <p className="text-sm text-amber-200 mb-4">
          That phone number isn&apos;t in our runner roster. If you applied
          but haven&apos;t been approved yet, hang tight — we&apos;ll be in
          touch within a day or two.
        </p>
        <p className="text-sm text-amber-200">
          Haven&apos;t applied?{" "}
          <a
            href="/deliver/runner"
            className="underline decoration-amber-400 hover:text-amber-100 font-bold"
          >
            Sign up to drive →
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-sand-300 mb-2">
          Phone number
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="(361) 555-0100"
          autoComplete="tel"
          className="w-full px-3 py-3 border border-navy-700 bg-navy-800 rounded-lg text-sand-50 text-base focus:border-coral-400 focus:outline-none placeholder:text-sand-500"
          required
        />
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full py-4 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Looking…" : "Email me my links →"}
      </button>

      <p className="text-[11px] text-sand-500 font-light text-center">
        Same phone you signed up with. We email — never share.
      </p>
    </form>
  );
}
