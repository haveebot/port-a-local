"use client";

/**
 * Wheelhouse top nav.
 *
 * Two responsive lanes mirroring site Navigation.tsx pattern:
 *   - md+: logo · alerts · tools-dropdown · who · sign out (one line)
 *   - sm:  logo · alerts · hamburger (drawer holds tools + who + sign out)
 *
 * Push pill stays compact + always-visible because it's the primary
 * status surface (am I subscribed? do I get alerts?). Everything
 * else (Payouts, Locals re-fire, Help, identity, sign out) is
 * secondary — hides behind the menu when space is tight.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LighthouseMark from "@/components/brand/LighthouseMark";
import EnablePushButton from "@/components/push/EnablePushButton";
import type { ParticipantId } from "@/data/wheelhouse-types";

interface Props {
  meId: ParticipantId;
  meName: string;
}

const ALERT_LINKS = [
  { href: "/wheelhouse/alerts", label: "Site banner" },
  { href: "/wheelhouse/emergency", label: "Emergency events" },
];

const TOOLS_LINKS = [
  { href: "/wheelhouse/glossary", label: "Glossary" },
  { href: "/wheelhouse/revenue", label: "Revenue" },
  { href: "/wheelhouse/payouts", label: "Runner payouts" },
  { href: "/wheelhouse/beach-payouts", label: "Beach payouts" },
  { href: "/wheelhouse/cart-vendors-sms", label: "Cart vendor SMS" },
  { href: "/wheelhouse/locals-resend", label: "Locals re-fire" },
  { href: "/wheelhouse/welcome", label: "Help" },
];

const SITE_LINKS = [
  { href: "/", label: "Back to PAL site" },
];

export default function WheelhouseHeader({ meId, meName }: Props) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close drawer on escape / route change
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <header className="w-full bg-navy-900 text-sand-100 border-b border-coral-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <Link
          href="/wheelhouse"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
        >
          <LighthouseMark size={32} variant="light" detail="icon" />
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-sand-50 leading-none truncate">
              The Wheelhouse
            </p>
            <p className="text-[10px] tracking-widest uppercase text-coral-300 mt-0.5 truncate">
              Port A Local · Internal
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Always-visible: push status pill */}
          <EnablePushButton
            subscriberKind="wheelhouse-participant"
            subscriberId={meId}
            compact
            enableLabel="Enable alerts"
            onLabel="Alerts on"
          />

          {/* md+: tools dropdown + who + sign out inline */}
          <div className="hidden md:flex items-center gap-3">
            <div ref={toolsRef} className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-200 hover:text-coral-300 hover:bg-navy-800/60 transition-colors"
              >
                Tools
                <svg
                  className={`w-3 h-3 transition-transform ${
                    toolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-coral-500/30 rounded-xl shadow-xl shadow-navy-950/50 py-2 z-30">
                  <p className="px-4 pt-1 pb-2 text-[10px] tracking-widest uppercase text-coral-300 font-bold">
                    Alerts
                  </p>
                  {ALERT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/70 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-navy-700" />
                  <p className="px-4 pt-1 pb-2 text-[10px] tracking-widest uppercase text-coral-300 font-bold">
                    Tools
                  </p>
                  {TOOLS_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/70 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-navy-700" />
                  {SITE_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/70 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-navy-300 whitespace-nowrap">
              Signed in as{" "}
              <span className="text-sand-50 font-semibold">{meName}</span>
            </span>
            <form action="/api/wheelhouse/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-navy-300 hover:text-coral-300 underline decoration-navy-500 hover:decoration-coral-400 whitespace-nowrap"
              >
                Sign out
              </button>
            </form>
          </div>

          {/* sm: hamburger drawer toggle */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg text-sand-200 hover:bg-navy-800/60 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* sm: full-screen drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-navy-950/95 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute top-0 right-0 h-full w-72 bg-navy-900 border-l border-coral-500/20 shadow-xl shadow-navy-950/60 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] tracking-widest uppercase text-coral-300 font-bold">
                Wheelhouse menu
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded text-sand-300 hover:text-coral-300 hover:bg-navy-800/60"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-xs text-navy-300">
              Signed in as{" "}
              <span className="text-sand-50 font-semibold">{meName}</span>
            </p>

            <div className="border-t border-navy-700 pt-4">
              <p className="text-[10px] tracking-widest uppercase text-navy-500 font-bold mb-2">
                Alerts
              </p>
              <div className="flex flex-col gap-1">
                {ALERT_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/60 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-navy-700 pt-4">
              <p className="text-[10px] tracking-widest uppercase text-navy-500 font-bold mb-2">
                Tools
              </p>
              <div className="flex flex-col gap-1">
                {TOOLS_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/60 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-navy-700 pt-4">
              <p className="text-[10px] tracking-widest uppercase text-navy-500 font-bold mb-2">
                PAL site
              </p>
              <div className="flex flex-col gap-1">
                {SITE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sand-200 hover:text-coral-300 hover:bg-navy-800/60 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-navy-700 pt-4 mt-auto">
              <form action="/api/wheelhouse/logout" method="POST">
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-lg text-sm text-navy-200 hover:text-coral-300 hover:bg-navy-800/60 transition-colors text-left"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
