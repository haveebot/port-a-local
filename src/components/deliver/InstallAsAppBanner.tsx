"use client";

import { useEffect, useState } from "react";

/**
 * "Install PAL as an app" banner — only renders on iPhone Safari
 * when the page isn't already running as a PWA. Best-practice place
 * to surface the Add-to-Home-Screen flow because:
 *   - Apple's iOS push policy requires PWA install (it's NOT optional
 *     for push to work on iPhone)
 *   - Without this nudge, runners on iPhone hit "browser doesn't
 *     support push" and get confused
 *   - On every other platform (Android, desktop, iOS Safari already
 *     installed) it just doesn't show
 *
 * Dismissible via localStorage flag — once the runner installs OR
 * explicitly dismisses, it stays out of the way.
 *
 * Drop in any iPhone-relevant page (sign-in, runner hub, etc.).
 */

const DISMISS_KEY = "pal-runner-install-banner-dismissed";

export default function InstallAsAppBanner({
  context = "default",
}: {
  /** Which surface this is rendering on — drives copy emphasis. */
  context?: "default" | "sign-in" | "hub";
}) {
  const [shouldShow, setShouldShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof navigator === "undefined") return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    if (!isIOS) return;

    // Detect non-Safari iOS browsers (Chrome, Firefox, etc. on iOS).
    // They're all WebKit shells but don't expose push API. Different
    // banner copy applies — they need to OPEN in Safari first.
    const isIOSSafari =
      /Safari/.test(ua) &&
      !/CriOS|FxiOS|OPiOS|EdgiOS|YaBrowser|DuckDuckGo/.test(ua);

    // Already in standalone (PWA) mode? No banner needed — they're
    // already set up.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) return;

    // Honor a prior dismiss
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // localStorage unavailable (private mode); show anyway
    }

    // We don't gate on isIOSSafari here — non-Safari iOS users also
    // benefit from seeing the banner; we'll just adjust the copy.
    void isIOSSafari;
    setShouldShow(true);
  }, []);

  if (!shouldShow) return null;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const isIOSSafari =
    /Safari/.test(ua) &&
    !/CriOS|FxiOS|OPiOS|EdgiOS|YaBrowser|DuckDuckGo/.test(ua);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setShouldShow(false);
  }

  const headline =
    context === "hub"
      ? "Get instant order pings on this iPhone"
      : "Install PAL on your iPhone";

  return (
    <section className="bg-coral-500/15 border border-coral-500/40 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-base text-sand-50">
            {headline}
          </p>
          <p className="text-xs text-sand-300 font-light mt-0.5 leading-relaxed">
            {isIOSSafari ? (
              <>
                Add PAL to your home screen for instant push notifications when
                new orders land. Apple&apos;s iOS rule — push only works in
                installed-app mode.
              </>
            ) : (
              <>
                You&apos;re in iOS Chrome / Firefox / etc. To get push
                notifications, open this page in <strong>Safari</strong> (Apple
                rule), then add to home screen.
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-bold text-coral-300 hover:text-coral-200 mt-2 underline decoration-coral-500/40 hover:decoration-coral-300"
          >
            {expanded ? "Hide steps" : "Show me how →"}
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-sand-400 hover:text-sand-200 text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-coral-500/30 space-y-2.5">
          {!isIOSSafari && (
            <Step
              n="0"
              title="Open in Safari"
              body="Copy this URL and paste it into Safari. iOS Chrome/Firefox/etc. don't support push — Apple rule."
            />
          )}
          <Step
            n="1"
            title="Tap the Share button"
            body="The square with an up-arrow. In Safari it's at the bottom of the screen."
          />
          <Step
            n="2"
            title='Scroll down → "Add to Home Screen"'
            body="Tap it, then tap Add in the top right."
          />
          <Step
            n="3"
            title="Open PAL from the home-screen icon"
            body="It opens like a real app — no Safari URL bar. From there, push notifications work."
          />
          <Step
            n="4"
            title="Enable notifications"
            body="On your runner home, tap Enable on the bell icon. Allow when iOS asks."
          />
        </div>
      )}
    </section>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="font-mono text-xs font-bold text-coral-300 mt-0.5 w-4 flex-shrink-0">
        {n}
      </span>
      <div>
        <p className="text-xs font-bold text-sand-50">{title}</p>
        <p className="text-[11px] text-sand-300 font-light mt-0.5 leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}
