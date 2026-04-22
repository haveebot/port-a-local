"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PortalIcon from "@/components/brand/PortalIcon";

const PRODUCTS = [
  {
    value: "cabana",
    label: "Cabana Setup",
    description: "Full beach cabana — shade, comfort, the works.",
    price: 300,
  },
  {
    value: "chairs",
    label: "Chair & Umbrella Setup",
    description: "Two chairs and a beach umbrella, set up and ready to go.",
    price: 85,
  },
];

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

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedProduct = PRODUCTS.find((p) => p.value === form.product)!;
  const qty = parseInt(form.quantity) || 1;

  const numDays =
    form.pickupDate && form.returnDate
      ? Math.max(
          1,
          Math.round(
            (new Date(form.returnDate).getTime() -
              new Date(form.pickupDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const totalPrice = numDays ? numDays * qty * selectedProduct.price : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupDate || !form.returnDate) {
      setErrorMsg("Please select both a start and end date.");
      return;
    }
    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      setErrorMsg("End date must be after start date.");
      return;
    }
    if (!form.deliveryAddress.trim()) {
      setErrorMsg("Please enter your beach delivery address or location.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout/beach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numDays, totalPrice, qty }),
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
      <Navigation />

      {/* Header */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <PortalIcon name="beach" className="w-12 h-12 text-coral-400 shrink-0" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              Beach Rentals
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 font-light">
            Show up, we handle the rest. Your setup is waiting for you on the
            sand.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRODUCTS.map((p) => (
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
                    <span className="text-lg font-bold text-coral-500 mt-1">${p.price}<span className="text-sm font-normal text-navy-400"> / day</span></span>
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

            {/* Dates & Location */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Dates & Location</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Start Date *
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
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    End Date *
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
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Beach Location *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  required
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="e.g. Access Road 1A, near the blue beach house"
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              {totalPrice && numDays && (
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                  <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 text-sm text-navy-700 mb-1">
                    <span className="text-navy-500">{qty} {selectedProduct.label}{qty > 1 ? "s" : ""} × {numDays} day{numDays !== 1 ? "s" : ""} × ${selectedProduct.price}</span>
                    <span className="font-semibold whitespace-nowrap">${totalPrice} total</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    Total due at confirmation. Our team will follow up to collect payment before your first day.
                  </p>
                </div>
              )}
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
