"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PortalIcon from "@/components/brand/PortalIcon";

const CART_SIZES = [
  { value: "4", label: "4-Passenger Cart" },
  { value: "6", label: "6-Passenger Cart" },
  { value: "8", label: "8-Passenger Cart" },
];

/** Calendar starts 5 days from today — gives us lead time to source a vendor. */
function getMinBookingDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split("T")[0];
}

export default function RentPage() {
  const minDate = getMinBookingDate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cartSize: "4",
    pickupDate: "",
    returnDate: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const reservationFee = numDays ? numDays * 10 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupDate || !form.returnDate) {
      setErrorMsg("Please select both a pickup and return date.");
      return;
    }
    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      setErrorMsg("Return date must be after pickup date.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numDays, reservationFee }),
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
      setErrorMsg("Something went wrong. Please try again or email hello@theportalocal.com.");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="pt-28 pb-20 hero-gradient relative">
          <div className="absolute bottom-0 left-0 right-0 coral-line" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <PortalIcon name="cart" className="w-20 h-20 mx-auto mb-6 text-coral-400" />
            <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
              Your Cart is Reserved!
            </h1>
            <p className="text-lg text-navy-200 mb-4">
              We&apos;re matching your reservation with a local cart company now.
            </p>
            <p className="text-navy-300 mb-6">
              You&apos;ll receive pickup details <strong className="text-sand-100">24–48 hours before your arrival date</strong> — including location, hours, and what to bring.
            </p>
            <p className="text-navy-400 text-sm">
              Full refund if we&apos;re unable to fulfill your reservation. Check your email for a confirmation.
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

      {/* Hero */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <PortalIcon name="cart" className="w-12 h-12 text-coral-400 shrink-0" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              Rent a Golf Cart
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 font-light max-w-2xl">
            The island runs on golf carts. Reserve yours through Port A Local and we guarantee a clean, well-maintained cart from a vetted local company — plus a <strong className="text-sand-100">guaranteed $20 discount</strong>{" "}off the rental company&apos;s standard rate. No booking fees, no guesswork.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📅</div>
              <p className="font-semibold text-navy-900 text-sm">Pick Your Dates</p>
              <p className="text-navy-500 text-sm mt-1">Choose your cart size and rental dates. Pay a small reservation fee to lock it in.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-navy-900 text-sm">We Confirm Your Cart</p>
              <p className="text-navy-500 text-sm mt-1">We source a quality cart from our network of local rental companies. You don&apos;t lift a finger.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold text-navy-900 text-sm">Pick Up & Explore</p>
              <p className="text-navy-500 text-sm mt-1">Pickup details sent 24–48 hours before your arrival. Show up, grab the keys, ride.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Strip */}
      <section className="py-8 bg-navy-900 border-b border-navy-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-coral-400 text-lg">✓</span>
              <span className="text-sand-200 text-sm font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-coral-400 text-lg">✓</span>
              <span className="text-sand-200 text-sm font-medium">Vetted Local Companies</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-coral-400 text-lg">✓</span>
              <span className="text-sand-200 text-sm font-medium">Guaranteed $20 Off Rental</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-coral-400 text-lg">✓</span>
              <span className="text-sand-200 text-sm font-medium">Full Refund if Unfulfilled</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dates & Cart */}
            <div className="bg-white rounded-2xl border border-sand-200 p-4 sm:p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Your Rental</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    required
                    min={minDate}
                    value={form.pickupDate}
                    onChange={handleChange}
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    required
                    min={form.pickupDate || minDate}
                    value={form.returnDate}
                    onChange={handleChange}
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Cart Size *
                </label>
                <select
                  name="cartSize"
                  value={form.cartSize}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                >
                  {CART_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing summary */}
              {numDays && reservationFee && (
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 mt-2">
                  <div className="flex justify-between text-sm text-navy-700 mb-1">
                    <span>{numDays} day{numDays !== 1 ? "s" : ""} × $10 reservation fee</span>
                    <span className="font-semibold">${reservationFee}</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    Reservation fee secures your cart. Rental balance paid directly to the cart company at pickup — with a guaranteed $20 off their standard rate.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-sand-200 p-4 sm:p-6 space-y-4">
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

            {/* Booking Details & Disclosures */}
            <div className="bg-navy-50 rounded-2xl border border-navy-100 p-4 sm:p-6 space-y-3">
              <h3 className="font-display text-sm font-bold text-navy-900 uppercase tracking-wide">Before You Book</h3>
              <ul className="space-y-2 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <span className="text-coral-500 font-bold mt-0.5">→</span>
                  <span><strong>Pickup details</strong> are sent to your email 24–48 hours before your arrival date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-500 font-bold mt-0.5">→</span>
                  <span><strong>Valid ID required</strong> at pickup. Must be 18 or older to rent.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-500 font-bold mt-0.5">→</span>
                  <span><strong>Free cancellation</strong> 48+ hours before your pickup date. Non-refundable within 48 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-500 font-bold mt-0.5">→</span>
                  <span><strong>Damage deposit</strong> may be collected by the rental company at pickup.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-500 font-bold mt-0.5">→</span>
                  <span><strong>Full refund</strong> if we&apos;re unable to source a cart for your dates — no risk to you.</span>
                </li>
              </ul>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl btn-coral text-lg font-medium tracking-wide disabled:opacity-60"
            >
              {status === "loading" ? "Redirecting to payment..." : "Reserve My Cart"}
            </button>

            <p className="text-center text-xs text-navy-400/70 leading-relaxed">
              By submitting, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-navy-600">Terms</Link> and{" "}
              <Link href="/privacy" className="underline hover:text-navy-600">Privacy Policy</Link>{" "}
              and consent to receive SMS and email updates about your reservation.
              Msg &amp; data rates may apply. Reply STOP to opt out.
            </p>

            <p className="text-center text-sm text-navy-400">
              Secure payment via Stripe. $10/day reservation fee — rental balance paid at pickup.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
