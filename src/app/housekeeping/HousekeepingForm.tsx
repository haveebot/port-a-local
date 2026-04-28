"use client";

import { useState } from "react";

const HOURLY_RATE_CENTS = 10000;
const EMERGENCY_FEE_CENTS = 5000;
const MIN_HOURS = 1;
const SQFT_PER_HOUR = 1000;

type Mode = "pay" | "quote";

function estimateHours(sqft: number): number {
  if (!Number.isFinite(sqft) || sqft <= 0) return 0;
  const raw = sqft / SQFT_PER_HOUR;
  const rounded = Math.ceil(raw * 2) / 2;
  return Math.max(MIN_HOURS, rounded);
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function HousekeepingForm() {
  const [mode, setMode] = useState<Mode>("pay");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sqftStr, setSqftStr] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("flexible");
  const [notes, setNotes] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const sqft = Number(sqftStr);
  const hours = sqft > 0 ? estimateHours(sqft) : 0;
  const baseCents = hours * HOURLY_RATE_CENTS;
  const emergencyCents = mode === "pay" && emergency ? EMERGENCY_FEE_CENTS : 0;
  const totalCents = baseCents + emergencyCents;

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    email.includes("@") &&
    address.trim().length > 5 &&
    (mode === "quote" || (sqft >= 200 && sqft <= 20000));

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim(),
          propertyAddress: address.trim(),
          propertySqft: mode === "pay" ? sqft : sqft || undefined,
          preferredDate: preferredDate.trim() || undefined,
          preferredTime,
          notes: notes.trim() || undefined,
          mode,
          emergency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Booking failed.");
        setSubmitting(false);
        return;
      }
      if (mode === "quote") {
        setQuoteSubmitted(true);
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErr("No checkout URL returned.");
        setSubmitting(false);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  if (quoteSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <p className="font-display text-2xl font-bold text-emerald-900 mb-2">
          Got your request.
        </p>
        <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
          We&apos;ll review the scope and email you a quote — usually within
          a day. No payment yet — you only pay once we&apos;ve agreed on
          the job.
        </p>
        <p className="text-xs text-emerald-700 leading-relaxed">
          Anything urgent?{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-emerald-400 hover:text-emerald-900"
          >
            hello@theportalocal.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-sand-50 border border-sand-200 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* MODE TOGGLE — pay-now vs request-a-quote */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
          How would you like to book?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("pay")}
            className={
              mode === "pay"
                ? "px-3 py-3 rounded-lg border-2 border-coral-500 bg-coral-50 text-navy-900 font-bold text-sm transition-all"
                : "px-3 py-3 rounded-lg border-2 border-sand-300 bg-white text-navy-700 font-medium text-sm hover:border-coral-300 transition-all"
            }
          >
            Pay now
            <span className="block text-[11px] text-navy-500 font-light mt-0.5 normal-case">
              Stripe checkout · live price
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("quote")}
            className={
              mode === "quote"
                ? "px-3 py-3 rounded-lg border-2 border-coral-500 bg-coral-50 text-navy-900 font-bold text-sm transition-all"
                : "px-3 py-3 rounded-lg border-2 border-sand-300 bg-white text-navy-700 font-medium text-sm hover:border-coral-300 transition-all"
            }
          >
            Request a quote
            <span className="block text-[11px] text-navy-500 font-light mt-0.5 normal-case">
              Custom scope · pay after
            </span>
          </button>
        </div>
        {mode === "quote" && (
          <p className="text-[11px] text-navy-500 font-light mt-2 leading-relaxed">
            Best for deep cleans, post-storm, multi-day, or anything
            outside the standard $100/hr scope. We&apos;ll email a custom
            quote — pay after we agree on the job.
          </p>
        )}
      </div>

      {/* PROPERTY */}
      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          The property
        </p>

        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Address *
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="1234 Beach Access Rd, Port Aransas"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Square footage {mode === "pay" ? "*" : "(rough estimate)"}
          </label>
          <input
            value={sqftStr}
            onChange={(e) => setSqftStr(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="2000"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm font-mono focus:border-coral-400 focus:outline-none"
            required={mode === "pay"}
          />
          <p className="text-[11px] text-navy-500 mt-1 font-light">
            {mode === "pay"
              ? "We round up to the nearest half-hour. ~1 hr per 1,000 sqft."
              : "Optional. Helps us scope the quote — leave blank if unsure."}
          </p>
        </div>
      </div>

      {/* EMERGENCY / QUICK-TURNAROUND TOGGLE — pay mode only */}
      {mode === "pay" && (
        <label className="flex items-start gap-3 cursor-pointer bg-coral-50 border border-coral-200 rounded-xl p-4">
          <input
            type="checkbox"
            checked={emergency}
            onChange={(e) => setEmergency(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500 w-4 h-4"
          />
          <div>
            <p className="text-sm font-bold text-navy-900">
              Need it within 24 hours?{" "}
              <span className="font-mono text-coral-700">+{fmt(EMERGENCY_FEE_CENTS)}</span>
            </p>
            <p className="text-[11px] text-navy-600 font-light mt-0.5 leading-relaxed">
              Emergency / quick-turnaround surcharge. Bumps your booking
              to the front of the dispatch queue. We&apos;ll text to
              confirm timing the same day.
            </p>
          </div>
        </label>
      )}

      {/* LIVE QUOTE — pay mode only (quote mode shows a different note) */}
      {mode === "pay" && sqft > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
            Estimated total
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className="text-sm text-navy-700">
              {hours} hour{hours === 1 ? "" : "s"} × {fmt(HOURLY_RATE_CENTS)}
            </span>
            <span className="font-mono tabular-nums text-navy-700">
              {fmt(baseCents)}
            </span>
          </div>
          {emergency && (
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <span className="text-sm text-navy-700">
                + Emergency / quick-turnaround
              </span>
              <span className="font-mono tabular-nums text-navy-700">
                {fmt(EMERGENCY_FEE_CENTS)}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-2 border-t border-emerald-200 pt-1.5 mt-1.5">
            <span className="text-sm font-bold text-navy-900">
              Total today
            </span>
            <span className="font-mono font-bold tabular-nums text-emerald-800">
              {fmt(totalCents)}
            </span>
          </div>
          <p className="text-[11px] text-navy-600 font-light mt-3 leading-relaxed">
            <strong className="text-navy-800">Heads up:</strong> hours are
            estimated from your sqft. If our team finds the actual scope
            (heavier soil, additional rooms, post-storm conditions, larger
            footprint than declared) takes longer, you&apos;ll be billed
            for the additional time at the same {fmt(HOURLY_RATE_CENTS)}/hr
            rate. We&apos;ll text before adding any time. For deep cleans,
            move-out, or post-storm — switch to <em>Request a quote</em>{" "}
            so we price the whole job upfront.
          </p>
        </div>
      )}

      {/* PREFERRED TIMING */}
      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          When
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Preferred date
            </label>
            <input
              type="date"
              min={minDate}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Preferred time
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm bg-white focus:border-coral-400 focus:outline-none"
            >
              <option value="flexible">Flexible</option>
              <option value="morning">Morning (9am-12pm)</option>
              <option value="afternoon">Afternoon (12pm-5pm)</option>
            </select>
          </div>
        </div>
        <p className="text-[11px] text-navy-500 font-light">
          We&apos;ll text or email to confirm exact timing.
        </p>
      </div>

      {/* CONTACT */}
      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          You
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Phone *
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="(361) ..."
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Email *
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Gate codes · pets · linens · areas to focus on · key location..."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          />
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full py-4 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:bg-coral-500/50 disabled:cursor-not-allowed"
      >
        {submitting
          ? mode === "quote"
            ? "Submitting…"
            : "Starting checkout…"
          : mode === "quote"
            ? "Request a quote →"
            : sqft > 0
              ? `Book + pay ${fmt(totalCents)} →`
              : "Book + pay →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        {mode === "quote"
          ? "No payment required to request — we'll quote the scope and follow up by email."
          : "Secure payment via Stripe. We'll text/email to confirm timing within a day."}
      </p>
    </form>
  );
}
