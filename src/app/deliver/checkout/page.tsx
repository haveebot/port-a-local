import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { isDeliveryLive } from "@/data/delivery-launch";
import PreviewBanner from "@/components/deliver/PreviewBanner";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout — PAL Delivery",
};

export default function CheckoutPage() {
  const live = isDeliveryLive();
  return (
    <main className="min-h-screen bg-sand-50">
      {!live && <PreviewBanner />}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Delivery
          </p>
          <h1 className="font-display text-xl font-bold">
            {live ? "Checkout" : "Order request"}
          </h1>
        </div>
      </header>
      <CheckoutClient live={live} />
    </main>
  );
}
