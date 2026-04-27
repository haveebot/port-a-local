"use client";

import { useState } from "react";

const HOURLY_RATE_CENTS = 10000;
const MIN_HOURS = 1;
const SQFT_PER_HOUR = 1000;

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sqftStr, setSqftStr] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("flexible");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sqft = Number(sqftStr);
  const hours = sqft > 0 ? estimateHours(sqft) : 0;
  const totalCents = hours * HOURLY_RATE_CENTS;

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    email.includes("@") &&
    address.trim().length > 5 &&
    sqft >= 200 &&
    sqft <= 20000;

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
          propertySqft: sqft,
          preferredDate: preferredDate.trim() || undefined,
          preferredTime,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Booking failed.");
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

  return (
    <form
      onSubmit={submit}
      className="bg-sand-50 border border-sand-200 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* PROPERTY */}
      <div className="space-y-3">
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
            Square footage *
          </label>
          <input
            value={sqftStr}
            onChange={(e) => setSqftStr(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="2000"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm font-mono focus:border-coral-400 focus:outline-none"
            required
          />
          <p className="text-[11px] text-navy-500 mt-1 font-light">
            We round up to the nearest half-hour. ~1 hr per 1,000 sqft.
          </p>
        </div>
      </div>

      {/* LIVE QUOTE */}
      {sqft > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
            Estimated total
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-sm text-navy-700">
              {hours} hour{hours === 1 ? "" : "s"} × {fmt(HOURLY_RATE_CENTS)}
            </span>
            <span className="font-mono font-bold tabular-nums text-emerald-800">
              {fmt(totalCents)}
            </span>
          </div>
          <p className="text-[11px] text-navy-500 font-light italic">
            Pay this now via Stripe. Hours estimated from sqft; actual job
            sized by our team. Anything beyond standard scope (deep
            cleans, post-storm, etc.) → email hello@ for custom quote.
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
          ? "Starting checkout…"
          : sqft > 0
            ? `Book + pay ${fmt(totalCents)} →`
            : "Book + pay →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        Secure payment via Stripe. We&apos;ll text/email to confirm
        timing within a day.
      </p>
    </form>
  );
}
