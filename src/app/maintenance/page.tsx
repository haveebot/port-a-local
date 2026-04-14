"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SERVICE_TYPES = [
  "General Repair / Handyman",
  "Carpentry / Woodworking",
  "Painting",
  "Plumbing",
  "Electrical",
  "HVAC / AC",
  "Landscaping",
  "Other",
];

const PRIORITY_START = 7;  // 7AM
const PRIORITY_END = 20;   // 8PM

function isPriorityAvailable() {
  const hour = new Date().getHours();
  return hour >= PRIORITY_START && hour < PRIORITY_END;
}

export default function MaintenancePage() {
  const [dispatchType, setDispatchType] = useState<"standard" | "priority">("standard");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    serviceType: "",
    description: "",
    urgency: "routine",
    contactPref: "either",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const priorityAvailable = isPriorityAvailable();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      if (dispatchType === "priority") {
        // Priority — go through Stripe checkout
        const res = await fetch("/api/checkout/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Checkout failed");
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } else {
        // Standard — free, direct submission
        const res = await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Submission failed");
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please call us directly at (361) 455-8606.");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen">
        <Navigation />
        <section className="pt-28 pb-20 hero-gradient relative">
          <div className="absolute bottom-0 left-0 right-0 coral-line" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Request Received!</h1>
            <p className="text-lg text-navy-200 mb-4">
              We&apos;ve received your maintenance request and our local service team is reviewing the details.
            </p>
            <p className="text-navy-300">
              Someone will be in touch to schedule your service.
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
            <span className="text-4xl">🔧</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              Maintenance Request
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 font-light">
            Submit a request and we&apos;ll connect you with Port Aransas&apos;s most trusted local maintenance team.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dispatch Type Selection */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Choose Your Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Standard */}
                <label className={`relative flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  dispatchType === "standard"
                    ? "border-coral-400 bg-coral-50"
                    : "border-sand-200 hover:border-sand-300"
                }`}>
                  <input
                    type="radio"
                    name="dispatchType"
                    value="standard"
                    checked={dispatchType === "standard"}
                    onChange={() => setDispatchType("standard")}
                    className="sr-only"
                  />
                  <span className="font-semibold text-navy-900">Standard Request</span>
                  <span className="text-sm text-navy-500">We&apos;ll be in touch to schedule your service.</span>
                  <span className="text-lg font-bold text-coral-500 mt-1">Free</span>
                </label>

                {/* Priority */}
                <label className={`relative flex flex-col gap-1 p-4 rounded-xl border-2 transition-all ${
                  !priorityAvailable
                    ? "border-sand-200 bg-sand-50 opacity-60 cursor-not-allowed"
                    : dispatchType === "priority"
                    ? "border-coral-400 bg-coral-50 cursor-pointer"
                    : "border-sand-200 hover:border-sand-300 cursor-pointer"
                }`}>
                  <input
                    type="radio"
                    name="dispatchType"
                    value="priority"
                    checked={dispatchType === "priority"}
                    onChange={() => priorityAvailable && setDispatchType("priority")}
                    disabled={!priorityAvailable}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-900">Priority Dispatch</span>
                    <span className="text-xs bg-coral-500 text-white px-2 py-0.5 rounded-full font-medium">Fast</span>
                  </div>
                  <span className="text-sm text-navy-500">
                    {priorityAvailable
                      ? "We contact you within 2–4 hours. Guaranteed."
                      : "Available 7AM–8PM daily. Check back then."}
                  </span>
                  <span className="text-lg font-bold text-coral-500 mt-1">$20</span>
                </label>

              </div>

              {dispatchType === "priority" && priorityAvailable && (
                <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-sm text-coral-700">
                  ⚡ Your $20 dispatch fee guarantees our team contacts you within <strong>2–4 hours</strong>. Available 7AM–8PM daily.
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
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                    placeholder="Jane Smith"
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
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                    placeholder="(361) 555-0000"
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
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Preferred Follow-Up *</label>
                <select
                  name="contactPref"
                  value={form.contactPref}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                >
                  <option value="either">Either Text or Email</option>
                  <option value="sms">Text / SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-navy-900">Property & Service</h2>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Property Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  placeholder="123 Beach Ave, Port Aransas, TX"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Service Type *</label>
                  <select
                    name="serviceType"
                    required
                    value={form.serviceType}
                    onChange={handleChange}
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  >
                    <option value="">Select a service...</option>
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Urgency *</label>
                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={handleChange}
                    className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  >
                    <option value="routine">Routine — within a week</option>
                    <option value="urgent">Urgent — within 48 hours</option>
                    <option value="emergency">Emergency — ASAP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-sand-300 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  placeholder="Describe the issue in as much detail as you can..."
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
              {status === "loading"
                ? dispatchType === "priority" ? "Redirecting to payment..." : "Submitting..."
                : dispatchType === "priority" ? "Pay $20 & Dispatch Now" : "Submit Maintenance Request"}
            </button>

            <p className="text-center text-xs text-navy-400/70 leading-relaxed">
              By submitting, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-navy-600">Terms</Link> and{" "}
              <Link href="/privacy" className="underline hover:text-navy-600">Privacy Policy</Link>{" "}
              and consent to receive SMS and email updates about your request.
              Msg &amp; data rates may apply. Reply STOP to opt out.
            </p>

            <p className="text-center text-sm text-navy-400">
              {dispatchType === "priority"
                ? "Secure payment via Stripe. $20 dispatch fee guarantees 2–4 hour response (7AM–8PM)."
                : "Free request — our team will be in touch to schedule your service."}
            </p>

          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
