import { NextRequest, NextResponse } from "next/server";
import { sql as vercelSql } from "@vercel/postgres";
import { getDriverByToken } from "@/data/delivery-drivers";
import { getDriverStatus } from "@/data/delivery-store";
import { getRestaurant } from "@/data/delivery-restaurants";
import type { OrderStatus } from "@/data/delivery-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface FeedOrderSummary {
  id: string;
  restaurantName: string;
  pickupAddress: string;
  dropAddress: string;
  dropNotes?: string;
  itemSummary: string;
  payoutCents: number;
  tipCents: number;
  status: OrderStatus;
  placedAt: string;
  paidAt: string | null;
  claimedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
}

/**
 * GET /api/deliver/driver/feed?t=<driver_token>
 *
 * The runner hub's data backbone. Returns:
 *   - driver status (online/offline, payouts enabled, last seen)
 *   - available orders (status='dispatching', no driver_id yet)
 *   - this runner's in-flight orders (claimed or picked_up by them)
 *   - this runner's deliveries today + their take so far
 *
 * Polled every ~20s by the runner hub client to keep the UI live.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const driver = await getDriverByToken(token);
  if (!driver) {
    return NextResponse.json({ error: "Invalid driver token" }, { status: 403 });
  }

  const status = await getDriverStatus(driver.id);

  // 1. Available orders (dispatching, unclaimed) — anyone on duty can grab
  const { rows: availRows } = await vercelSql`
    SELECT id, restaurant_id, customer, items, tip_cents, driver_payout_cents,
           status, placed_at, paid_at, claimed_at, picked_up_at, delivered_at
    FROM delivery_orders
    WHERE status = 'dispatching' AND driver_id IS NULL
    ORDER BY paid_at DESC
    LIMIT 10
  `;

  // 2. This driver's active orders (claimed or picked_up)
  const { rows: activeRows } = await vercelSql`
    SELECT id, restaurant_id, customer, items, tip_cents, driver_payout_cents,
           status, placed_at, paid_at, claimed_at, picked_up_at, delivered_at
    FROM delivery_orders
    WHERE driver_id = ${driver.id}
      AND status IN ('claimed', 'picked_up')
    ORDER BY claimed_at DESC
    LIMIT 5
  `;

  // 3. Today's delivered count + take, plus week
  const startOfTodayCt = (() => {
    // Midnight in America/Chicago, expressed as ISO UTC
    const now = new Date();
    const ct = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" }),
    );
    const local = new Date(ct.getFullYear(), ct.getMonth(), ct.getDate(), 0, 0, 0);
    return local.toISOString();
  })();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { rows: earningsRows } = await vercelSql`
    SELECT
      COALESCE(SUM(driver_payout_cents) FILTER (WHERE delivered_at >= ${startOfTodayCt}), 0) AS today_cents,
      COUNT(*) FILTER (WHERE delivered_at >= ${startOfTodayCt}) AS today_count,
      COALESCE(SUM(driver_payout_cents) FILTER (WHERE delivered_at >= ${sevenDaysAgo}), 0) AS week_cents,
      COUNT(*) FILTER (WHERE delivered_at >= ${sevenDaysAgo}) AS week_count
    FROM delivery_orders
    WHERE driver_id = ${driver.id} AND status = 'delivered'
  `;

  function rowToSummary(r: Record<string, unknown>): FeedOrderSummary {
    const restaurant = getRestaurant(r.restaurant_id as string);
    const customer = r.customer as {
      name: string;
      deliveryAddress: string;
      deliveryNotes?: string;
    };
    const items = r.items as { quantity: number; itemName: string }[];
    return {
      id: r.id as string,
      restaurantName:
        restaurant?.name ?? (r.restaurant_id as string),
      pickupAddress: restaurant?.pickupAddress ?? "",
      dropAddress: customer.deliveryAddress,
      dropNotes: customer.deliveryNotes,
      itemSummary: items
        .map((i) => `${i.quantity}× ${i.itemName}`)
        .join(", "),
      payoutCents: (r.driver_payout_cents as number) ?? 0,
      tipCents: (r.tip_cents as number) ?? 0,
      status: r.status as OrderStatus,
      placedAt: new Date(r.placed_at as string).toISOString(),
      paidAt: r.paid_at
        ? new Date(r.paid_at as string).toISOString()
        : null,
      claimedAt: r.claimed_at
        ? new Date(r.claimed_at as string).toISOString()
        : null,
      pickedUpAt: r.picked_up_at
        ? new Date(r.picked_up_at as string).toISOString()
        : null,
      deliveredAt: r.delivered_at
        ? new Date(r.delivered_at as string).toISOString()
        : null,
    };
  }

  return NextResponse.json({
    driver: {
      id: driver.id,
      name: driver.name,
      isOnline: status.isOnline,
      onlineUntil: status.onlineUntil,
      payoutsEnabled: status.payoutsEnabled,
      hasStripeAccount: !!status.stripeAccountId,
    },
    available: availRows.map(rowToSummary),
    active: activeRows.map(rowToSummary),
    earnings: {
      todayCents: Number(earningsRows[0]?.today_cents ?? 0),
      todayCount: Number(earningsRows[0]?.today_count ?? 0),
      weekCents: Number(earningsRows[0]?.week_cents ?? 0),
      weekCount: Number(earningsRows[0]?.week_count ?? 0),
    },
  });
}
