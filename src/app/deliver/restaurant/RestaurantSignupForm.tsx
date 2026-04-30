"use client";

import { useState } from "react";

export default function RestaurantSignupForm() {
  const [restaurantName, setRestaurantName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hoursSummary, setHoursSummary] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [posSystem, setPosSystem] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAcknowledged, setTermsAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid =
    restaurantName.trim().length > 1 &&
    contactName.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    address.trim().length > 5 &&
    termsAcknowledged;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/deliver/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          contactName: contactName.trim(),
          contactRole: contactRole.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          hoursSummary: hoursSummary.trim(),
          menuUrl: menuUrl.trim(),
          posSystem: posSystem.trim(),
          notes: notes.trim(),
          termsAcknowledged,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Could not submit.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <p className="font-display text-2xl font-bold text-emerald-900 mb-2">
          Got it.
        </p>
        <p className="text-sm text-emerald-800 leading-relaxed mb-4">
          We&apos;ll review and reach out within a day or two for a fit
          chat. If you don&apos;t hear from us, drop a note to{" "}
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
      <div className="space-y-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Your restaurant
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Restaurant name *
          </label>
          <input
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Address *
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="234 Beach Rd, Port Aransas, TX 78373"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Hours
          </label>
          <input
            value={hoursSummary}
            onChange={(e) => setHoursSummary(e.target.value)}
            placeholder="Mon–Sat 11–9 · Sun 11–3 · closed Tuesdays, etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Contact
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Your name *
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Your role
            </label>
            <input
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="Owner · GM · Manager..."
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Menu + order tech
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Menu URL
          </label>
          <input
            value={menuUrl}
            onChange={(e) => setMenuUrl(e.target.value)}
            type="url"
            placeholder="https://yourrestaurant.com/menu — or leave blank, we'll digitize from a photo"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            POS / order system
          </label>
          <input
            value={posSystem}
            onChange={(e) => setPosSystem(e.target.value)}
            placeholder="Toast · Square · Clover · paper tickets · etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
          <p className="text-[11px] text-navy-500 mt-1 font-light">
            How orders land at your restaurant today. Helps us match the
            right ticket-routing approach.
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-sand-200 pt-4">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Anything else (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Special handling for fragile dishes · seasonal hours · alcohol licenses · anything we should know..."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 rounded-lg p-4 mt-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-navy-700 mb-2">
          PAL standards
        </p>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAcknowledged}
            onChange={(e) => setTermsAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500"
          />
          <span className="text-xs text-navy-800 leading-relaxed">
            I&apos;m 18 or older and I represent a licensed,
            properly-permitted food-service operation in good standing.
          </span>
        </label>
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
        {submitting ? "Submitting…" : "Apply →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        Free to apply. No commission. No subscription. Real humans
        review every application.
      </p>
    </form>
  );
}
