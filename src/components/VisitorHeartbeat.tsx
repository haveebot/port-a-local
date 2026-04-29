"use client";

import { useEffect } from "react";

/**
 * Mounts in root layout. Generates a random session ID on first render,
 * stores in sessionStorage, posts a heartbeat to /api/track-visitor
 * every 30s while the tab is visible. Pauses on hidden, resumes on
 * visible (via Page Visibility API).
 *
 * Best-effort — failures swallowed silently. Privacy: session ID is
 * a client-generated random token, no PII.
 */
const STORAGE_KEY = "pal-visitor-session";
const HEARTBEAT_MS = 30 * 1000;

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // sessionStorage may be blocked (e.g., private browsing in some browsers)
    return `eph-${Math.random().toString(36).slice(2, 14)}`;
  }
}

export default function VisitorHeartbeat() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    let timer: ReturnType<typeof setInterval> | null = null;

    function ping() {
      if (typeof document !== "undefined" && document.hidden) return;
      const path =
        typeof window !== "undefined" ? window.location.pathname : "/";
      // Use sendBeacon if possible — survives page unloads better
      const payload = JSON.stringify({ session_id: sessionId, path });
      try {
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/track-visitor", blob);
          return;
        }
      } catch {
        // fall through to fetch
      }
      fetch("/api/track-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // best-effort; silent on failure
      });
    }

    function start() {
      if (timer) return;
      ping(); // immediate first heartbeat
      timer = setInterval(ping, HEARTBEAT_MS);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return null;
}
