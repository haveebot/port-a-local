/**
 * Cart-rental first-look priority window state.
 *
 * When a customer reserves a cart and a vendor with `firstLookMinutes > 0`
 * exists for the requested cart size, that vendor receives the lead alone
 * for N minutes via SMS + email. The rest of the directory is blasted at
 * window expiry, OR immediately if the priority vendor replies PASS, OR
 * never if they reply ACCEPT.
 *
 * One row per (lead_id, vendor_slug) pair — multiple priority vendors
 * matching the same lead get parallel rows + parallel windows.
 *
 * Status transitions:
 *   pending  → accepted (vendor replied ACCEPT/CLAIM — fan-out cancelled)
 *   pending  → passed   (vendor replied PASS — fan-out fires immediately)
 *   pending  → expired  (cron found expires_at <= NOW — fan-out fires)
 *
 * The expiry cron at /api/cron/cart-first-look-expire runs every minute,
 * scans for status='pending' AND expires_at<=NOW, fires the open-blast
 * and flips status to 'expired'. Idempotent.
 *
 * Origin: 2026-05-09. Bron's Beach Carts is the canonical first-look
 * priority vendor (30 min window). Pattern is generalized — any vendor
 * with `firstLookMinutes` set in cart-vendors.ts gets the orchestration.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS cart_rental_first_look_pending (
      id              SERIAL PRIMARY KEY,
      lead_id         TEXT NOT NULL,
      vendor_slug     TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at      TIMESTAMPTZ NOT NULL,
      status          TEXT NOT NULL DEFAULT 'pending',
      accepted_via_phone TEXT,
      lead_metadata   JSONB NOT NULL,
      resolved_at     TIMESTAMPTZ,
      UNIQUE (lead_id, vendor_slug)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS cart_rental_first_look_pending_active_idx
    ON cart_rental_first_look_pending(status, expires_at)
    WHERE status = 'pending'
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS cart_rental_first_look_pending_lead_idx
    ON cart_rental_first_look_pending(lead_id)
  `;
  _schemaReady = true;
}

export type FirstLookStatus = "pending" | "accepted" | "passed" | "expired";

export interface FirstLookLeadMetadata {
  cartSize: string;
  cartLabel: string; // "6-Passenger Golf Cart"
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  pickupFormatted: string;
  returnFormatted: string;
  pickupShort: string; // SMS-friendly
  returnShort: string;
  numDays: number;
  customerName: string;
  // customerPhone / customerEmail stay on the row for refund + operator
  // use, but are NEVER surfaced to vendor SMS. Per the PAL-as-listed-
  // provider rule (locked 2026-05-09): vendor only knows name + dates +
  // handoff choice. PAL relays anything else.
  customerPhone: string;
  customerEmail: string;
  reservationFee: number;
  // Customer's pickup/delivery choice. Vendor is required to honor it.
  handoff: "delivery" | "pickup";
}

export interface FirstLookPendingRow {
  id: number;
  leadId: string;
  vendorSlug: string;
  createdAt: string;
  expiresAt: string;
  status: FirstLookStatus;
  acceptedViaPhone: string | null;
  leadMetadata: FirstLookLeadMetadata;
  resolvedAt: string | null;
}

function rowToRec(row: Record<string, unknown>): FirstLookPendingRow {
  return {
    id: row.id as number,
    leadId: row.lead_id as string,
    vendorSlug: row.vendor_slug as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    expiresAt: new Date(row.expires_at as string).toISOString(),
    status: row.status as FirstLookStatus,
    acceptedViaPhone: (row.accepted_via_phone as string) ?? null,
    leadMetadata:
      typeof row.lead_metadata === "string"
        ? (JSON.parse(row.lead_metadata) as FirstLookLeadMetadata)
        : (row.lead_metadata as FirstLookLeadMetadata),
    resolvedAt: row.resolved_at
      ? new Date(row.resolved_at as string).toISOString()
      : null,
  };
}

/**
 * Insert a fresh first-look window for a vendor on a lead. Idempotent —
 * (lead_id, vendor_slug) is UNIQUE, so re-running for the same lead is
 * a no-op. Returns the row.
 */
