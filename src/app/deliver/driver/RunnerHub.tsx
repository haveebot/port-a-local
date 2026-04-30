"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InstallAsAppBanner from "@/components/deliver/InstallAsAppBanner";

interface InitialStatus {
  isOnline: boolean;
  onlineUntil: string | null;
  payoutsEnabled: boolean;
  hasStripeAccount: boolean;
  firstDeliveryBonusEarned?: boolean;
  pushEnabled?: boolean;
}

interface FeedOrder {
  id: string;
  restaurantName: string;
  pickupAddress: string;
  dropAddress: string;
  dropNotes?: string;
  itemSummary: string;
  payoutCents: number;
  tipCents: number;
  status:
    | "placed"
    | "paid"
    | "dispatching"
    | "claimed"
    | "picked_up"
    | "delivered"
    | "canceled"
    | "refunded";
  placedAt: string;
  paidAt: string | null;
  claimedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
}

interface Feed {
  driver: InitialStatus & { id: string; name: string };
  available: FeedOrder[];
  active: FeedOrder[];
  earnings: {
    todayCents: number;
    todayCount: number;
    weekCents: number;
    weekCount: number;
    allTimeCount: number;
  };
}

const POLL_MS = 20_000;

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function relativeFuture(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.floor((new Date(iso).getTime() - Date.now()) / 60_000);
  if (mins < 0) return "soon";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export default function RunnerHub({
  driverId,
  driverName,
  initialStatus,
}: {
  driverId: string;
  driverName: string;
  initialStatus: InitialStatus;
}) {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const lastAvailableCount = useRef(0);
  const [newOrderPing, setNewOrderPing] = useState(false);

  // Initial + polling fetch
  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const res = await fetch("/api/deliver/driver/feed", {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Feed;
        if (!alive) return;
        // New-order chime/pulse
        if (
          data.available.length > lastAvailableCount.current &&
          lastAvailableCount.current >= 0
        ) {
          setNewOrderPing(true);
          setTimeout(() => setNewOrderPing(false), 3000);
        }
        lastAvailableCount.current = data.available.length;
        setFeed(data);
      } catch {
        // ignore — keep last feed
      }
    }
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  async function toggleDuty() {
    if (!feed) return;
    setBusy("duty");
    setErr(null);
    try {
      const path = feed.driver.isOnline ? "offline" : "online";
      const res = await fetch(`/api/deliver/driver/${path}`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Toggle failed.");
      } else {
        setFeed((f) =>
          f
            ? {
                ...f,
                driver: {
                  ...f.driver,
                  isOnline: data.status.isOnline,
                  onlineUntil: data.status.onlineUntil,
                },
              }
            : f,
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  // Convert URL-safe base64 VAPID public key to BufferSource for the
  // browser pushManager.subscribe() call. We allocate a fresh
  // ArrayBuffer (not SharedArrayBuffer) because the browser API's
  // applicationServerKey type is strict about that distinction.
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

  async function enablePush() {
    setBusy("push");
    setErr(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        // Diagnose the unsupported case — iOS has a particularly
        // confusing setup (every browser is a Safari shell; only
        // Safari + PWA install gets push). Give specific guidance
        // instead of generic "try Chrome" that ends up wrong on iOS.
        const ua = navigator.userAgent || "";
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        const isIOSSafari =
          isIOS &&
          /Safari/.test(ua) &&
          !/CriOS|FxiOS|OPiOS|EdgiOS|YaBrowser|DuckDuckGo/.test(ua);
        const isStandalone =
          window.matchMedia?.("(display-mode: standalone)").matches ||
          // legacy iOS Safari API
          (window.navigator as unknown as { standalone?: boolean })
            .standalone === true;

        if (isIOS && !isIOSSafari) {
          setErr(
            "iOS Chrome / Firefox / etc. don't support push (Apple rule — they're all Safari under the hood). Open this page in Safari, tap the Share button → Add to Home Screen, then open PAL from your home screen and try again.",
          );
        } else if (isIOSSafari && !isStandalone) {
          setErr(
            "On iPhone, push works once PAL is installed as an app. Tap the Share button (square with arrow at the bottom) → Add to Home Screen. Open PAL from the new home-screen icon and try again.",
          );
        } else if (isIOS) {
          setErr(
            "iOS push needs version 16.4 or newer. Update iOS in Settings → General → Software Update, then try again.",
          );
        } else {
          setErr(
            "This browser doesn't support push notifications. Try Chrome (Android/desktop), Firefox, or Edge.",
          );
        }
        return;
      }
      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublic) {
        setErr(
          "Push notifications aren't configured server-side yet. Email hello@theportalocal.com.",
        );
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setErr(
          "You denied notifications. Re-enable in your browser settings (lock icon → Notifications → Allow), then try again.",
        );
        return;
      }
      // Register the service worker (idempotent — returns existing
      // registration if already registered).
      const reg = await navigator.serviceWorker.register("/sw.js");
      // Re-use existing subscription if present + matches our VAPID key,
      // otherwise create a new one.
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBufferSource(vapidPublic),
        });
      }
      const res = await fetch("/api/deliver/driver/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Couldn't enable notifications.");
      } else {
        setFeed((f) =>
          f
            ? { ...f, driver: { ...f.driver, pushEnabled: true } }
            : f,
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function disablePush() {
    setBusy("push");
    setErr(null);
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          try {
            await sub.unsubscribe();
          } catch {
            // Browser-side unsubscribe failed — server-side clear still happens
          }
        }
      }
      const res = await fetch("/api/deliver/driver/push/unsubscribe", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Couldn't turn off notifications.");
      } else {
        setFeed((f) =>
          f
            ? { ...f, driver: { ...f.driver, pushEnabled: false } }
            : f,
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function openStripeDashboard() {
    setBusy("stripe-dashboard");
    setErr(null);
    try {
      const res = await fetch("/api/deliver/driver/connect/dashboard", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErr(data.error ?? "Couldn't open Stripe dashboard.");
      } else {
        // One-time URL — open in new tab so the runner keeps their PAL session.
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function claim(orderId: string) {
    setBusy(`claim-${orderId}`);
    setErr(null);
    try {
      const res = await fetch(
        `/api/deliver/order/${orderId}/claim`,
        {
          method: "POST",
          credentials: "same-origin",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? data.reason ?? "Couldn't claim.");
      } else {
        // Optimistic: refresh feed
        router.refresh();
        // Also re-poll
        const r = await fetch("/api/deliver/driver/feed", {
          credentials: "same-origin",
        });
        if (r.ok) setFeed(await r.json());
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const driver = feed?.driver ?? {
    id: driverId,
    name: driverName,
    ...initialStatus,
  };
  const isOnline = driver.isOnline;
  const earnings = feed?.earnings ?? {
    todayCents: 0,
    todayCount: 0,
    weekCents: 0,
    weekCount: 0,
    allTimeCount: 0,
  };
  const available = feed?.available ?? [];
  const active = feed?.active ?? [];

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 pb-12">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-coral-300">
            PAL Delivery · Runner
          </p>
          <p className="font-display text-lg font-bold mt-0.5">
            Hey, {driver.name.split(" ")[0]}
          </p>
        </div>
        <form action="/api/deliver/driver/logout" method="POST">
          <button
            type="submit"
            className="text-[11px] text-sand-400 hover:text-coral-300 underline decoration-sand-600 hover:decoration-coral-400"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 py-6 space-y-5">
        <InstallAsAppBanner context="hub" />
        {/* On-duty toggle card */}
        <section
          className={
            isOnline
              ? "bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl p-5"
              : "bg-navy-800 border border-navy-700 rounded-2xl p-5"
          }
        >
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300">
              Status
            </p>
            {isOnline && driver.onlineUntil && (
              <p className="text-[11px] text-sand-400 font-mono">
                Auto-off in {relativeFuture(driver.onlineUntil)}
              </p>
            )}
          </div>
          <p className="font-display text-3xl font-bold mb-3">
            {isOnline ? (
              <span className="text-emerald-300">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                ON DUTY
              </span>
            ) : (
              <span className="text-sand-300">Off duty</span>
            )}
          </p>
          <button
            onClick={toggleDuty}
            disabled={busy === "duty"}
            className={
              isOnline
                ? "w-full py-4 rounded-xl text-base font-bold bg-sand-700 hover:bg-sand-800 text-sand-50 disabled:opacity-50"
                : "w-full py-4 rounded-xl text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
            }
          >
            {busy === "duty"
              ? "Updating…"
              : isOnline
                ? "Go off duty"
                : "I'm here — go on duty"}
          </button>
        </section>

        {/* Push notifications toggle. Off-state = subtle nudge; on-state =
            confirmation. Browser-permission gated — tapping triggers
            native browser permission prompt the first time. */}
        <section
          className={
            driver.pushEnabled
              ? "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3"
              : "bg-navy-800 border border-navy-700 rounded-xl p-4 flex items-center justify-between gap-3"
          }
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">
              {driver.pushEnabled ? "🔔" : "🔕"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-sand-50">
                {driver.pushEnabled
                  ? "Notifications on"
                  : "Get pinged on new orders"}
              </p>
              <p className="text-[11px] text-sand-400 font-light">
                {driver.pushEnabled
                  ? "Your phone buzzes the second a new order dispatches."
                  : "Faster than SMS or email — direct to your phone."}
              </p>
            </div>
          </div>
          <button
            onClick={driver.pushEnabled ? disablePush : enablePush}
            disabled={busy === "push"}
            className={
              driver.pushEnabled
                ? "px-3 py-2 rounded-lg text-xs font-bold bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-200 disabled:opacity-50 flex-shrink-0"
                : "px-3 py-2 rounded-lg text-xs font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50 flex-shrink-0"
            }
          >
            {busy === "push"
              ? "…"
              : driver.pushEnabled
                ? "Turn off"
                : "Enable"}
          </button>
        </section>

        {/* Rewards ladder — Tier 1 is live (auto-fires via Stripe);
            Tiers 2-4 are tracked but rewards deferred (per
            "Runner Rewards Program — Design.md" in vault). Showing
            the future tiers gives runners aspirational visibility
            without committing to deliver them tonight. */}
        <section className="bg-navy-800 border border-navy-700 rounded-2xl p-5">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300">
              Rewards
            </p>
            <p className="text-[10px] text-sand-500 font-mono">
              {earnings.allTimeCount} delivered
            </p>
          </div>
          {(() => {
            const tiers = [
              {
                threshold: 1,
                label: "Welcome bonus",
                reward: "$5 cash",
                live: true,
                earned:
                  driver.firstDeliveryBonusEarned === true ||
                  earnings.allTimeCount >= 1,
              },
              {
                threshold: 10,
                label: "Brand ambassador",
                reward: "$25 + PAL shirt",
                live: false,
                earned: false,
              },
              {
                threshold: 50,
                label: "Loyalty tier",
                reward: "$100 cash",
                live: false,
                earned: false,
              },
              {
                threshold: 250,
                label: "Apex tier",
                reward: "Apple Watch",
                live: false,
                earned: false,
              },
            ];
            return (
              <div className="space-y-2.5">
                {tiers.map((t) => {
                  const progress = Math.min(
                    earnings.allTimeCount / t.threshold,
                    1,
                  );
                  const isCurrent =
                    !t.earned && earnings.allTimeCount < t.threshold;
                  return (
                    <div key={t.threshold}>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <p className="text-sm">
                          <span
                            className={
                              t.earned
                                ? "font-display font-bold text-emerald-300"
                                : "font-display font-bold text-sand-50"
                            }
                          >
                            {t.earned ? "✓ " : ""}
                            {t.threshold === 1
                              ? "1st delivery"
                              : `${t.threshold} deliveries`}
                          </span>{" "}
                          <span className="text-sand-400 font-light">
                            · {t.reward}
                          </span>
                        </p>
                        <p
                          className={
                            t.earned
                              ? "text-[10px] font-bold tracking-widest uppercase text-emerald-300 font-mono"
                              : t.live
                                ? "text-[10px] font-bold tracking-widest uppercase text-coral-300 font-mono"
                                : "text-[10px] font-bold tracking-widest uppercase text-sand-500 font-mono"
                          }
                        >
                          {t.earned
                            ? "Earned"
                            : t.live
                              ? "Live"
                              : "Coming soon"}
                        </p>
                      </div>
                      <div className="h-1.5 bg-navy-900 rounded-full overflow-hidden">
                        <div
                          className={
                            t.earned
                              ? "h-full bg-emerald-400"
                              : isCurrent
                                ? "h-full bg-coral-400"
                                : "h-full bg-sand-700"
                          }
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      {isCurrent && (
                        <p className="text-[11px] text-sand-400 font-mono mt-1">
                          {earnings.allTimeCount} / {t.threshold}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <p className="text-[11px] text-sand-500 font-light italic mt-3">
            Welcome bonus auto-paid to your bank on your first delivery.
            Higher tiers tracked — we&apos;ll send rewards when the program
            opens up.
          </p>
        </section>

        {/* Payouts setup nudge if not done. Comforting language —
            we don't punish runners who go on duty first; we just
            backfill manually. But best to finish Stripe first so the
            auto-deposit kicks in from delivery #1. */}
        {!driver.payoutsEnabled && (
          <section className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-300 mb-2">
              Set up your bank — best to do this first
            </p>
            <p className="text-sm text-amber-100 mb-2 leading-relaxed">
              Finish Stripe payout setup{" "}
              <strong className="text-amber-50">
                before your first run
              </strong>{" "}
              so your earnings auto-deposit the second you tap Delivered.
              Takes ~5 minutes, one time. Stripe holds the bank info — we
              never see it.
            </p>
            <p className="text-xs text-amber-200/80 mb-4 leading-relaxed font-light italic">
              If you run before finishing, no big deal — we&apos;ll backfill
              your earnings manually once you&apos;re set up.
            </p>
            <a
              href="/deliver/driver/payouts"
              className="inline-block px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-navy-900 hover:bg-amber-400"
            >
              Set up payouts →
            </a>
          </section>
        )}

        {/* Earnings */}
        <section className="grid grid-cols-3 gap-2">
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-0.5">
              Today
            </p>
            <p className="font-display text-xl font-bold tabular-nums">
              {fmt(earnings.todayCents)}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {earnings.todayCount} runs
            </p>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-0.5">
              7 days
            </p>
            <p className="font-display text-xl font-bold tabular-nums">
              {fmt(earnings.weekCents)}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {earnings.weekCount} runs
            </p>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-0.5">
              Available
            </p>
            <p className="font-display text-xl font-bold tabular-nums">
              {available.length}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {available.length === 1 ? "order" : "orders"}
            </p>
          </div>
        </section>

        {/* Stripe Express dashboard — only shown once payouts are set up.
            Opens in a new tab so the PAL session stays put. Runner can see
            balance, payout schedule, trigger an instant payout (1.5% fee). */}
        {driver.payoutsEnabled && (
          <button
            onClick={openStripeDashboard}
            disabled={busy === "stripe-dashboard"}
            className="block w-full py-3 rounded-xl text-sm font-bold text-center bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-200 disabled:opacity-50"
          >
            {busy === "stripe-dashboard"
              ? "Opening Stripe…"
              : "View Stripe payouts dashboard →"}
          </button>
        )}

        {err && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Active orders (claimed or picked up) */}
        {active.length > 0 && (
          <section>
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
              In progress ({active.length})
            </p>
            <div className="space-y-2">
              {active.map((o) => (
                <a
                  key={o.id}
                  href={`/deliver/driver/${o.id}`}
                  className="block bg-coral-500/15 border border-coral-500/40 rounded-xl p-4 hover:border-coral-500/70"
                >
                  <p className="font-display font-bold text-base">
                    {o.restaurantName}
                  </p>
                  <p className="text-xs text-sand-300 font-light mt-1">
                    → {o.dropAddress}
                  </p>
                  <p className="text-[11px] text-coral-300 font-mono uppercase tracking-widest mt-2">
                    {o.status === "claimed" ? "Heading to pickup" : "Out for delivery"}
                    {" · "}
                    Tap to continue →
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Available orders */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <p
              className={
                newOrderPing
                  ? "text-[10px] font-bold tracking-widest uppercase text-emerald-300 animate-pulse"
                  : "text-[10px] font-bold tracking-widest uppercase text-coral-300"
              }
            >
              {newOrderPing ? "✨ NEW ORDER" : "Available now"} ({available.length})
            </p>
            {!isOnline && (
              <p className="text-[10px] text-amber-300 italic">
                Go on duty to claim
              </p>
            )}
          </div>

          {available.length === 0 ? (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 text-center">
              <p className="text-sm text-sand-400 font-light">
                Nothing in the queue right now. We poll every {POLL_MS / 1000}s
                — new orders show up automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {available.map((o) => {
                const isBusy = busy === `claim-${o.id}`;
                return (
                  <div
                    key={o.id}
                    className="bg-navy-800 border border-navy-700 rounded-xl p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="font-display font-bold text-base">
                        {o.restaurantName}
                      </p>
                      <p className="text-emerald-300 font-mono font-bold tabular-nums">
                        {fmt(o.payoutCents)}
                      </p>
                    </div>
                    <p className="text-xs text-sand-400 font-light">
                      {o.itemSummary}
                    </p>
                    <p className="text-xs text-sand-300 mt-2">
                      <span className="text-sand-500">From:</span>{" "}
                      {o.pickupAddress}
                    </p>
                    <p className="text-xs text-sand-300">
                      <span className="text-sand-500">To:</span> {o.dropAddress}
                    </p>
                    <button
                      onClick={() => claim(o.id)}
                      disabled={!isOnline || isBusy}
                      className="w-full mt-3 py-3 rounded-lg font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBusy
                        ? "Claiming…"
                        : isOnline
                          ? `Claim — earn ${fmt(o.payoutCents)} →`
                          : "Go on duty to claim"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-[11px] text-sand-500 font-light text-center pt-2">
          Auto-refreshing every {POLL_MS / 1000}s. Pull-to-refresh works too.
        </p>
      </div>
    </main>
  );
}
