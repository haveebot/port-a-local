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

  // Driver availability — drivers toggle online/offline. last_online_at
  // gets bumped on toggle. We treat a driver as ON-DUTY if their
  // online_until is in the future. Default expiry: 4 hours (handles the
  // "I forgot to toggle off" case).
  // stripe_account_id tracks the driver's Stripe Connect Express account
  // for auto-payouts; charges_enabled flips true after they finish
  // onboarding.
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_driver_status (
      driver_id TEXT PRIMARY KEY,
      online_until TIMESTAMPTZ,
      last_online_at TIMESTAMPTZ,
      last_offline_at TIMESTAMPTZ,
      stripe_account_id TEXT,
      payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;
  // Migration for existing tables
  await sql`ALTER TABLE delivery_driver_status ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`;
  await sql`ALTER TABLE delivery_driver_status ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE`;

  // Per-order driver transfer record — for idempotency + audit
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_driver_transfers (
      order_id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL,
      stripe_transfer_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // The driver roster — replaces the static array in delivery-drivers.ts.
  // Drivers self-apply via /deliver/runner; admin (Winston) approves
  // via a magic-link email, which flips is_active=true + sends the
  // driver their welcome links.
  await sql`
    CREATE TABLE IF NOT EXISTS delivery_drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      token TEXT NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      payout_method TEXT,
      payout_handle TEXT,
      vehicle TEXT,
      availability TEXT,
      why TEXT,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      approved_by TEXT,
      rejected_at TIMESTAMPTZ,
      rejected_reason TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS delivery_drivers_token_idx ON delivery_drivers(token)`;
  await sql`CREATE INDEX IF NOT EXISTS delivery_drivers_is_active_idx ON delivery_drivers(is_active)`;

  _schemaReady = true;
}

/* -------------------- Drivers (DB-backed, replaces static array) -------------------- */

export interface DriverRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  token: string;
  isActive: boolean;
  payoutMethod: "venmo" | "cash" | "check" | null;
  payoutHandle: string | null;
  vehicle: string | null;
  availability: string | null;
  why: string | null;
  appliedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
}

function rowToDriver(row: Record<string, unknown>): DriverRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    token: row.token as string,
    isActive: row.is_active === true,
    payoutMethod: (row.payout_method as DriverRecord["payoutMethod"]) ?? null,
    payoutHandle: (row.payout_handle as string) ?? null,
    vehicle: (row.vehicle as string) ?? null,
    availability: (row.availability as string) ?? null,
    why: (row.why as string) ?? null,
    appliedAt: new Date(row.applied_at as string).toISOString(),
    approvedAt: row.approved_at
      ? new Date(row.approved_at as string).toISOString()
      : null,
    approvedBy: (row.approved_by as string) ?? null,
    rejectedAt: row.rejected_at
      ? new Date(row.rejected_at as string).toISOString()
      : null,
    rejectedReason: (row.rejected_reason as string) ?? null,
  };
}

export interface CreateDriverInput {
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  availability?: string;
  why?: string;
}

function newDriverId(): string {
  return `drv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function newDriverToken(): string {
  // 32-char base32-ish random token, prefixed for grep-ability
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw = "";
  for (let i = 0; i < 28; i++) {
    raw += chars[Math.floor(Math.random() * chars.length)];
  }
  return `drv_${raw}`;
}

export async function createDriverApplication(
  input: CreateDriverInput,
): Promise<DriverRecord> {
  await ensureSchema();
  const id = newDriverId();
  const token = newDriverToken();
  await sql`
    INSERT INTO delivery_drivers (
      id, name, phone, email, token, is_active,
      vehicle, availability, why
    ) VALUES (
      ${id},
      ${input.name},
      ${input.phone},
      ${input.email ?? null},
      ${token},
      FALSE,
      ${input.vehicle ?? null},
      ${input.availability ?? null},
      ${input.why ?? null}
    )
  `;
  const driver = await getDriverById(id);
  if (!driver) throw new Error("Driver vanished after insert");
  return driver;
}

export async function getDriverById(id: string): Promise<DriverRecord | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_drivers WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToDriver(rows[0]) : null;
}

export async function getDriverByTokenDb(
  token: string,
): Promise<DriverRecord | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_drivers WHERE token = ${token} LIMIT 1
  `;
  return rows[0] ? rowToDriver(rows[0]) : null;
}

/**
 * Look up by phone — matches on last 10 digits so +1 prefix variations
 * don't matter. Returns the most recent record if multiples somehow
 * exist (shouldn't, but defensive).
 */
export async function getDriverByPhone(
  phone: string,
): Promise<DriverRecord | null> {
  await ensureSchema();
  const last10 = phone.replace(/\D/g, "").slice(-10);
  if (last10.length < 10) return null;
  const { rows } = await sql`
    SELECT * FROM delivery_drivers
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE ${"%" + last10}
    ORDER BY applied_at DESC
    LIMIT 1
  `;
  return rows[0] ? rowToDriver(rows[0]) : null;
}