export async function startFirstLookWindow(args: {
  leadId: string;
  vendorSlug: string;
  windowMinutes: number;
  metadata: FirstLookLeadMetadata;
}): Promise<FirstLookPendingRow | null> {
  await ensureSchema();
  const expiresAt = new Date(Date.now() + args.windowMinutes * 60_000).toISOString();
  try {
    const { rows } = await sql`
      INSERT INTO cart_rental_first_look_pending
        (lead_id, vendor_slug, expires_at, status, lead_metadata)
      VALUES
        (${args.leadId}, ${args.vendorSlug}, ${expiresAt}::timestamptz,
         'pending', ${JSON.stringify(args.metadata)}::jsonb)
      ON CONFLICT (lead_id, vendor_slug) DO NOTHING
      RETURNING *
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch (err) {
    console.error("[first-look-store] startFirstLookWindow failed:", err);
    return null;
  }
}

/**
 * Find pending first-look rows for a vendor (any lead). Used by the
 * inbound SMS webhook when a vendor replies ACCEPT/PASS — we look up
 * which lead they're responding to (most recent pending wins if more
 * than one is open simultaneously).
 */
export async function getMostRecentPendingForVendor(
  vendorSlug: string,
): Promise<FirstLookPendingRow | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_rental_first_look_pending
      WHERE vendor_slug = ${vendorSlug}
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch (err) {
    console.error("[first-look-store] getMostRecentPendingForVendor failed:", err);
    return null;
  }
}

/**
 * Mark a first-look row as accepted (vendor replied ACCEPT). Idempotent
 * via the WHERE status='pending' clause — repeat ACCEPTs after the first
 * are no-ops.
 *
 * Returns true if this call won the race (i.e. status was pending and is
 * now accepted), false otherwise. Caller should fire the customer-info
 * follow-up SMS and confirmation only on a true return.
 */
export async function markAccepted(args: {
  id: number;
  acceptedViaPhone: string;
}): Promise<boolean> {
  try {
    await ensureSchema();
    const { rowCount } = await sql`
      UPDATE cart_rental_first_look_pending
      SET status = 'accepted',
          accepted_via_phone = ${args.acceptedViaPhone},
          resolved_at = NOW()
      WHERE id = ${args.id} AND status = 'pending'
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[first-look-store] markAccepted failed:", err);
    return false;
  }
}

/**
 * Mark a first-look row as passed (vendor replied PASS). Returns true
 * if this call won the race. Caller fires the open-blast on a true return.
 */
export async function markPassed(id: number): Promise<boolean> {
  try {
    await ensureSchema();
    const { rowCount } = await sql`
      UPDATE cart_rental_first_look_pending
      SET status = 'passed',
          resolved_at = NOW()
      WHERE id = ${id} AND status = 'pending'
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[first-look-store] markPassed failed:", err);
    return false;
  }
}

/**
 * Mark a first-look row as expired (cron fired the expiry handler).
 * Returns true if this call won the race.
 */
export async function markExpired(id: number): Promise<boolean> {
  try {
    await ensureSchema();
    const { rowCount } = await sql`
      UPDATE cart_rental_first_look_pending
      SET status = 'expired',
          resolved_at = NOW()
      WHERE id = ${id} AND status = 'pending'
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[first-look-store] markExpired failed:", err);
    return false;
  }
}

/**
 * Pull all rows whose first-look window has expired but status is still
 * pending — the cron's input. Returns rows in stable order so re-runs
 * within the same minute don't reshuffle.
 */
export async function getExpiredPending(): Promise<FirstLookPendingRow[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_rental_first_look_pending
      WHERE status = 'pending' AND expires_at <= NOW()
      ORDER BY expires_at ASC, id ASC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[first-look-store] getExpiredPending failed:", err);
    return [];
  }
}

/**
 * All pending first-look rows — for the wheelhouse operator surface
 * (countdown timer / "Bron's has 22 min left" view). Includes recently
 * resolved rows so the operator can see the outcome at a glance.
 */
export async function getRecentFirstLookActivity(
  limit = 20,
): Promise<FirstLookPendingRow[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_rental_first_look_pending
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[first-look-store] getRecentFirstLookActivity failed:", err);
    return [];
  }
}

/**
 * Currently pending first-look rows — for the wheelhouse "live" panel.
 */
export async function getPendingFirstLook(): Promise<FirstLookPendingRow[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_rental_first_look_pending
      WHERE status = 'pending'
      ORDER BY expires_at ASC
    `;
    return rows.map(rowToRec);
  } catch (err) {
    console.error("[first-look-store] getPendingFirstLook failed:", err);
    return [];
  }
}
