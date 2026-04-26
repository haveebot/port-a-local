"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LighthouseMark from "@/components/brand/LighthouseMark";

export default function WheelhouseLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-900" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") ?? "/wheelhouse";

  const [who, setWho] = useState<"winston" | "collie" | "nick">("winston");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/wheelhouse/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, who }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Login failed.");
        return;
      }
      router.replace(fromPath);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="absolute inset-0 palm-pattern opacity-15 pointer-events-none" />

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <LighthouseMark size={64} variant="light" detail="standard" />
          </div>
          <p className="text-coral-300 text-xs font-bold tracking-[0.3em] uppercase mb-2">
            The Wheelhouse
          </p>
          <h1 className="font-display text-3xl font-bold text-sand-50">
            Sign in
          </h1>
          <p className="text-sm text-navy-300 font-light mt-2">
            Operations control panel for Port A Local.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white/8 backdrop-blur border border-white/15 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-coral-300 mb-2">
              Who are you?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["winston", "collie", "nick"] as const).map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWho(w)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                    who === w
                      ? "bg-coral-500 text-white"
                      : "bg-white/10 text-sand-100 hover:bg-white/20"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-coral-300 mb-2"
            >
              Wheelhouse password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sand-50 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-coral-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-coral-300 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || password.length < 1}
            className="w-full py-3 rounded-lg btn-coral text-sm font-semibold tracking-wide disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-[11px] text-navy-400 font-light text-center pt-2">
            Internal only. Not for public access.
          </p>
        </form>

        {/* Craigslist-style "want in?" — public, agnostic, anonymous.
            Anyone who clicks the footer link to /wheelhouse and isn't
            signed in lands here. We don't recruit; we don't pitch.
            Send a note. We read them. Most don't make it. */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-coral-300 font-bold mb-2 text-center">
            Want in?
          </p>
          <p className="text-sm text-navy-200 font-light text-center leading-relaxed max-w-sm mx-auto">
            Local. Think you can contribute to PAL? Send a note. We
            read every one. Most don&apos;t make it through.
            We like it that way.
          </p>
          <div className="mt-4 text-center">
            <a
              href="mailto:hello@theportalocal.com?subject=Wheelhouse%20%E2%80%94%20want%20in"
              className="inline-block text-xs font-mono text-sand-200 underline decoration-coral-500/50 hover:decoration-coral-400 hover:text-coral-200 transition-colors tracking-wide"
            >
              hello@theportalocal.com
            </a>
          </div>
          <p className="text-[10px] text-navy-500 font-light text-center mt-4 italic">
            No portal. No application form. Just an inbox.
          </p>
        </div>
      </div>
    </main>
  );
}
