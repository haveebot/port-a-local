"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function RentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch("/api/rent/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <>
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
          Confirming your reservation...
        </h1>
        <p className="text-lg text-navy-200">Just a moment.</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="text-6xl mb-6">🛺</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
          You&apos;re All Set!
        </h1>
        <p className="text-lg text-navy-200 mb-6">
          Payment received. Your golf cart reservation is confirmed.
        </p>
        <div className="text-left bg-white/10 rounded-2xl p-6 mb-8 space-y-4">
          <p className="text-sand-200 font-semibold text-sm tracking-wide uppercase">What happens next</p>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">1</span>
            <p className="text-navy-200 text-sm">Check your email — a confirmation is on its way.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">2</span>
            <p className="text-navy-200 text-sm">Our local team will contact you within 24 hours to confirm availability and delivery details.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">3</span>
            <p className="text-navy-200 text-sm">Your cart is delivered to you. Hop in and explore the island.</p>
          </div>
        </div>
        <a href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-xl btn-coral text-sm font-semibold">
          Explore Port A Local
        </a>
      </>
    );
  }

  return (
    <>
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
        Payment Issue
      </h1>
      <p className="text-lg text-navy-200 mb-4">
        Your payment may have gone through but we couldn&apos;t confirm it automatically. Reach out and we&apos;ll sort it out right away.
      </p>
      <a href="mailto:hello@theportalocal.com?subject=Golf cart reservation issue" className="text-coral-400 hover:text-coral-300 underline text-sm">
        hello@theportalocal.com
      </a>
    </>
  );
}

export default function RentSuccessPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="pt-28 pb-20 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Suspense fallback={
            <>
              <div className="text-6xl mb-6">⏳</div>
              <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Loading...</h1>
            </>
          }>
            <RentSuccessContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
