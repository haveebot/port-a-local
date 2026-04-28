"use client";

/**
 * Generic "Enable push notifications" button.
 *
 * Wraps the browser-side subscribe dance (service worker + VAPID +
 * pushManager.subscribe) and posts the resulting subscription to
 * /api/push/subscribe with the caller-supplied subscriberKind +
 * subscriberId. Works for every PAL push role:
 *
 *   - wheelhouse-participant (subscriberId = participant id)
 *   - cart-vendor            (subscriberId = vendor slug)
 *   - locals-seller          (subscriberId = listing id)
 *   - restaurant             (subscriberId = restaurant slug)
 *   - housekeeping-vendor    (subscriberId = vendor slug)
 *   - customer-topic         (subscriberId = topic name)
 *
 * iOS-aware: explains the Add to Home Screen requirement when push
 * isn't yet available — Apple gates web push behind PWA install on
 * iOS, and the wrong browser will silently fail otherwise.
 */
import { useEffect, useState } from "react";

type SubscriberKind =
  | "wheelhouse-participant"
  | "cart-vendor"
  | "locals-seller"
  | "restaurant"
  | "housekeeping-vendor"
  | "customer-topic";

interface Props {
  subscriberKind: SubscriberKind;
  subscriberId: string;
  /** Label rendered when push is OFF (default: "Enable alerts") */
  enableLabel?: string;
  /** Label rendered when push is ON (default: "Alerts on") */
  onLabel?: string;
  /** Compact = small inline pill; default = larger card-style button */
  compact?: boolean;
}

function urlBase64ToBufferSource(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return buffer;
}

export default function EnablePushButton({
  subscriberKind,
  subscriberId,
  enableLabel = "Enable alerts",
  onLabel = "Alerts on",
  compact = false,
}: Props) {
  const [state, setState] = useState<"idle" | "busy" | "on">("idle");
  const [err, setErr] = useState<string | null>(null);

  // Detect existing subscription on mount so the UI shows the right
  // state without forcing the user to re-subscribe.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window))
          return;
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (!cancelled && sub) setState("on");
      } catch {
        // ignore — caller will retry via button
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setErr(null);
    setState("busy");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        const ua = navigator.userAgent || "";
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        const isIOSSafari =
          isIOS &&
          /Safari/.test(ua) &&
          !/CriOS|FxiOS|OPiOS|EdgiOS|YaBrowser|DuckDuckGo/.test(ua);
        const isStandalone =
          window.matchMedia?.("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone?: boolean })
            .standalone === true;

        if (isIOS && !isIOSSafari) {
          setErr(
            "On iPhone, push only works in Safari (Apple rule). Open this page in Safari, tap Share → Add to Home Screen, then open PAL from your home screen and try again.",
          );
        } else if (isIOSSafari && !isStandalone) {
          setErr(
            "On iPhone, push works once PAL is installed as an app. Tap Share (square with arrow at the bottom) → Add to Home Screen. Open PAL from the new icon and try again.",
          );
        } else if (isIOS) {
          setErr(
            "iOS push needs version 16.4 or newer. Update in Settings → General → Software Update, then try again.",
          );
        } else {
          setErr(
            "This browser doesn't support push notifications. Try Chrome, Firefox, or Edge.",
          );
        }
        setState("idle");
        return;
      }
      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublic) {
        setErr(
          "Push notifications aren't configured server-side yet. Email hello@theportalocal.com.",
        );
        setState("idle");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setErr(
          "You denied notifications. Re-enable in your browser settings (lock icon → Notifications → Allow), then try again.",
        );
        setState("idle");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBufferSource(vapidPublic),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          subscriberKind,
          subscriberId,
          subscription: sub.toJSON(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Couldn't enable notifications.");
        setState("idle");
        return;
      }
      setState("on");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setState("idle");
    }
  }

  const onState = state === "on";
  const busy = state === "busy";

  if (compact) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={onState ? undefined : enable}
          disabled={busy || onState}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
            onState
              ? "bg-emerald-600/15 text-emerald-700 border border-emerald-500/30 cursor-default"
              : "bg-coral-500/15 text-coral-200 border border-coral-400/40 hover:bg-coral-500/25"
          } ${busy ? "opacity-60" : ""}`}
        >
          {onState ? `🔔 ${onLabel}` : busy ? "Enabling…" : `🔔 ${enableLabel}`}
        </button>
        {err && (
          <span className="text-[10px] text-coral-300 max-w-[260px] text-right leading-snug">
            {err}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-sand-300 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-navy-900">
            Push notifications
          </p>
          <p className="text-xs text-navy-600 mt-1 leading-relaxed">
            Get an OS-level alert the second something needs your attention.
            Works on installed PAL (Add to Home Screen) — instant and offline.
          </p>
        </div>
        <button
          type="button"
          onClick={onState ? undefined : enable}
          disabled={busy || onState}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            onState
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-navy-900 text-sand-50 hover:bg-coral-600"
          } ${busy ? "opacity-60" : ""}`}
        >
          {onState ? `🔔 ${onLabel}` : busy ? "Enabling…" : enableLabel}
        </button>
      </div>
      {err && (
        <p className="mt-3 text-xs text-coral-700 leading-relaxed">{err}</p>
      )}
    </div>
  );
}
