/**
 * PAL Delivery — order persistence.
 *
 * Postgres-backed. Self-bootstraps schema on first write (mirrors the
 * wheelhouse_analytics_events pattern — no manual migration). Mock
 * fallback throws so dev errors loudly if POSTGRES_URL isn't set.
 */

import { createPool, type VercelPool } from "@vercel/postgres";
import type { Order, OrderStatus } from "./delivery-types";

let _pool: VercelPool | null = null;
function getPool(): VercelPool {
  if (!_pool) {
    const connectionString =
      process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "delivery-store needs POSTGRES_URL or DATABASE_URL. Provision " +
          "Vercel Postgres / Neon and connect it to this project.",
      );
    }
    _pool = createPool({ connectionString });
  }
  return _pool;
}

const sql: VercelPool["sql"] = ((...args: Parameters<VercelPool["sql"]>) => {
  return getPool().sql(...args);
}) as VercelPool["sql"];

let _schemaReady = false;
async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      delivery_fee_cents INTEGER NOT NULL,
      service_fee_cents INTEGER NOT NULL,
      tip_cents INTEGER NOT NULL,
      tax_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      restaurant_cost_cents INTEGER NOT NULL DEFAULT 0,
      driver_payout_cents INTEGER NOT NULL DEFAULT 0,
      pal_net_cents INTEGER NOT NULL DEFAULT 0,
      payment_intent_id TEXT,
      checkout_session_id TEXT,
      payment_status TEXT NOT NULL,
      status TEXT NOT NULL,
      driver_id TEXT,
      placed_at TIMESTAMPTZ NOT NULL,
      paid_at TIMESTAMPTZ,
      dispatched_at TIMESTAMPTZ,
      claimed_at TIMESTAMPTZ,
      picked_up_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS delivery_orders_status_idx ON delivery_orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS delivery_orders_placed_at_idx ON delivery_orders(placed_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS delivery_orders_checkout_session_idx ON delivery_orders(checkout_session_id)`;
  // Migration for existing tables — add new columns if they don't exist
  await sql`ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS restaurant_cost_cents INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS driver_payout_cents INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS pal_net_cents INTEGER NOT NULL DEFAULT 0`;
  _schemaReady = true;
}

function newId(): string {
  return `ord-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    restaurantId: row.restaurant_id as string,
    customer: row.customer as Order["customer"],
    items: row.items as Order["items"],
    subtotalCents: row.subtotal_cents as number,
    deliveryFeeCents: row.delivery_fee_cents as number,
    serviceFeeCents: row.service_fee_cents as number,
    tipCents: row.tip_cents as number,
    taxCents: row.tax_cents as number,
    totalCents: row.total_cents as number,
    restaurantCostCents: (row.restaurant_cost_cents as number) ?? 0,
    driverPayoutCents: (row.driver_payout_cents as number) ?? 0,
    palNetCents: (row.pal_net_cents as number) ?? 0,
    paymentIntentId: (row.payment_intent_id as string) ?? undefined,
    checkoutSessionId: (row.checkout_session_id as string) ?? undefined,
    paymentStatus: row.payment_status as Order["paymentStatus"],
    status: row.status as OrderStatus,
    driverId: (row.driver_id as string) ?? undefined,
    placedAt: new Date(row.placed_at as string).toISOString(),
    paidAt: row.paid_at
      ? new Date(row.paid_at as string).toISOString()
      : undefined,
    dispatchedAt: row.dispatched_at
      ? new Date(row.dispatched_at as string).toISOString()
      : undefined,
    claimedAt: row.claimed_at
      ? new Date(row.claimed_at as string).toISOString()
      : undefined,
    pickedUpAt: row.picked_up_at
      ? new Date(row.picked_up_at as string).toISOString()
      : undefined,
    deliveredAt: row.delivered_at
      ? new Date(row.delivered_at as string).toISOString()
      : undefined,
  };
}

export interface CreateOrderInput {
  restaurantId: string;
  customer: Order["customer"];
  items: Order["items"];
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  tipCents: number;
  taxCents: number;
  totalCents: number;
  restaurantCostCents: number;
  driverPayoutCents: number;
  palNetCents: number;
  checkoutSessionId?: string;
  paymentIntentId?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await ensureSchema();
  const id = newId();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO delivery_orders (
      id, restaurant_id, customer, items,
      subtotal_cents, delivery_fee_cents, service_fee_cents, tip_cents,
      tax_cents, total_cents,
      restaurant_cost_cents, driver_payout_cents, pal_net_cents,
      checkout_session_id, payment_intent_id,
      payment_status, status, placed_at
    ) VALUES (
      ${id},
      ${input.restaurantId},
      ${JSON.stringify(input.customer)}::jsonb,
      ${JSON.stringify(input.items)}::jsonb,
      ${input.subtotalCents},
      ${input.deliveryFeeCents},
      ${input.serviceFeeCents},
      ${input.tipCents},
      ${input.taxCents},
      ${input.totalCents},
      ${input.restaurantCostCents},
      ${input.driverPayoutCents},
      ${input.palNetCents},
      ${input.checkoutSessionId ?? null},
      ${input.paymentIntentId ?? null},
      'pending',
      'placed',
      ${now}
    )
  `;
  const order = await getOrder(id);
  if (!order) throw new Error("Order vanished after insert");
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_orders WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function getOrderByCheckoutSession(
  sessionId: string,
): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_orders
    WHERE checkout_session_id = ${sessionId}
    LIMIT 1
  `;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

/** Mark an order paid + transition to dispatching. Idempotent. */
export async function markOrderPaid(
  id: string,
  paymentIntentId: string,
): Promise<Order | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE delivery_orders
    SET payment_status = 'paid',
        status = CASE WHEN status = 'placed' THEN 'dispatching' ELSE status END,
        payment_intent_id = ${paymentIntentId},
        paid_at = COALESCE(paid_at, ${now}),
        dispatched_at = COALESCE(dispatched_at, ${now})
    WHERE id = ${id}
  `;
  return getOrder(id);
}

/**
 * Atomic first-claim-wins. Returns true if THIS driver won the race;
 * false if someone else already claimed it (or order isn't dispatching).
 */
export async function claimOrder(
  id: string,
  driverId: string,
): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rowCount } = await sql`
    UPDATE delivery_orders
    SET status = 'claimed',
        driver_id = ${driverId},
        claimed_at = ${now}
    WHERE id = ${id} AND status = 'dispatching'
  `;
  return (rowCount ?? 0) > 0;
}

export async function transitionOrder(
  id: string,
  status: OrderStatus,
  driverId: string,
): Promise<Order | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  // Only the assigned driver can transition picked_up / delivered
  if (status === "picked_up") {
    await sql`
      UPDATE delivery_orders
      SET status = 'picked_up', picked_up_at = ${now}
      WHERE id = ${id} AND driver_id = ${driverId} AND status = 'claimed'
    `;
  } else if (status === "delivered") {
    await sql`
      UPDATE delivery_orders
      SET status = 'delivered', delivered_at = ${now}
      WHERE id = ${id} AND driver_id = ${driverId} AND status = 'picked_up'
    `;
  } else {
    throw new Error(
      `transitionOrder only handles picked_up / delivered (got ${status})`,
    );
  }
  return getOrder(id);
}

/** Recent orders — for the Wheelhouse Deliveries thread + admin views */
export async function getRecentOrders(limit = 50): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_orders
    ORDER BY placed_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToOrder);
}
