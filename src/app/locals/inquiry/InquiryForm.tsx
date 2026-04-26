"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, type LocalsCategory } from "@/data/locals-types";

export default function InquiryForm() {
  const search = useSearchParams();
  const presetCat = search.get("cat") as LocalsCategory | null;
  const presetListing = search.get("listing");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<LocalsCategory | "">(
    presetCat ?? "",
  );
  const [details, setDetails] = useState("");
  const [when, setWhen] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presetCat) setCategory(presetCat);
  }, [presetCat]);

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    details.trim().length > 4;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/locals/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          category: category || undefined,
          listingId: presetListing ?? undefined,
          details: details.trim(),
          when: when.trim() || undefined,
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <p className="font-display text-xl font-bold text-emerald-900 mb-2">
            Got it.
          </p>
          <p className="text-sm text-emerald-800">
            We&apos;ll text or call you within a day. If we already know the
            right person, you&apos;ll hear from them directly. If not, we&apos;ll
            find one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4"
    >
      <div className="bg-white border border-sand-200 rounded-xl p-5 space-y-4">
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
            Email (optional)
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
            What do you need?
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as LocalsCategory | "")
            }
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none bg-white"
          >
            <option value="">Pick a category</option>
            <optgroup label="Rent">
              {CATEGORIES.filter((c) => c.mode === "rent").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Hire">
              {CATEGORIES.filter((c) => c.mode === "hire").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="What you need, how many, any specifics. Address optional."
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            When? (optional)
          </label>
          <input
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="Saturday morning · this weekend · ASAP"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
          />
        </div>

        {presetListing && (
          <p className="text-[11px] text-navy-500 font-light">
            Inquiring about listing <code className="font-mono">{presetListing}</code>
          </p>
        )}
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
        {submitting ? "Sending…" : "Send to PAL →"}
      </button>

      <p className="text-[11px] text-navy-500 font-light text-center">
        We answer real humans. No automated emails.
      </p>
    </form>
  );
}
