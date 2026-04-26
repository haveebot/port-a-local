"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CartLine {
  itemId: string;
  qty: number;
  notes?: string;
}

interface StashedCheckout {
  restaurantSlug: string;
  restaurantName: string;
  cart: CartLine[];
}

const TIP_PRESETS = [3, 5, 8, 12]; // dollar amounts; v1 simple

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutClient() {
  const [stash, setStash] = useState<StashedCheckout | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [tipDollars, setTipDollars] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTotal, setPreviewTotal] = useState<{
    subtotal: number;
    delivery: number;
    service: number;
    tax: number;
    tip: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("pal-deliver-checkout");
      if (raw) setStash(JSON.parse(raw) as StashedCheckout);
    } catch {
      // ignore
    }
  }, []);

  // Local preview math — server is the source of truth at submit time
  useEffect(() => {
    if (!stash) {
      setPreviewTotal(null);
      return;
    }
    // Pull priced items from query — v1 we just compute server-side at submit.
    // For preview, we don't have prices in the stash; so show placeholder
    // until submit. This is OK because the real total is shown at Stripe
    // Checkout. Skipping local preview math in v1 to avoid drift.
    setPreviewTotal(null);
  }, [stash, tipDollars]);

  async function submit() {
    if (!stash) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/deliver/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: stash.restaurantSlug,
          items: stash.cart.map((l) => ({
            itemId: l.itemId,
            quantity: l.qty,
            notes: l.notes,
          })),
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            deliveryAddress: address.trim(),
            deliveryNotes: notes.trim() || undefined,
          },
          tipCents: Math.round(tipDollars * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create order.");
        setSubmitting(false);
        return;
      }
      // Clear cart on success
      try {
        window.localStorage.removeItem(`pal-deliver-cart-${stash.restaurantSlug}`);
        window.sessionStorage.removeItem("pal-deliver-checkout");
      } catch {
        // ignore
      }
      // Beta mode: redirect to internal success page
      // Live mode: redirect to Stripe Checkout
      window.location.href = data.beta ? data.redirectUrl : data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  if (!stash || stash.cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-navy-600 font-light">Your cart is empty.</p>
        <Link
          href="/deliver"
          className="inline-block mt-4 text-sm text-coral-600 underline decoration-coral-300"
        >
          Pick a restaurant →
        </Link>
      </div>
    );
  }

  const formValid =
    name.trim().length > 1 &&
    phone.trim().replace(/\D/g, "").length >= 10 &&
    address.trim().length > 4;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white border border-sand-200 rounded-xl p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-1">
          Order from
        </p>
        <p className="font-display text-lg font-bold text-navy-900 mb-3">
          {stash.restaurantName}
        </p>
        <ul className="text-sm text-navy-700 space-y-1">
          {stash.cart.map((l) => (
            <li key={l.itemId} className="font-mono">
              {l.qty}× <span className="font-sans">{l.itemId}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/deliver/${stash.restaurantSlug}`}
          className="text-xs text-navy-500 hover:text-coral-600 underline decoration-sand-300 mt-3 inline-block"
        >
          Edit cart
        </Link>
      </div>

      <div className="bg-white border border-sand-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            placeholder="First + last"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Phone (for SMS updates)
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            placeholder="(361) 555-0100"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Email (receipt — optional)
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Delivery address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            placeholder="123 Beach Access Rd, Port Aransas"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
            Delivery notes (gate code, beach house color, etc.)
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
            placeholder="Leave at the door, blue house"
          />
        </div>
      </div>

      <div className="bg-white border border-sand-200 rounded-xl p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-3">
          Driver tip
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {TIP_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setTipDollars(d)}
              className={
                tipDollars === d
                  ? "px-4 py-2 rounded-lg text-sm font-bold bg-navy-900 text-sand-50 border border-navy-900"
                  : "px-4 py-2 rounded-lg text-sm font-semibold bg-white text-navy-700 border border-sand-300 hover:border-navy-400"
              }
            >
              ${d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTipDollars(0)}
            className={
              tipDollars === 0
                ? "px-4 py-2 rounded-lg text-sm font-bold bg-navy-900 text-sand-50 border border-navy-900"
                : "px-4 py-2 rounded-lg text-sm font-semibold bg-white text-navy-500 border border-sand-300 hover:border-navy-400"
            }
          >
            None
          </button>
        </div>
        <p className="text-[11px] text-navy-500 font-light">
          100% of tip goes to the driver.
        </p>
      </div>

      <p className="text-xs text-navy-500 font-light px-1">
        We&apos;ll show the final total — including delivery fee, service
        fee, and Texas sales tax — on the next screen at Stripe Checkout.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!formValid || submitting}
        className="w-full px-4 py-3 rounded-lg font-bold bg-coral-500 text-white hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed"
      >
        {submitting ? "Opening checkout…" : "Continue to payment →"}
      </button>
    </div>
  );
}
