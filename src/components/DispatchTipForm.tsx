"use client";

import { useState } from "react";
import Link from "next/link";
import PortalIcon from "@/components/brand/PortalIcon";

export default function DispatchTipForm() {
  const [form, setForm] = useState({ tip: "", name: "", contact: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const tip = form.tip.trim();
    if (tip.length < 10) {
      setErrorMsg("Tip is too short — a sentence or two minimum.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/dispatch/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tip,
          name: form.name.trim(),
          contact: form.contact.trim(),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please email hello@theportalocal.com directly.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-8">
        <PortalIcon name="check" className="w-14 h-14 mx-auto mb-4 text-coral-400" />
        <h3 className="font-display text-2xl font-bold text-sand-50 mb-3">Tip received</h3>
        <p className="text-navy-200 font-light leading-relaxed">
          Got it. If it&apos;s confirmable and fits a Dispatch angle, it may show up in a future
          piece. If you left a contact, we may reach out. Thanks for keeping us honest.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto text-left space-y-5">
      <div>
        <label htmlFor="tip" className="block text-sm font-semibold text-sand-100 mb-2">
          Your tip <span className="text-coral-400">*</span>
        </label>
        <textarea
          id="tip"
          name="tip"
          required
          minLength={10}
          rows={5}
          value={form.tip}
          onChange={handleChange}
          placeholder="What's the island not saying out loud? Closures, rent hikes, deals, patterns — sourced or rumored, send them both."
          className="w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 text-sand-50 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-coral-400/50 transition-all text-sm leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-sand-100 mb-2">
            Your name <span className="text-navy-400 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Leave blank for anonymous"
            className="w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 text-sand-50 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-coral-400/50 transition-all text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-semibold text-sand-100 mb-2">
            Email or phone <span className="text-navy-400 font-normal">(optional)</span>
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            value={form.contact}
            onChange={handleChange}
            placeholder="Only if we can follow up"
            className="w-full rounded-xl bg-white/8 border border-white/15 px-4 py-3 text-sand-50 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-coral-400/50 transition-all text-sm"
          />
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-coral-300 text-center">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl btn-coral text-sm font-semibold tracking-wide disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Tip"}
      </button>

      <p className="text-center text-xs text-navy-400/80 leading-relaxed">
        Anonymous tips welcome — confirmable is better. By submitting, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-coral-300">Terms</Link> and{" "}
        <Link href="/privacy" className="underline hover:text-coral-300">Privacy Policy</Link>.
      </p>
    </form>
  );
}
