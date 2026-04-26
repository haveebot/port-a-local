"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface InitialStatus {
  isOnline: boolean;
  onlineUntil: string | null;
  payoutsEnabled: boolean;
  hasStripeAccount: boolean;
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

        {/* Payouts setup nudge if not done */}
        {!driver.payoutsEnabled && (
          <section className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-300 mb-2">
              Set up your bank
            </p>
            <p className="text-sm text-amber-100 mb-3">
              Finish the Stripe payout setup so we can deposit your earnings
              automatically. Takes ~5 minutes, one time.
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
