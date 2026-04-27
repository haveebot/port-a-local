"use client";

import { useState } from "react";

const CATEGORY_OPTIONS = [
  // Rent
  { id: "kayak", label: "Kayak", mode: "rent" as const },
  { id: "paddleboard", label: "Paddleboard", mode: "rent" as const },
  { id: "bike", label: "Bike", mode: "rent" as const },
  { id: "fishing-gear", label: "Fishing gear", mode: "rent" as const },
  { id: "beach-gear", label: "Beach gear", mode: "rent" as const },
  { id: "tools", label: "Tools / equipment", mode: "rent" as const },
  { id: "other-rent", label: "Other rental", mode: "rent" as const },
  // Hire
  { id: "fishing-charter", label: "Fishing charter", mode: "hire" as const },
  { id: "surf-lesson", label: "Surf lesson", mode: "hire" as const },
  { id: "photography", label: "Photography", mode: "hire" as const },
  { id: "art-lesson", label: "Art / craft lesson", mode: "hire" as const },
  { id: "lawn-care", label: "Lawn care", mode: "hire" as const },
  { id: "pet-services", label: "Pet sitting / walking", mode: "hire" as const },
  { id: "other-hire", label: "Other service", mode: "hire" as const },
];

export default function LocalsResendForm() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"rent" | "hire" | "">("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");
  const [photosAcknowledged, setPhotosAcknowledged] = useState(true);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filteredCategories = mode
    ? CATEGORY_OPTIONS.filter((c) => c.mode === mode)
    : [];

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    !!mode &&
    !!category &&
    description.trim().length > 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/wheelhouse/locals/resend-offer-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          mode,
          category,
          description: description.trim(),
          pricing: pricing.trim() || undefined,
          availability: availability.trim() || undefined,
          photosAcknowledged,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Failed to send.");
      } else {
        setSuccess(
          `Admin email fired ✓  Offer ID: ${data.offerId}. Check admin@/hello@ in a few seconds.`,
        );
        // Optional: clear form. Leaving values in case Winston wants to
        // re-send (e.g., if the first send fails for whatever reason).
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-sm text-emerald-900">
          {success}
        </div>
      )}
      {err && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Name *
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
            Business name
          </label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="optional"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
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
            placeholder="optional"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Listing kind *
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("rent");
              setCategory("");
            }}
            className={
              mode === "rent"
                ? "flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50"
                : "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-sand-300 text-navy-700 hover:border-navy-400"
            }
          >
            Rent (stuff)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("hire");
              setCategory("");
            }}
            className={
              mode === "hire"
                ? "flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50"
                : "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-sand-300 text-navy-700 hover:border-navy-400"
            }
          >
            Hire (skills)
          </button>
        </div>
      </div>

      {mode && (
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none bg-white"
            required
          >
            <option value="">Pick one</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-navy-500 mt-1 italic">
            If the right category isn&apos;t here, pick "Other" and add the
            specific kind in the description.
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Description * (paste from original email)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Pricing
          </label>
          <input
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            placeholder="$80/half-day · $40/session"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Availability
          </label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Weekends · summer only"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
      </div>

      {mode === "rent" && (
        <label className="flex items-start gap-2.5 cursor-pointer bg-coral-50 border border-coral-200 rounded-lg p-3">
          <input
            type="checkbox"
            checked={photosAcknowledged}
            onChange={(e) => setPhotosAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0 accent-coral-500"
          />
          <span className="text-xs text-navy-800 leading-relaxed">
            Photos acknowledged — applicant said they&apos;d email photos to
            hello@. (Default ✓ true; uncheck if they didn&apos;t commit to
            photos.)
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={!valid || busy}
        className="w-full py-3 rounded-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
      >
        {busy ? "Sending…" : "Re-fire admin email →"}
      </button>

      <p className="text-[11px] text-navy-500 text-center font-light">
        Sends to admin@ + hello@ with the magic-link buttons. Does NOT
        email the applicant.
      </p>
    </form>
  );
}
