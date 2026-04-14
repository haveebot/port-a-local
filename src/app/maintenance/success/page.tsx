"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function MaintenanceSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch("/api/maintenance/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => (res.ok ? setStatus("success") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <>
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Confirming your dispatch...</h1>
        <p className="text-lg text-navy-200">Just a moment.</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Priority Dispatch Confirmed!</h1>
        <p className="text-lg text-navy-200 mb-6">
          Payment received. Your request is in — our local team is on it.
        </p>
        <div className="text-left bg-white/10 rounded-2xl p-6 mb-8 space-y-4">
          <p className="text-sand-200 font-semibold text-sm tracking-wide uppercase">What happens next</p>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">1</span>
            <p className="text-navy-200 text-sm">Check your email and phone — a confirmation is on its way.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">2</span>
            <p className="text-navy-200 text-sm">Our local team reviews your request and will contact you within <strong className="text-sand-50">2-4 hours</strong> to confirm scope and schedule.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-coral-400 font-bold">3</span>
            <p className="text-navy-200 text-sm">A vetted local technician is dispatched. We handle it so you can get back to enjoying the island.</p>
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
      <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Payment Issue</h1>
      <p className="text-lg text-navy-200 mb-4">
        Your payment may have gone through but we couldn&apos;t confirm it automatically. Reach out and we&apos;ll get it sorted immediately.
      </p>
      <a href="mailto:hello@theportalocal.com?subject=Maintenance dispatch issue" className="text-coral-400 hover:text-coral-300 underline text-sm">
        hello@theportalocal.com
      </a>
    </>
  );
}

export default function MaintenanceSuccessPage() {
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
            <MaintenanceSuccessContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
