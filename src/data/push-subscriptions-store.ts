/**
 * Generic web-push subscription store.
 *
 * One table for every subscriber type — wheelhouse participants,
 * cart-rental vendors, locals sellers, restaurants, customer event
 * topics. Each subscription is keyed on (subscriber_kind, subscriber_id)
 * with the browser's PushSubscription JSON stored as text.
 *
 * Why a generic table instead of per-table fields like
 * delivery_drivers.push_subscription_json:
 *   - Multiple subscriber kinds share the same web-push primitives
 *     (VAPID, sendPushToSubscription, expired-cleanup) — keeping
 *     subscriptions in one table makes the push fan-out trivial
 *   - One person can subscribe as multiple kinds (a cart-vendor
 *     who's also a seller) without schema duplication
 *   - Easy admin views: "show me everyone subscribed to wheelhouse
 *     pushes" is a single query
 *
 * Runner push (delivery_drivers.push_subscription_json) stays where
 * it is — proven in production, no reason to migrate. New subscriber
 * kinds use this table.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      subscriber_kind TEXT NOT NULL,
      subscriber_id TEXT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      subscription_json TEXT NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_pushed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS push_subscriptions_subscriber_idx ON push_subscriptions(subscriber_kind, subscriber_id)`;
  _schemaReady = true;
}

export type SubscriberKind =
  | "wheelhouse-participant"
  | "cart-vendor"
  | "locals-seller"
  | "restaurant"
  | "housekeeping-vendor"
  | "customer-topic";

export interface PushSubscriptionRecord {
  id: string;
  subscriberKind: SubscriberKind;
  subscriberId: string;
  endpoint: string;
  subscriptionJson: string;
  userAgent: string | null;
  createdAt: string;
  lastPushedAt: string | null;
}

function rowToRec(row: Record<string, unknown>): PushSubscriptionRecord {
  return {
    id: row.id as string,
    subscriberKind: row.subscriber_kind as SubscriberKind,
    subscriberId: row.subscriber_id as string,
    endpoint: row.endpoint as string,
    subscriptionJson: row.subscription_json as string,
    userAgent: (row.user_agent as string) ?? null,
    createdAt: new Date(row.created_at as string).toISOString(),
    lastPushedAt: row.last_pushed_at
      ? new Date(row.last_pushed_at as string).toISOString()
      : null,
  };
}

function newSubId(): string {
  return `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UpsertSubscriptionInput {
  subscriberKind: SubscriberKind;
  subscriberId: string;
  endpoint: string;
  subscriptionJson: string;
  userAgent?: string;
}

/**
 * Upsert by endpoint. Re-subscribing from the same browser updates
 * the existing row's subscriber link instead of creating a duplicate.
 * Endpoint is the unique device-channel identifier.
 */
export async function upsertSubscription(
  input: UpsertSubscriptionInput,
): Promise<PushSubscriptionRecord> {
  await ensureSchema();
  const { rows: existing } = await sql`
    SELECT id FROM push_subscriptions
    WHERE endpoint = ${input.endpoint} LIMIT 1
  `;
  if (existing[0]) {
    const id = existing[0].id as string;
    await sql`
      UPDATE push_subscriptions
      SET subscriber_kind = ${input.subscriberKind},
          subscriber_id = ${input.subscriberId},
          subscription_json = ${input.subscriptionJson},
          user_agent = COALESCE(${input.userAgent ?? null}, user_agent)
      WHERE id = ${id}
    `;
    const { rows } = await sql`
      SELECT * FROM push_subscriptions WHERE id = ${id} LIMIT 1
    `;
    return rowToRec(rows[0]);
  }
  const id = newSubId();
  await sql`
    INSERT INTO push_subscriptions (
      id, subscriber_kind, subscriber_id, endpoint, subscription_json, user_agent
    ) VALUES (
      ${id},
      ${input.subscriberKind},
      ${input.subscriberId},
      ${input.endpoint},
      ${input.subscriptionJson},
      ${input.userAgent ?? null}
    )
  `;
  const { rows } = await sql`
    SELECT * FROM push_subscriptions WHERE id = ${id} LIMIT 1
  `;
  return rowToRec(rows[0]);
}

/**
 * All live subscriptions for a given subscriber. Used to fan out a
 * push event to every device the subscriber has installed PAL on.
 */
export async function getSubscriptionsFor(
  kind: SubscriberKind,
  id: string,
): Promise<PushSubscriptionRecord[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM push_subscriptions
      WHERE subscriber_kind = ${kind}
        AND subscriber_id = ${id}
      ORDER BY created_at DESC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[push-subs] getSubscriptionsFor failed:", err);
    }
    return [];
  }
}

/**
 * All live subscriptions across every subscriber of a given kind.
 * Use for blast-style fan-outs (e.g., new cart booking → every cart
 * vendor with a subscription). For targeted pushes use getSubscriptionsFor.
 */
export async function getSubscriptionsByKind(
  kind: SubscriberKind,
): Promise<PushSubscriptionRecord[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM push_subscriptions
      WHERE subscriber_kind = ${kind}
      ORDER BY created_at DESC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[push-subs] getSubscriptionsByKind failed:", err);
    }
    return [];
  }
}

/**
 * Mark a subscription as pushed-to (advances last_pushed_at). Used
 * for soft observability — see when each device last got a notification.
 */
export async function markPushed(id: string): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE push_subscriptions
    SET last_pushed_at = ${now}
    WHERE id = ${id}
  `;
}

/**
 * Delete a subscription whose endpoint returned 404/410 from the push
 * service (browser uninstalled / permission revoked). Caller should
 * invoke this from the push fan-out loop when sendPushToSubscription
 * returns expired=true.
 */
export async function deleteSubscription(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM push_subscriptions WHERE id = ${id}`;
}

/**
 * Check whether ANY subscription exists for a subscriber. Cheap call
 * for UI ("you've subscribed on X devices") without dragging the full
 * subscription_json blob into the response.
 */
export async function countSubscriptionsFor(
  kind: SubscriberKind,
  id: string,
): Promise<number> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT COUNT(*)::int AS n FROM push_subscriptions
      WHERE subscriber_kind = ${kind}
        AND subscriber_id = ${id}
    `;
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}
