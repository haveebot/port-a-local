"use client";

import { useState } from "react";

export default function ConnectStartButton({
  slug,
  alreadyStarted,
}: {
  slug: string;
  alreadyStarted: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/beach/vendor/connect/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.onboardingUrl) {
        setError(data.error ?? "Could not start onboarding");
        setBusy(false);
        return;
      }
      window.location.assign(data.onboardingUrl);
    } catch (err) {
      setError(String(err));
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={go}
        disabled={busy}
        className="w-full px-5 py-3 bg-coral-500 text-white font-bold rounded-lg hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy
          ? "Loading…"
          : alreadyStarted
            ? "Continue Stripe setup"
            : "Set up Stripe payouts"}
      </button>
      {error && (
        <p className="text-sm text-coral-700 mt-3 text-center">Error: {error}</p>
      )}
    </>
  );
}