export async function getActiveDriversDb(): Promise<DriverRecord[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM delivery_drivers
    WHERE is_active = TRUE
    ORDER BY name ASC
  `;
  return rows.map(rowToDriver);
}

export async function approveDriver(
  id: string,
  approvedBy: string,
): Promise<DriverRecord | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE delivery_drivers
    SET is_active = TRUE,
        approved_at = ${now},
        approved_by = ${approvedBy},
        rejected_at = NULL,
        rejected_reason = NULL
    WHERE id = ${id}
  `;
  return getDriverById(id);
}

export async function rejectDriver(
  id: string,
  reason: string,
): Promise<DriverRecord | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE delivery_drivers
    SET is_active = FALSE,
        rejected_at = ${now},
        rejected_reason = ${reason}
    WHERE id = ${id}
  `;
  return getDriverById(id);
}

/* -------------------- Driver availability -------------------- */

/** Mark a driver online for the next N hours (default 4) */
export async function setDriverOnline(
  driverId: string,
  hours = 4,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO delivery_driver_status (driver_id, online_until, last_online_at)
    VALUES (${driverId}, ${until}, ${now})
    ON CONFLICT (driver_id) DO UPDATE
    SET online_until = ${until}, last_online_at = ${now}
  `;
}

/** Mark a driver offline immediately */
export async function setDriverOffline(driverId: string): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO delivery_driver_status (driver_id, online_until, last_offline_at)
    VALUES (${driverId}, NULL, ${now})
    ON CONFLICT (driver_id) DO UPDATE
    SET online_until = NULL, last_offline_at = ${now}
  `;
}

/** Returns the IDs of all drivers currently on-duty (online_until > now). */
export async function getOnlineDriverIds(): Promise<string[]> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rows } = await sql`
    SELECT driver_id FROM delivery_driver_status
    WHERE online_until IS NOT NULL AND online_until > ${now}
  `;
  return rows.map((r) => r.driver_id as string);
}

export interface DriverStatus {
  driverId: string;
  onlineUntil: string | null;
  lastOnlineAt: string | null;
  lastOfflineAt: string | null;
  isOnline: boolean;
  stripeAccountId: string | null;
  payoutsEnabled: boolean;
}

export async function getDriverStatus(
  driverId: string,
): Promise<DriverStatus> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT online_until, last_online_at, last_offline_at,
           stripe_account_id, payouts_enabled
    FROM delivery_driver_status
    WHERE driver_id = ${driverId}
    LIMIT 1
  `;
  if (!rows[0]) {
    return {
      driverId,
      onlineUntil: null,
      lastOnlineAt: null,
      lastOfflineAt: null,
      isOnline: false,
      stripeAccountId: null,
      payoutsEnabled: false,
    };
  }
  const onlineUntil = rows[0].online_until
    ? new Date(rows[0].online_until as string).toISOString()
    : null;
  return {
    driverId,
    onlineUntil,
    lastOnlineAt: rows[0].last_online_at
      ? new Date(rows[0].last_online_at as string).toISOString()
      : null,
    lastOfflineAt: rows[0].last_offline_at
      ? new Date(rows[0].last_offline_at as string).toISOString()
      : null,
    isOnline: onlineUntil ? new Date(onlineUntil) > new Date() : false,
    stripeAccountId: (rows[0].stripe_account_id as string) ?? null,
    payoutsEnabled: rows[0].payouts_enabled === true,
  };
}

export async function setDriverStripeAccount(
  driverId: string,
  stripeAccountId: string,
  payoutsEnabled: boolean,
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO delivery_driver_status (driver_id, stripe_account_id, payouts_enabled)
    VALUES (${driverId}, ${stripeAccountId}, ${payoutsEnabled})
    ON CONFLICT (driver_id) DO UPDATE
    SET stripe_account_id = ${stripeAccountId},
        payouts_enabled = ${payoutsEnabled}
  `;
}

/**
 * Idempotent record of "we transferred $X to driver Y for order Z" via
 * Stripe Connect. Returns true if a NEW transfer was recorded; false if
 * one already existed (we never double-pay).
 */
export async function recordDriverTransfer(
  orderId: string,
  driverId: string,
  stripeTransferId: string,
  amountCents: number,
): Promise<boolean> {
  await ensureSchema();
  const { rowCount } = await sql`
    INSERT INTO delivery_driver_transfers
      (order_id, driver_id, stripe_transfer_id, amount_cents)
    VALUES (${orderId}, ${driverId}, ${stripeTransferId}, ${amountCents})
    ON CONFLICT (order_id) DO NOTHING
  `;
  return (rowCount ?? 0) > 0;
}

export async function hasDriverTransfer(orderId: string): Promise<boolean> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT 1 FROM delivery_driver_transfers WHERE order_id = ${orderId} LIMIT 1
  `;
  return rows.length > 0;
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
