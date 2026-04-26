"use client";

import { useState } from "react";

export default function RunnerSignupForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<
    "already-active" | "pending-review" | "previously-rejected" | null
  >(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [availability, setAvailability] = useState("");
  const [why, setWhy] = useState("");
  const [insuranceCarrier, setInsuranceCarrier] = useState("");
  const [licenseAcknowledged, setLicenseAcknowledged] = useState(false);
  const [insuranceAcknowledged, setInsuranceAcknowledged] = useState(false);
  const [photosAcknowledged, setPhotosAcknowledged] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/deliver/runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          vehicle: vehicle.trim(),
          availability: availability.trim(),
          why: why.trim(),
          insuranceCarrier: insuranceCarrier.trim(),
          licenseAcknowledged,
          insuranceAcknowledged,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.status) {
          setDuplicate(data.status);
        } else {
          setError(data.error ?? "Could not submit.");
        }
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <p className="font-display text-xl font-bold text-emerald-900 mb-2">
          Got it.
        </p>
        <p className="text-sm text-emerald-800">
          We&apos;ll text or call you within a day or two for a quick fit
          chat. If you don&apos;t hear from us, drop a note to{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-emerald-400 hover:text-emerald-700"
          >
            hello@theportalocal.com
          </a>
          .
        </p>
      </div>
    );
  }

  if (duplicate === "already-active") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="font-display text-xl font-bold text-amber-900 mb-2">
          You&apos;re already on the team.
        </p>
        <p className="text-sm text-amber-900 mb-4">
          That phone is already active in our runner roster. Use the lookup
          page to get your on-duty toggle and Stripe payouts links emailed
          to you again.
        </p>
        <a
          href="/deliver/driver/lookup"
          className="inline-block px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600"
        >
          Find my driver links →
        </a>
      </div>
    );
  }

  if (duplicate === "pending-review") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="font-display text-xl font-bold text-amber-900 mb-2">
          We&apos;ve got you.
        </p>
        <p className="text-sm text-amber-900 mb-4">
          That phone already has an application in. Give us a day or two
          to get back to you. If you&apos;ve lost your follow-up email,
          ping{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-amber-400 hover:text-amber-700"
          >
            hello@theportalocal.com
          </a>
          .
        </p>
      </div>
    );
  }

  if (duplicate === "previously-rejected") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="font-display text-xl font-bold text-red-900 mb-2">
          Hold up
        </p>
        <p className="text-sm text-red-900">
          There was an issue with a prior application from this phone.
          Email{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-red-400 hover:text-red-700"
          >
            hello@theportalocal.com
          </a>{" "}
          so we can sort it out together.
        </p>
      </div>
    );
  }

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    insuranceCarrier.trim().length > 1 &&
    licenseAcknowledged &&
    insuranceAcknowledged &&
    photosAcknowledged;

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-sand-200 rounded-xl p-5 space-y-4"
    >
      <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
        Sign up
      </p>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Phone
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="(361) 555-0100"
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
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
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Vehicle
        </label>
        <input
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          placeholder="2018 Ford Ranger / Golf cart / etc."
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          When are you usually free?
        </label>
        <input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="Weekend evenings · summer most days"
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Why PAL? (optional)
        </label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          placeholder="Local for X years · already drive for Y · trying to make beach money..."
        />
      </div>

      {/* License + insurance attestation block. We ASK runners to keep
          a current license + active insurance — language stays
          "we ask"/"we encourage" to keep the gig-worker boundary clean
          (saying "you must" reads as employer-employee). Verification
          happens via emailed photos after submit, not file upload. */}
      <div className="border-t border-sand-200 pt-4 mt-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-1">
          License + insurance
        </p>
        <p className="text-xs text-navy-600 mb-3 leading-relaxed">
          We ask all runners to keep a current driver&apos;s license and
          active auto insurance. We&apos;ll verify with a quick photo email
          once before you take orders.
        </p>

        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Insurance carrier
        </label>
        <input
          value={insuranceCarrier}
          onChange={(e) => setInsuranceCarrier(e.target.value)}
          placeholder="State Farm · Geico · USAA · Progressive..."
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none mb-3"
          required
        />

        <label className="flex items-start gap-2.5 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={licenseAcknowledged}
            onChange={(e) => setLicenseAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500"
          />
          <span className="text-xs text-navy-700 leading-relaxed">
            I have a current driver&apos;s license valid for driving in
            Texas.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={insuranceAcknowledged}
            onChange={(e) => setInsuranceAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500"
          />
          <span className="text-xs text-navy-700 leading-relaxed">
            My delivery vehicle has active auto insurance.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={photosAcknowledged}
            onChange={(e) => setPhotosAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500"
          />
          <span className="text-xs text-navy-700 leading-relaxed">
            After submitting, I&apos;ll email a photo of my license + my
            insurance card to{" "}
            <a
              href="mailto:hello@theportalocal.com?subject=Runner%20verification"
              className="font-bold text-coral-600 underline decoration-coral-300"
            >
              hello@theportalocal.com
            </a>{" "}
            so PAL can verify before my first run.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full px-4 py-3 rounded-lg font-bold bg-coral-500 text-white hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Sign me up →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        We answer real humans. No automated emails.
      </p>
    </form>
  );
}
