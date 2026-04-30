"use client";

import { useState } from "react";

/**
 * Sell-mode buy-now CTA. Click → modal collects customer name + email
 * + phone (vendor needs to reach them for fulfillment) → POST to
 * /api/locals/buy/[listingId] → redirect to Stripe Checkout.
 *
 * Customer pays priceCents (vendor's quote) + 10% PAL platform fee.
 * Vendor keeps 100% of priceCents via Stripe Connect transfer (or
 * manual payout if vendor isn't Connect-onboarded yet).
 */
export default function BuyNowButton({
  listingId,
  title,
  provider,
  priceCents,
  palFeeCents,
  totalCents,
  fulfillmentNote,
}: {
  listingId: string;
  title: string;
  provider: string;
  priceCents: number;
  palFeeCents: number;
  totalCents: number;
  fulfillmentNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid =
    name.trim().length > 1 &&
    email.includes("@") &&
    phone.trim().replace(/\D/g, "").length >= 10;

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/locals/buy/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Couldn't start checkout.");
        setBusy(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErr("No checkout URL returned.");
        setBusy(false);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block mt-2 px-3 py-1.5 rounded-md text-xs font-bold bg-coral-500 hover:bg-coral-600 text-white"
      >
        Buy now — ${(totalCents / 100).toFixed(2)} →
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            // close on backdrop click
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <p className="text-[10px] tracking-widest uppercase text-coral-600 font-bold">
                Buy from {provider}
              </p>
              <button
                type="button"
                onClick={() => !busy && setOpen(false)}
                aria-label="Close"
                className="text-navy-400 hover:text-navy-700 text-xl leading-none disabled:opacity-50"
                disabled={busy}
              >
                ×
              </button>
            </div>
            <h3 className="font-display text-xl font-bold text-navy-900 mb-1">
              {title}
            </h3>
            {fulfillmentNote && (
              <p className="text-xs text-navy-500 italic mb-4">
                {fulfillmentNote}
              </p>
            )}

            {/* Receipt */}
            <div className="bg-sand-50 border border-sand-200 rounded-lg p-3 text-sm space-y-1 mb-4">
              <Row
                label="Item"
                value={`$${(priceCents / 100).toFixed(2)}`}
              />
              <Row
                label="PAL platform fee (10%)"
                value={`$${(palFeeCents / 100).toFixed(2)}`}
              />
              <hr className="border-sand-200 my-1" />
              <Row
                label="Total"
                value={`$${(totalCents / 100).toFixed(2)}`}
                bold
              />
            </div>

            <p className="text-xs text-navy-600 mb-3">
              <strong>{provider}</strong> will reach out directly to
              coordinate{" "}
              {fulfillmentNote ? (
                <em>{fulfillmentNote.toLowerCase()}</em>
              ) : (
                "fulfillment"
              )}
              . PAL is just the booking layer.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
                    Email *
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
                    Phone *
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
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-navy-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Anything the vendor should know — color preferences, special request, etc."
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm focus:border-coral-400 focus:outline-none resize-y"
                />
              </div>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mt-3">
                {err}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={!valid || busy}
              className="w-full mt-4 py-3 rounded-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy
                ? "Starting checkout…"
                : `Pay $${(totalCents / 100).toFixed(2)} →`}
            </button>
            <p className="text-[10px] text-navy-500 font-light text-center mt-2">
              Secure payment via Stripe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${
        bold ? "font-bold text-navy-900" : "text-navy-600"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
