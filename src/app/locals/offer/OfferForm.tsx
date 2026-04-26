"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, type ListingMode, type LocalsCategory } from "@/data/locals-types";

export default function OfferForm() {
  const search = useSearchParams();
  const presetMode = search.get("mode") as ListingMode | null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [mode, setMode] = useState<ListingMode | "">(presetMode ?? "");
  const [category, setCategory] = useState<LocalsCategory | "">("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");
  const [photosAcknowledged, setPhotosAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presetMode) setMode(presetMode);
  }, [presetMode]);

  // Reset category when mode changes (different category lists per mode)
  useEffect(() => {
    setCategory("");
  }, [mode]);

  // For "rent" mode (stuff), photos are required so customers can see
  // what they're requesting. For "hire" mode (skills), photos are
  // optional — a description of the work is usually enough.
  const photosRequired = mode === "rent";

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    mode !== "" &&
    category !== "" &&
    description.trim().length > 10 &&
    (!photosRequired || photosAcknowledged);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/locals/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          businessName: businessName.trim(),
          mode,
          category,
          description: description.trim(),
          pricing: pricing.trim(),
          availability: availability.trim(),
          photosAcknowledged,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit.");
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <p className="font-display text-xl font-bold text-emerald-900 mb-2 text-center">
          Got it.
        </p>
        <p className="text-sm text-emerald-800 text-center mb-4">
          We&apos;ll text or call within a day or two for a quick fit check,
          then your listing goes up.
        </p>
        {photosRequired && (
          <div className="bg-white border border-emerald-300 rounded-lg p-4 mt-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-1">
              Send photos →
            </p>
            <p className="text-sm text-navy-800 leading-relaxed">
              Email a few photos of your{" "}
              {category ? CATEGORIES.find((c) => c.id === category)?.label.toLowerCase() : "listing"}{" "}
              to{" "}
              <a
                href={`mailto:hello@theportalocal.com?subject=${encodeURIComponent("Locals listing photos — " + (businessName || name))}`}
                className="font-bold text-coral-600 underline decoration-coral-300"
              >
                hello@theportalocal.com
              </a>
              . Wide shot + a couple detail shots is plenty. Subject line
              auto-filled when you tap the link.
            </p>
          </div>
        )}
        <p className="text-xs text-emerald-700 text-center mt-4">
          If you don&apos;t hear from us, drop a note to{" "}
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

  const filteredCategories = mode
    ? CATEGORIES.filter((c) => c.mode === mode)
    : [];

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-sand-200 rounded-xl p-5 space-y-4"
    >
      <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
        Submit your listing
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
          Business name (if any)
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="optional"
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Phone
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
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          What kind of listing?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("rent")}
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
            onClick={() => setMode("hire")}
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
            Category
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as LocalsCategory | "")
            }
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
        </div>
      )}

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Describe what you offer
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What it is, what makes it good, how long you've been doing it…"
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
          Pricing (rough range OK)
        </label>
        <input
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
          placeholder="$80/half-day · $40 per session · $25/hour"
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
          placeholder="Weekends · summer only · evenings"
          className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
        />
      </div>

      {/* Photo attestation. Required for "rent" listings (customers
          need to see what they're requesting). Optional for "hire"
          listings (a service description usually carries it).
          Photos themselves are emailed to hello@ — we don't host
          uploads in-app at v1. Same low-friction "photo to feature"
          pattern as runner verification + Live Music intake. */}
      {mode === "rent" && (
        <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mt-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-700 mb-2">
            Photos
          </p>
          <p className="text-xs text-navy-700 mb-3 leading-relaxed">
            Customers want to see what they&apos;re renting before they
            request it. After submitting, email a few photos of your
            listing — wide shot + a couple detail shots is plenty.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={photosAcknowledged}
              onChange={(e) => setPhotosAcknowledged(e.target.checked)}
              className="mt-0.5 shrink-0 accent-coral-500"
            />
            <span className="text-xs text-navy-800 leading-relaxed">
              I&apos;ll email photos of my listing to{" "}
              <a
                href="mailto:hello@theportalocal.com?subject=Locals%20listing%20photos"
                className="font-bold text-coral-600 underline decoration-coral-300"
              >
                hello@theportalocal.com
              </a>{" "}
              after submitting so PAL can post it live.
            </span>
          </label>
        </div>
      )}

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
        {submitting ? "Submitting…" : "Submit listing →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        We answer real humans. Vetting is fast.
      </p>
    </form>
  );
}
