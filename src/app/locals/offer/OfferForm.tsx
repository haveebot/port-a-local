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
  // Sell-mode only
  const [sellPriceDollars, setSellPriceDollars] = useState("");
  const [fulfillmentNote, setFulfillmentNote] = useState("");
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

  // Photos required for "rent" + "sell" (customers see the thing
  // before requesting/buying). For "hire" (skills), photos are
  // optional — a description of the work usually carries it.
  const photosRequired = mode === "rent" || mode === "sell";
  // Sell mode requires a real price + fulfillment plan
  const sellPriceCents = sellPriceDollars
    ? Math.round(parseFloat(sellPriceDollars) * 100)
    : 0;
  const sellModeValid =
    mode !== "sell" ||
    (sellPriceCents >= 100 &&
      sellPriceCents <= 1_000_000 &&
      fulfillmentNote.trim().length > 5);

  const valid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    mode !== "" &&
    category !== "" &&
    description.trim().length > 10 &&
    (!photosRequired || photosAcknowledged) &&
    sellModeValid;

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
          ...(mode === "sell"
            ? {
                priceCents: sellPriceCents,
                fulfillmentNote: fulfillmentNote.trim(),
              }
            : {}),
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
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMode("rent")}
            className={
              mode === "rent"
                ? "px-3 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50"
                : "px-3 py-2.5 rounded-lg text-sm font-semibold border border-sand-300 text-navy-700 hover:border-navy-400"
            }
          >
            Rent
            <span className="block text-[10px] font-light opacity-75 mt-0.5">
              your stuff
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("hire")}
            className={
              mode === "hire"
                ? "px-3 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50"
                : "px-3 py-2.5 rounded-lg text-sm font-semibold border border-sand-300 text-navy-700 hover:border-navy-400"
            }
          >
            Hire
            <span className="block text-[10px] font-light opacity-75 mt-0.5">
              your skills
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("sell")}
            className={
              mode === "sell"
                ? "px-3 py-2.5 rounded-lg text-sm font-bold bg-navy-900 text-sand-50"
                : "px-3 py-2.5 rounded-lg text-sm font-semibold border border-sand-300 text-navy-700 hover:border-navy-400"
            }
          >
            Sell
            <span className="block text-[10px] font-light opacity-75 mt-0.5">
              goods + crafts
            </span>
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

      {/* Sell-mode: real price + fulfillment plan REQUIRED. Hide the
          free-form pricing string for sell mode (we use exact cents). */}
      {mode === "sell" ? (
        <>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 font-mono">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max="10000"
                inputMode="decimal"
                value={sellPriceDollars}
                onChange={(e) => setSellPriceDollars(e.target.value)}
                placeholder="45.00"
                className="w-full pl-8 pr-3 py-2 border border-sand-300 rounded-lg text-sm font-mono focus:border-coral-400 focus:outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-navy-500 mt-1 font-light">
              You keep 100% of this. Customer pays this + 10% PAL platform
              fee on top.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
              How does the customer get it?
            </label>
            <input
              value={fulfillmentNote}
              onChange={(e) => setFulfillmentNote(e.target.value)}
              placeholder="Ship USPS · pickup at studio · meet at marina · free local delivery in PA"
              className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
              required
            />
            <p className="text-[11px] text-navy-500 mt-1 font-light">
              Your call. PAL doesn&apos;t touch the goods — you reach out
              to the buyer directly to coordinate.
            </p>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

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
