"use client";

import { useState } from "react";

type Handoff = "delivery" | "pickup" | "both";

export default function VendorSignupForm() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fleetSummary, setFleetSummary] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [handoff, setHandoff] = useState<Handoff>("delivery");
  const [insuranceCarrier, setInsuranceCarrier] = useState("");
  const [pricingApproach, setPricingApproach] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAcknowledged, setTermsAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid =
    businessName.trim().length > 1 &&
    contactName.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    fleetSummary.trim().length > 10 &&
    termsAcknowledged;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/rent/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          fleetSummary: fleetSummary.trim(),
          serviceArea: serviceArea.trim(),
          handoff,
          insuranceCarrier: insuranceCarrier.trim(),
          pricingApproach: pricingApproach.trim(),
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
      className="bg-white border border-sand-200 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      <div className="space-y-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Your business
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Business name *
          </label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Island Carts Co."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Your name *
          </label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Owner / dispatcher / whoever picks up the phone"
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            required
          />
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
          Your fleet
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Fleet summary *
          </label>
          <textarea
            value={fleetSummary}
            onChange={(e) => setFleetSummary(e.target.value)}
            rows={4}
            placeholder="How many carts, sizes (4-pass / 6-pass / 8-pass), age + condition, anything special — lifted, audio, etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Service area
          </label>
          <input
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            placeholder="Port Aransas only · Mustang Island + Aransas Pass · etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-2">
            Handoff
          </label>
          <div className="grid grid-cols-3 gap-2">
            <HandoffButton
              active={handoff === "delivery"}
              onClick={() => setHandoff("delivery")}
              label="Delivery"
              detail="To the customer"
            />
            <HandoffButton
              active={handoff === "pickup"}
              onClick={() => setHandoff("pickup")}
              label="Pickup"
              detail="At your shop"
            />
            <HandoffButton
              active={handoff === "both"}
              onClick={() => setHandoff("both")}
              label="Both"
              detail="Either way"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-sand-200 pt-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Logistics
        </p>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Insurance carrier
          </label>
          <input
            value={insuranceCarrier}
            onChange={(e) => setInsuranceCarrier(e.target.value)}
            placeholder="State Farm · Progressive · Geico · etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
          <p className="text-[11px] text-navy-500 mt-1 font-light">
            Just the carrier name. We don&apos;t need the policy doc to apply.
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Your daily / weekly rates
          </label>
          <textarea
            value={pricingApproach}
            onChange={(e) => setPricingApproach(e.target.value)}
            rows={2}
            placeholder="$120/day for 4-pass · $160 for 6-pass · weekly rate $700, etc."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Anything else (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Off-season availability · special handling · payment preferences..."
            className="w-full px-3 py-2.5 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          />
        </div>
      </div>

      <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 mt-2">
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
            I&apos;m 18 or older and I represent a legitimate, properly
            insured cart-rental operation. Carts I list are road-legal,
            registered, and in good working order.
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
        Free to apply. No subscription. No commission. Real humans review every application.
      </p>
    </form>
  );
}

function HandoffButton({
  active,
  onClick,
  label,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-3 py-3 rounded-lg border-2 border-coral-500 bg-coral-50 text-navy-900 font-bold text-sm transition-all"
          : "px-3 py-3 rounded-lg border-2 border-sand-300 bg-white text-navy-700 font-medium text-sm hover:border-coral-300 transition-all"
      }
    >
      {label}
      <span className="block text-[11px] text-navy-500 font-light mt-0.5 normal-case">
        {detail}
      </span>
    </button>
  );
}
