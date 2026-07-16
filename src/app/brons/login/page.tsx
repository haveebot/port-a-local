"use client";

import { useState } from "react";

/**
 * Bron's team login — bronsbeach.com. Single shared team password, posts to
 * /api/brons/login, then hard-navigates to /brons so middleware re-checks the
 * fresh cookie.
 */
export default function BronsLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/brons/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Login failed.");
        return;
      }
      window.location.assign("/brons");
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-sky-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏖️</div>
          <h1 className="text-2xl font-bold text-sky-50">Bron&apos;s Beach</h1>
          <p className="text-sky-300 text-sm mt-1">Team Dashboard</p>
        </div>
        <form
          onSubmit={submit}
          className="bg-sky-900/60 border border-sky-800 rounded-2xl p-6 space-y-4"
        >
          <label className="block">
            <span className="text-sky-200 text-sm">Team password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="mt-1 w-full rounded-lg bg-sky-950 border border-sky-700 px-3 py-2 text-sky-50 outline-none focus:border-sky-400"
              placeholder="Enter team password"
            />
          </label>
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
