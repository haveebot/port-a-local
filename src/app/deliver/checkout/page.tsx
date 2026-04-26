import type { Metadata } from "next";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout — PAL Delivery",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={14} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Delivery
            </span>
          </Link>
          <h1 className="font-display text-xl font-bold">Checkout</h1>
        </div>
      </header>
      <CheckoutClient />
    </main>
  );
}
