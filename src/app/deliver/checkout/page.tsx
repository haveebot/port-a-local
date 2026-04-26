import type { Metadata } from "next";
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
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Delivery
          </p>
          <h1 className="font-display text-xl font-bold">Checkout</h1>
        </div>
      </header>
      <CheckoutClient />
    </main>
  );
}
