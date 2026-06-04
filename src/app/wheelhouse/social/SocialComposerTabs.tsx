"use client";

import { useEffect, useState } from "react";
import AskHavee from "./AskHavee";
import DirectPostForm from "./DirectPostForm";

type Mode = "havee" | "direct";

const STORAGE_KEY = "wheelhouse.social.composer-mode";

/**
 * Wraps the two composer paths at the top of /wheelhouse/social:
 *   - "Ask Havee"        — LLM composer (existing AskHavee component)
 *   - "Write it yourself" — direct caption/link/image (DirectPostForm)
 *
 * Both feed the same pending queue. The toggle remembers the last-used
 * mode in localStorage so Collie's preference sticks across visits.
 *
 * Per Winston: manual paths (direct + AskHavee) are training-wheels for
 * the system before it goes autonomous — both stay as input channels.
 *
 * Visual model: the tabs themselves are a small strip; each composer
 * keeps its OWN container (so AskHavee renders unchanged). The Direct
 * form gets its own matching container in this component to mirror the
 * AskHavee chrome (gradient + coral border) for visual continuity.
 */
export default function SocialComposerTabs() {
  // SSR-safe initial: render AskHavee on first paint to match server
  // markup (no localStorage available there). useEffect re-syncs to the
  // stored preference after hydration.
  const [mode, setMode] = useState<Mode>("havee");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "direct" || saved === "havee") {
        setMode(saved);
      }
    } catch {
      // localStorage blocked — default sticks
    }
    setHydrated(true);
  }, []);

  function pickMode(next: Mode) {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  const activeMode: Mode = hydrated ? mode : "havee";

  return (
    <div>
      {/* TAB STRIP — sits above the active composer */}
      <div
        role="tablist"
        aria-label="Composer mode"
        className="flex bg-sand-100 rounded-xl border border-sand-300 p-1 mb-3 max-w-md"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === "havee"}
          onClick={() => pickMode("havee")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
            activeMode === "havee"
              ? "bg-coral-500 text-white shadow-sm"
              : "text-navy-600 hover:text-coral-700"
          }`}
        >
          ✨ AI Composer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === "direct"}
          onClick={() => pickMode("direct")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
            activeMode === "direct"
              ? "bg-coral-500 text-white shadow-sm"
              : "text-navy-600 hover:text-coral-700"
          }`}
        >
          📝 Write it yourself
        </button>
      </div>

      {/* AskHavee keeps its own section wrapper (border, gradient, etc.) */}
      {activeMode === "havee" && <AskHavee />}

      {/* Direct form wears a matching wrapper for visual continuity */}
      {activeMode === "direct" && (
        <section className="bg-gradient-to-br from-coral-500/10 via-white to-white rounded-2xl border-2 border-coral-300 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <h2 className="font-display text-xl font-bold text-navy-900">
              Write a post yourself
            </h2>
          </div>
          <DirectPostForm />
        </section>
      )}
    </div>
  );
}
