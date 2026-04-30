"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "placed"
  | "paid"
  | "dispatching"
  | "claimed"
  | "picked_up"
  | "delivered"
  | "canceled"
  | "refunded";

interface RunnerInfo {
  signupNumber: number;
  vehicle: string | null;
}

interface OrderState {
  id: string;
  status: OrderStatus;
  paidAt: string | null;
  claimedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  driverId: string | null;
}

const POLL_MS = 20_000;

/**
 * Live status tracker for the customer-facing order success page.
 *
 * Renders a 4-stage progress bar (Paid → Heading to pickup → Out for
 * delivery → Delivered) with timestamps + anonymized runner info
 * ("Driver #N · 2018 Ford Ranger") once the order is claimed.
 *
 * Polls every 20s alongside the runner hub poll cadence — they share
 * the same 20s rhythm so customer + runner see the same state at
 * roughly the same moment.
 */
export default function OrderTracker({
  orderId,
  initialOrder,
  initialRunner,
}: {
  orderId: string;
  initialOrder: OrderState;
  initialRunner: RunnerInfo | null;
}) {
  const [order, setOrder] = useState<OrderState>(initialOrder);
  const [runner, setRunner] = useState<RunnerInfo | null>(initialRunner);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const res = await fetch(`/api/deliver/order/${orderId}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        if (data.order) {
          // Only patch the fields we care about — keeps re-renders shallow.
          setOrder({
            id: data.order.id,
            status: data.order.status,
            paidAt: data.order.paidAt ?? null,
            claimedAt: data.order.claimedAt ?? null,
            pickedUpAt: data.order.pickedUpAt ?? null,
            deliveredAt: data.order.deliveredAt ?? null,
            driverId: data.order.driverId ?? null,
          });
        }
        if (data.runner) setRunner(data.runner);
      } catch {
        // Silent fail — keep last good state, try again next tick.
      }
    }
    // First pull happens server-side (initial props), so we can wait
    // a full interval before the first client refresh.
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [orderId]);

  const isTerminal =
    order.status === "delivered" ||
    order.status === "canceled" ||
    order.status === "refunded";

  if (order.status === "canceled" || order.status === "refunded") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="font-display text-2xl font-bold text-red-900 mb-2">
          {order.status === "canceled" ? "Canceled" : "Refunded"}
        </p>
        <p className="text-sm text-red-700">
          Reach out at hello@theportalocal.com if anything looks off.
        </p>
      </div>
    );
  }

  // 4-stage flow: Paid → Heading to pickup → Out for delivery → Delivered
  const stages = [
    {
      id: "paid",
      label: "Paid",
      sublabel: "Order received",
      doneAt: order.paidAt,
      isCurrent: order.status === "paid" || order.status === "dispatching",
    },
    {
      id: "claimed",
      label: "Driver heading to pickup",
      sublabel: runner
        ? `Driver #${runner.signupNumber}${runner.vehicle ? ` · ${runner.vehicle}` : ""}`
        : "Looking for a driver",
      doneAt: order.claimedAt,
      isCurrent: order.status === "claimed",
    },
    {
      id: "picked_up",
      label: "Out for delivery",
      sublabel: runner
        ? `Driver #${runner.signupNumber} has your order`
        : "On the way",
      doneAt: order.pickedUpAt,
      isCurrent: order.status === "picked_up",
    },
    {
      id: "delivered",
      label: "Delivered",
      sublabel: "Enjoy 🌅",
      doneAt: order.deliveredAt,
      isCurrent: order.status === "delivered",
    },
  ];

  function stageState(s: (typeof stages)[number]) {
    if (s.doneAt) return "done";
    if (s.isCurrent) return "current";
    return "pending";
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          Live status
        </p>
        {!isTerminal && (
          <p className="text-[11px] text-navy-400 font-mono inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Updating
          </p>
        )}
      </div>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const state = stageState(s);
          return (
            <div key={s.id} className="flex items-start gap-3">
              {/* Status indicator */}
              <div className="flex flex-col items-center pt-0.5">
                <div
                  className={
                    state === "done"
                      ? "w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
                      : state === "current"
                        ? "w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 ring-4 ring-coral-200 animate-pulse"
                        : "w-7 h-7 rounded-full bg-sand-200 text-navy-400 flex items-center justify-center font-bold text-xs flex-shrink-0"
                  }
                >
                  {state === "done" ? "✓" : i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={
                      state === "done"
                        ? "w-0.5 h-7 bg-emerald-400 mt-1"
                        : "w-0.5 h-7 bg-sand-200 mt-1"
                    }
                  />
                )}
              </div>

              {/* Label + sublabel + timestamp */}
              <div className="flex-1 pb-2 min-w-0">
                <p
                  className={
                    state === "current"
                      ? "font-display font-bold text-base text-coral-700"
                      : state === "done"
                        ? "font-display font-bold text-base text-navy-900"
                        : "font-display font-bold text-base text-navy-400"
                  }
                >
                  {s.label}
                </p>
                <p
                  className={
                    state === "pending"
                      ? "text-xs text-navy-400 font-light"
                      : "text-xs text-navy-600 font-light"
                  }
                >
                  {s.sublabel}
                </p>
                {s.doneAt && (
                  <p className="text-[11px] text-navy-400 font-mono mt-0.5">
                    {new Date(s.doneAt).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {order.status === "delivered" && (
        <div className="mt-5 pt-5 border-t border-sand-200 text-center">
          <p className="font-display text-lg font-bold text-emerald-700">
            Thanks for ordering local.
          </p>
          <p className="text-xs text-navy-500 font-light mt-1">
            Hit any rough edges? Reply to your receipt — we read every one.
          </p>
        </div>
      )}
    </div>
  );
}
