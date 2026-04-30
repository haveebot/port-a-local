import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LighthouseMark from "@/components/brand/LighthouseMark";
import LocalsBetaBanner from "@/components/locals/LocalsBetaBanner";
import OfferForm from "./OfferForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "List your stuff or your services — PAL Locals",
  description:
    "Got a paddleboard sitting in your garage? Take photos for a living? Drive a beach setup once a weekend? List it on PAL Locals. We send you the customers.",
};

export default function OfferPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <LocalsBetaBanner />

      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Locals
            </span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            List your stuff. Or your skills.
          </h1>
          <p className="text-sand-300 font-light mt-2 max-w-2xl text-sm sm:text-base">
            Locals only. Tell us what you rent or what you do. We&apos;ll vet,
            list it, and route inquiries to you. No commitment.{" "}
            <strong className="text-sand-100">
              You keep 100% of your quote
            </strong>{" "}
            — PAL adds 10% on top, paid by the customer.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
            How it works
          </h2>
          <ol className="space-y-3 text-sm text-navy-700 font-light">
            <li>
              <strong className="text-navy-900">1. Submit below.</strong> Tell
              us what you have or what you do, your rough rates, and how
              you&apos;d want to be contacted.
            </li>
            <li>
              <strong className="text-navy-900">2. We vet + list.</strong>{" "}
              Quick fit check (we keep PAL Locals to actual locals, no
              outsourcing), then your listing goes up.
            </li>
            <li>
              <strong className="text-navy-900">3. Inquiries route to you.</strong>{" "}
              Customer hits &quot;Request a quote&quot; — we hand them off.
              You quote, you fulfill, you keep the money.
            </li>
            <li>
              <strong className="text-navy-900">4. Optional: pay through PAL.</strong>{" "}
              When you&apos;re ready, we set up Stripe Connect for you and
              customers pay through PAL → auto-payout to your bank.{" "}
              <strong className="text-navy-900">
                PAL adds 10% on top of your quote — paid by the customer,
                never deducted from your pay.
              </strong>{" "}
              Until then: you bill them direct, we don&apos;t touch the money.
            </li>
          </ol>

          {/* Concrete fee example so vendors aren't surprised when they
              see customer-facing pricing later. Locals see this BEFORE
              they sign up so the model is unambiguous. */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
              What the customer sees
            </p>
            <div className="space-y-1 text-sm font-mono text-navy-800">
              <div className="flex justify-between">
                <span>Your quote</span>
                <span>$200.00</span>
              </div>
              <div className="flex justify-between text-navy-500">
                <span>PAL platform fee (10%)</span>
                <span>+$20.00</span>
              </div>
              <div className="flex justify-between font-bold text-navy-900 border-t border-emerald-200 pt-1 mt-1">
                <span>Customer pays</span>
                <span>$220.00</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 pt-2">
                <span>You receive</span>
                <span>$200.00</span>
              </div>
            </div>
            <p className="text-[11px] text-navy-500 font-light mt-3 italic">
              Same model as Airbnb / Turo / DoorDash — customers expect a
              platform fee on top. PAL&apos;s differentiator: it never
              comes out of your pocket.
            </p>
          </div>

          <h3 className="font-display text-base font-bold text-navy-900 mt-8 mb-2">
            What we won&apos;t list
          </h3>
          <p className="text-sm text-navy-600 font-light">
            Plumbing, AC, electrical, locks, hurricane prep, general property
            maintenance — those go through{" "}
            <a
              href="/maintenance"
              className="underline decoration-sand-300 hover:text-coral-600"
            >
              /maintenance
            </a>{" "}
            where our maintenance vendor handles them. PAL Locals is for the everything-else.
          </p>

          <p className="text-xs text-navy-500 font-light mt-6">
            Brand-new and intentionally small. Quality over volume.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white border border-sand-200 rounded-xl p-5 text-sm text-navy-500">
              Loading…
            </div>
          }
        >
          <OfferForm />
        </Suspense>
      </div>
    </main>
  );
}
