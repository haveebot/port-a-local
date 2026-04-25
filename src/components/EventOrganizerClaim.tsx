"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import PortalIcon from "@/components/brand/PortalIcon";

type Status = "idle" | "loading" | "success" | "error";

const ROLES = [
  { value: "organizer", label: "Event organizer" },
  { value: "co-organizer", label: "Co-organizer / committee" },
  { value: "host", label: "Host venue" },
  { value: "sponsor", label: "Sponsor" },
  { value: "press", label: "Press / media" },
  { value: "vendor", label: "Vendor / participant" },
  { value: "other", label: "Other" },
];

export default function EventOrganizerClaim({
  eventSlug,
  eventName,
}: {
  eventSlug: string;
  eventName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("organizer");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10 || name.trim().length < 2 || !email.includes("@")) {
      setErrorMsg("Fill in your name, a real email, and a sentence about what you'd like to discuss.");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/events/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          eventName,
          name: name.trim(),
          email: email.trim(),
          role,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        try {
          track("organizer_claim_submitted", { eventSlug, role });
        } catch {
          // never block UX on analytics errors
        }
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setRole("organizer");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data?.error ?? "Something went wrong. Try again or email hello@theportalocal.com directly.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again or email hello@theportalocal.com directly.");
    }
  };

  return (
    <section className="py-16 bg-navy-900 relative">
      <div className="absolute inset-0 palm-pattern opacity-10" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-coral-400 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Connected to this event?
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 mb-3">
            Are you the organizer? Let&apos;s talk.
          </h2>
          <p className="text-base text-navy-200 font-light leading-relaxed max-w-2xl mx-auto">
            We built this page because Port A&apos;s events deserve real digital
            coverage. If you run, host, sponsor, or cover this event, we want to
            hear from you — corrections, additions, photo feeds, official links,
            collaboration. Whatever&apos;s useful.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-sand-50 border border-sand-200 rounded-2xl p-8 text-center">
            <PortalIcon
              name="handshake"
              className="w-12 h-12 mx-auto mb-3 text-coral-500"
            />
            <h3 className="font-display text-xl font-bold text-navy-900 mb-2">
              Got it — we&apos;ll be in touch.
            </h3>
            <p className="text-sm text-navy-600 font-light leading-relaxed max-w-md mx-auto">
              Your message landed in the {`hello@theportalocal.com`} inbox. We
              read every one and reply within a day or two — usually faster.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setOpen(false);
              }}
              className="mt-6 text-sm font-semibold text-coral-600 hover:text-coral-700 underline decoration-coral-200 hover:decoration-coral-500"
            >
              Done
            </button>
          </div>
        ) : open ? (
          <form
            onSubmit={submit}
            className="bg-sand-50 border border-sand-200 rounded-2xl p-6 sm:p-8 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="claim-name"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
                >
                  Your name
                </label>
                <input
                  id="claim-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="claim-email"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
                >
                  Email
                </label>
                <input
                  id="claim-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="claim-role"
                className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
              >
                Your role
              </label>
              <select
                id="claim-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="claim-message"
                className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
              >
                What would you like to discuss?
              </label>
              <textarea
                id="claim-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-sand-300 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent resize-y"
                placeholder="Corrections to the schedule? Want us at the dock for day-of photos? Have a photo feed we should embed? Just say hi? All of the above is welcome."
              />
              <p className="text-[11px] text-navy-400 mt-1.5 font-light">
                Tell us anything — corrections, additions, partnership ideas, day-of
                logistics, photo feeds, official links, or just a hello.
              </p>
            </div>

            {errorMsg && (
              <p className="text-sm text-coral-600 font-medium">{errorMsg}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 rounded-xl text-sm font-semibold btn-coral disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending…" : "Send to PAL"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-navy-500 hover:text-navy-700"
              >
                Cancel
              </button>
              <span className="text-[11px] text-navy-400 font-light ml-auto">
                Lands in {`hello@theportalocal.com`} · we read every one
              </span>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setOpen(true)}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-coral inline-flex items-center gap-2"
            >
              Reach out about this event
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
            <p className="text-xs text-navy-400 font-light mt-4">
              Or email us directly:{" "}
              <a
                href="mailto:hello@theportalocal.com"
                className="text-coral-400 hover:text-coral-300 underline decoration-coral-500/30 hover:decoration-coral-400"
              >
                hello@theportalocal.com
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
