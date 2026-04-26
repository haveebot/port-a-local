import type { Metadata } from "next";
import { Suspense } from "react";
import LocalsBetaBanner from "@/components/locals/LocalsBetaBanner";
import InquiryForm from "./InquiryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tell us what you need — PAL Locals",
  description:
    "Don't see what you're looking for in PAL Locals? Drop us a quick note. We'll find the right local for the job.",
};

export default function InquiryPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <LocalsBetaBanner />

      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Locals
          </p>
          <h1 className="font-display text-2xl font-bold">
            Tell us what you need.
          </h1>
          <p className="text-sand-300 font-light text-sm mt-1">
            Don&apos;t see it listed yet? Locals know locals — we&apos;ll find
            the right person and connect you.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center text-navy-500">
            Loading…
          </div>
        }
      >
        <InquiryForm />
      </Suspense>
    </main>
  );
}
