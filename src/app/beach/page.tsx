"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PortalIcon from "@/components/brand/PortalIcon";
import MetaPixelEvent from "@/components/MetaPixelEvent";
import { trackInitiateCheckout } from "@/lib/metaPixel";
import {
  BEACH_PRODUCTS,
  BEACH_ADDONS,
  dailyTotalCents,
  type BeachProduct,
} from "@/data/beach-products";

/**
 * Beach product pricing (2026-04-29 — vendor-model rebuild).
 *
 * Catalog lives in @/data/beach-products so checkout, emails, and the
 * vendor-blast SMS all render from the same source of truth.
 *
 * Customer pays the total. Internally split:
 *   - vendorBaseCents: paid out to the beach vendor who claims the booking
 *     (see src/data/beach-vendors.ts)
 *   - palFeeCents: PAL's booking fee, retained on the platform side
 */
function totalDailyPrice(p: BeachProduct): number {
  return dailyTotalCents(p) / 100;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function BeachPage() {
  const today = getTodayStr();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    product: "chairs",
    quantity: "1",
    pickupDate: "",
    returnDate: "",
    deliveryAddress: "",
    smsConsent: false,
  });

  // Add-on selections — slug → qty. Default 0 for all (filtered out at
  // submit time so we only send non-zero add-ons to the API).
  const [addons, setAddons] = useState<Record<string, number>>(
    () => Object.fromEntries(BEACH_ADDONS.map((a) => [a.value, 0])),
  );
  const setAddonQty = (slug: string, qty: number) =>
    setAddons((prev) => ({ ...prev, [slug]: qty }));

  // Single-day setup is the default — matches Bron's pattern (a beach
  // setup is a day, not a "stay"). Multi-day is opt-in via the toggle
  // below the setup-date input.
  const [multiDay, setMultiDay] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedProduct = BEACH_PRODUCTS.find((p) => p.value === form.product)!;
  const qty = parseInt(form.quantity) || 1;

  // INCLUSIVE day count: May 23 → May 24 is 2 days of beach service
  // (Sat setup + Sun setup), not 1 interval-day. Matches the single-day-
  // default mental model where every calendar day is a setup day.
  const numDays = !form.pickupDate
    ? null
    : !multiDay
      ? 1
      : form.returnDate
        ? Math.max(
            1,
            Math.round(
              (new Date(form.returnDate).getTime() -
                new Date(form.pickupDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : null;

  // Daily price math — base product × qty plus each add-on at its own qty.
  // Per-day numbers are integers (cents); convert to USD only at render time.
  const baseDailyCents = dailyTotalCents(selectedProduct) * qty;
  const baseDailyFeeCents = selectedProduct.palFeeCents * qty;
  const addonDailyCents = BEACH_ADDONS.reduce((sum, a) => {
    const q = addons[a.value] || 0;
    return q > 0 ? sum + dailyTotalCents(a) * q : sum;
  }, 0);
  const addonDailyFeeCents = BEACH_ADDONS.reduce((sum, a) => {
    const q = addons[a.value] || 0;
    return q > 0 ? sum + a.palFeeCents * q : sum;
  }, 0);
  const dailyTotalUsd = (baseDailyCents + addonDailyCents) / 100;
  const dailyFeeAllUsd = (baseDailyFeeCents + addonDailyFeeCents) / 100;
  const totalPrice = numDays ? numDays * dailyTotalUsd : null;
  const totalFeeUsd = numDays ? numDays * dailyFeeAllUsd : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupDate) {
      setErrorMsg("Please select a setup date.");
      return;
    }
    if (multiDay && !form.returnDate) {
      setErrorMsg("Please select the last day of your setup.");
      return;
    }
    if (multiDay && new Date(form.returnDate) <= new Date(form.pickupDate)) {
      setErrorMsg("Last day must be after setup date.");
      return;
    }
    if (!form.deliveryAddress.trim()) {
      setErrorMsg("Please enter your setup location (e.g. Sandcastle Drive).");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    // For single-day setups, send returnDate = pickupDate so the API
    // contract stays uniform on the server side (existing email/Stripe
    // code reads both fields).
    const submitReturnDate = multiDay ? form.returnDate : form.pickupDate;

    // Fire Meta Pixel InitiateCheckout BEFORE the Stripe redirect.
    trackInitiateCheckout({
      value: totalPrice ?? 0,
      contentName: selectedProduct.label,
      contentCategory: "beach-booking",
      numItems: qty,
    });

    // Strip 0-qty add-ons before submitting; the API only sees positive
    // selections.
    const submitAddons: Record<string, number> = {};
    for (const [slug, q] of Object.entries(addons)) {
      if (q > 0) submitAddons[slug] = q;
    }

    try {
      const res = await fetch("/api/checkout/beach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          returnDate: submitReturnDate,
          numDays,
          totalPrice,
          qty,
          addons: submitAddons,
          vendorBaseCentsPerDay: selectedProduct.vendorBaseCents,
          palFeeCentsPerDay: selectedProduct.palFeeCents,
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="pt-28 pb-20 hero-gradient relative">
          <div className="absolute bottom-0 left-0 right-0 coral-line" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <PortalIcon name="beach" className="w-20 h-20 mx-auto mb-6 text-coral-400" />
            <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
              Request Received!
            </h1>
            <p className="text-lg text-navy-200 mb-4">
              Your beach setup request is in. Our local team will confirm your
              booking and follow up shortly.
            </p>
            <p className="text-navy-300">
              Check your email for a confirmation. See you on the beach.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <MetaPixelEvent
        event="ViewContent"
        contentName="Beach Setup Booking"
        contentCategory="beach-booking"
      />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/beach-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="flex justify-center mb-4 sm:mb-5">
            <PortalIcon
              name="beach"
              className="w-12 h-12 sm:w-16 sm:h-16 text-navy-900"
            />
          </div>
          <p className="text-sand-50 text-[11px] sm:text-sm font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-5">
            Explore <span className="mx-1">•</span> Beach
          </p>
          <div className="h-0.5 bg-sand-50 max-w-[200px] sm:max-w-md mx-auto" />
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-navy-900 py-5 sm:py-8">
            Beach <span className="italic text-sand-50">Rentals</span>
          </h1>
          <div className="h-0.5 bg-sand-50 max-w-[200px] sm:max-w-md mx-auto" />
          <p className="text-sm sm:text-lg text-sand-50 font-light max-w-xl mx-auto mt-5 sm:mt-6 px-4">
            Show up, we handle the rest.<br />
            Your setup is waiting for you on the sand.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <PortalIcon name="calendar" className="w-9 h-9 mx-auto mb-2 text-navy-900" />
              <p className="font-semibold text-navy-900 text-sm">Book Your Dates</p>
              <p className="text-navy-500 text-sm mt-1">Pick your setup and how many days you need it.</p>
            </div>
            <div>
              <PortalIcon name="check" className="w-9 h-9 mx-auto mb-2 text-navy-900" />
              <p className="font-semibold text-navy-900 text-sm">We Confirm</p>
              <p className="text-navy-500 text-sm mt-1">Our local team locks in your reservation and follows up.</p>
            </div>
            <div>
              <PortalIcon name="sun" className="w-9 h-9 mx-auto mb-2 text-navy-900" />
              <p className="font-semibold text-navy-900 text-sm">Just Show Up</p>
              <p className="text-navy-500 text-sm mt-1">Your setup is ready and waiting when you hit the beach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Product Selection */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Choose Your Setup</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BEACH_PRODUCTS.map((p) => (
                  <label
                    key={p.value}
                    className={`relative flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.product === p.value
                        ? "border-coral-400 bg-coral-50"
                        : "border-sand-200 hover:border-sand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={p.value}
                      checked={form.product === p.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-semibold text-navy-900">{p.label}</span>
                    <span className="text-sm text-navy-500">{p.description}</span>
                    {p.includes && p.includes.length > 0 && (
                      <ul className="text-sm text-navy-500 list-disc pl-5 mt-1 space-y-0.5">
                        {p.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    <span className="text-lg font-bold text-coral-500 mt-1">${totalDailyPrice(p)}<span className="text-sm font-normal text-navy-400"> / day</span></span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Quantity
                </label>
                <select
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} setup{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">Add-ons</h2>
                <p className="text-sm text-navy-500 mt-1">Optional extras to round out your setup. $25 each per day.</p>
              </div>
              <div className="divide-y divide-sand-200">
                {BEACH_ADDONS.map((a) => (
                  <div key={a.value} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-navy-900">{a.label}</p>
                      <p className="text-xs text-navy-500">${dailyTotalCents(a) / 100}/day</p>
                    </div>
                    <select
                      value={addons[a.value] || 0}
                      onChange={(e) => setAddonQty(a.value, parseInt(e.target.value) || 0)}
                      aria-label={`Quantity of ${a.label}`}
                      className="border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates & Location */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Date & Location</h2>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Setup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  required
                  min={today}
                  value={form.pickupDate}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              {!multiDay ? (
                <button
                  type="button"
                  onClick={() => setMultiDay(true)}
                  className="text-sm text-coral-500 hover:text-coral-600 underline underline-offset-2"
                >
                  + Need a setup for multiple days?
                </button>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Last Day *
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      required
                      min={form.pickupDate || today}
                      value={form.returnDate}
                      onChange={handleChange}
                      className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMultiDay(false);
                      setForm({ ...form, returnDate: "" });
                    }}
                    className="text-sm text-navy-500 hover:text-navy-700 underline underline-offset-2"
                  >
                    ← Single day instead
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Setup Location *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  required
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="e.g. Sandcastle Drive or Ave G access road"
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              {totalPrice && numDays && (
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                  <div className="space-y-1 text-sm text-navy-700">
                    <div className="flex justify-between items-baseline gap-x-4">
                      <span className="text-navy-500">{qty} × {selectedProduct.label}</span>
                      <span className="whitespace-nowrap">${(baseDailyCents / 100).toLocaleString()}/day</span>
                    </div>
                    {BEACH_ADDONS.map((a) => {
                      const q = addons[a.value] || 0;
                      if (q < 1) return null;
                      return (
                        <div key={a.value} className="flex justify-between items-baseline gap-x-4">
                          <span className="text-navy-500">{q} × {a.label}</span>
                          <span className="whitespace-nowrap">${((dailyTotalCents(a) * q) / 100).toLocaleString()}/day</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-sand-300 mt-2 pt-2 flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 text-sm">
                    <span className="text-navy-500">${dailyTotalUsd.toLocaleString()}/day × {numDays} day{numDays !== 1 ? "s" : ""}</span>
                    <span className="font-semibold whitespace-nowrap">${totalPrice.toLocaleString()} total</span>
                  </div>
                  <p className="text-[11px] text-navy-400 mt-2">
                    Includes ${dailyFeeAllUsd.toLocaleString()}/day PAL booking fee (${totalFeeUsd.toLocaleString()} total). Vendor receives ${((totalPrice - totalFeeUsd)).toLocaleString()} total.
                  </p>
                  <p className="text-xs text-navy-400 mt-2">
                    Charged at checkout via Stripe. Vendor confirms setup details ahead of your arrival date.
                  </p>
                </div>
              )}

              {/* Cancellation policy — locked 2026-04-29. 72 hours before setup
                  date is the cut-off (matches industry standard for beach setup
                  / concierge services on the customer-friendly end). After that
                  point, vendor has held the slot and PAL releases the vendor
                  portion of the payment. Late bookings (made within 72 hours
                  of setup) are non-refundable from the start. */}
              <div className="bg-white border border-sand-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-navy-900 mb-1">Cancellation policy</p>
                <p className="text-navy-700 leading-relaxed">
                  Free cancellation up to <strong>72 hours before your setup date</strong>.
                  After that, the booking is non-refundable — your local vendor has held the slot.
                  Bookings made within 72 hours of the setup date are non-refundable from the start.
                </p>
                <p className="text-[11px] text-navy-400 mt-2">
                  To cancel: reply to your booking confirmation email or contact
                  hello@theportalocal.com.
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Your Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(361) 555-0000"
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}

            <label className="flex items-start gap-2.5 text-sm text-navy-600 bg-sand-50 border border-sand-200 rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                name="smsConsent"
                checked={form.smsConsent}
                onChange={(e) => setForm({ ...form, smsConsent: e.target.checked })}
                className="mt-0.5 accent-coral-500 w-4 h-4 shrink-0"
              />
              <span className="leading-relaxed">
                Text me confirmations and delivery updates about this booking{" "}
                <span className="text-navy-400/70">(optional)</span>. Msg &amp; data rates may apply. Reply STOP to opt out.
              </span>
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl btn-coral text-lg font-medium tracking-wide disabled:opacity-60"
            >
              {status === "loading" ? "Redirecting to payment..." : "Book & Pay Now"}
            </button>

            <p className="text-center text-xs text-navy-400/70 leading-relaxed">
              By submitting, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-navy-600">Terms</Link> and{" "}
              <Link href="/privacy" className="underline hover:text-navy-600">Privacy Policy</Link>.
            </p>

            <p className="text-center text-sm text-navy-400">
              Secure payment via Stripe. Full amount collected now — your setup will be ready on the sand.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
