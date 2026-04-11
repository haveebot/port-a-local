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
        <p className="text-lg text-navy-200 mb-4">
          Payment received. Our local team has been notified and will be in touch within <strong className="text-sand-50">2-4 hours</strong>.
        </p>
        <p className="text-navy-300">Check your email and phone for confirmation. We&apos;re on it.</p>
      </>
    );
  }

  return (
    <>
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">Something went wrong</h1>
      <p className="text-lg text-navy-200 mb-4">
        Your payment may have gone through but we couldn&apos;t confirm automatically. Call us at (361) 455-8606 and we&apos;ll sort it out immediately.
      </p>
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
