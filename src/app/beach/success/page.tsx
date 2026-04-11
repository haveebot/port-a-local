"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function BeachSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch("/api/beach/confirm", {
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
          Confirming your booking...
        </h1>
        <p className="text-lg text-navy-200">Just a moment.</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="text-6xl mb-6">🏖️</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
          Beach Setup Booked!
        </h1>
        <p className="text-lg text-navy-200 mb-4">
          Payment received. Your beach setup is confirmed — our local team will have everything ready for you on the sand.
        </p>
        <p className="text-navy-300">
          Check your email for a confirmation. See you on the beach.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="font-display text-4xl font-bold text-sand-50 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-navy-200 mb-4">
        Your payment may have gone through but we couldn&apos;t confirm it automatically. Please email or call us and we&apos;ll sort it out right away.
      </p>
      <p className="text-navy-300">We apologize for the inconvenience.</p>
    </>
  );
}

export default function BeachSuccessPage() {
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
            <BeachSuccessContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
