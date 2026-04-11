"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CART_SIZES = [
  { value: "4", label: "4-Passenger Cart" },
  { value: "6", label: "6-Passenger Cart" },
  { value: "8", label: "8-Passenger Cart" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function RentPage() {
  const today = getTodayStr();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cartSize: "4",
    pickupDate: "",
    returnDate: "",
    delivery: "pickup",
    deliveryAddress: "",
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
    if (form.delivery === "delivery" && !form.deliveryAddress.trim()) {
      setErrorMsg("Please enter a delivery address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numDays, reservationFee }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or call us directly.");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="pt-28 pb-20 hero-gradient relative">
          <div className="absolute bottom-0 left-0 right-0 coral-line" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-6xl mb-6">🏖️</div>
            <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
              You&apos;re All Set!
            </h1>
            <p className="text-lg text-navy-200 mb-4">
              Your golf cart reservation request has been received. Our local
              team is reviewing availability and will confirm your booking
              shortly.
            </p>
            <p className="text-navy-300">
              Check your email for a confirmation. We&apos;ll be in touch soon.
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
            <span className="text-4xl">🛺</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              Golf Cart Rentals
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 font-light">
            The best way to get around Port Aransas. Reserve yours now — our
            local team handles the rest.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📅</div>
              <p className="font-semibold text-navy-900 text-sm">Pick Your Dates</p>
              <p className="text-navy-500 text-sm mt-1">Choose pickup and return. We&apos;ll confirm availability.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-navy-900 text-sm">We Confirm</p>
              <p className="text-navy-500 text-sm mt-1">Our local team reviews and locks in your cart.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏁</div>
              <p className="font-semibold text-navy-900 text-sm">Pick Up & Go</p>
              <p className="text-navy-500 text-sm mt-1">Show up, grab your cart, and explore the island.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dates & Cart */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
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
                    min={today}
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
                    min={form.pickupDate || today}
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

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Pickup or Delivery? *
                </label>
                <select
                  name="delivery"
                  value={form.delivery}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                >
                  <option value="pickup">I&apos;ll pick it up</option>
                  <option value="delivery">Deliver to me</option>
                </select>
              </div>

              {form.delivery === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    placeholder="123 Beach Ave, Port Aransas, TX"
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>
              )}

              {/* Pricing summary */}
              {numDays && reservationFee && (
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 mt-2">
                  <div className="flex justify-between text-sm text-navy-700 mb-1">
                    <span>{numDays} day{numDays !== 1 ? "s" : ""} × $10 reservation fee</span>
                    <span className="font-semibold">${reservationFee}</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    Reservation fee collected at confirmation. You&apos;ll pay the rental balance directly at pickup — at a discounted rate that more than covers this fee.
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

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl btn-coral text-lg font-medium tracking-wide disabled:opacity-60"
            >
              {status === "loading" ? "Submitting..." : "Request Reservation"}
            </button>

            <p className="text-center text-sm text-navy-400">
              No payment collected yet — our team will confirm availability and
              follow up within a few hours.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
