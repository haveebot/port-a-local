import type { Metadata } from "next";
import LookupForm from "./LookupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find your driver links — PAL Delivery",
  robots: { index: false, follow: false },
};

export default function LookupPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 flex flex-col">
      <header className="px-4 sm:px-6 py-5 border-b border-coral-500/30">
        <p className="text-[10px] tracking-widest uppercase text-coral-300">
          PAL Delivery · Driver
        </p>
        <p className="font-display text-lg font-bold mt-1">
          Find your driver links
        </p>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full">
          <p className="text-sm text-sand-300 font-light mb-6">
            Enter the phone number you signed up with. We&apos;ll email you
            your two links — on/off-duty toggle and Stripe payouts setup.
            Bookmark them once they arrive.
          </p>
          <LookupForm />
        </div>
      </div>
    </main>
  );
}
