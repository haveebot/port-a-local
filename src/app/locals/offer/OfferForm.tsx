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

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    mode !== "" &&
    category !== "" &&
    description.trim().length > 10;

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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <p className="font-display text-xl font-bold text-emerald-900 mb-2">
          Got it.
        </p>
        <p className="text-sm text-emerald-800">
          Winston will text or call within a day or two for a quick fit
          check, then your listing goes up. If you don&apos;t hear from us,
          ping (361) 428-1706.
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
