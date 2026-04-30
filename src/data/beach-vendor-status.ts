/**
 * Beach vendor Stripe Connect status — tracks the per-vendor Express
 * account ID + payouts-enabled flag so we can fire transfers on
 * fulfilled bookings without re-checking Stripe every time.
 *
 * Mirrors the runner pattern in `delivery-store.ts` — same shape,
 * different table name + slug-keyed (vs driver_id).
 *
 * Vendors onboard via /beach/vendor/[slug]/connect → Stripe-hosted
 * Express form → on completion Stripe redirects back to PAL and our
 * refresh endpoint marks payouts_enabled=true.
 *
 * Manual override: Winston can create Connect accounts via Stripe
 * Dashboard for vendors who'd rather not self-serve, then paste the
 * acct_… ID into a Wheelhouse admin tool (TBD) which calls
 * setBeachVendorStripeAccount().
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS beach_vendor_status (
      vendor_slug TEXT PRIMARY KEY,
      stripe_account_id TEXT,
      payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      onboarded_at TIMESTAMPTZ,
      last_dashboard_at TIMESTAMPTZ
    )
  `;
  _schemaReady = true;
}

export interface BeachVendorStatus {
  vendorSlug: string;
  stripeAccountId: string | null;
  payoutsEnabled: boolean;
  onboardedAt: string | null;
  lastDashboardAt: string | null;
}

function rowToRec(row: Record<string, unknown>): BeachVendorStatus {
  return {
    vendorSlug: row.vendor_slug as string,
    stripeAccountId: (row.stripe_account_id as string) ?? null,
    payoutsEnabled: Boolean(row.payouts_enabled),
    onboardedAt: row.onboarded_at
      ? new Date(row.onboarded_at as string).toISOString()
      : null,
    lastDashboardAt: row.last_dashboard_at
      ? new Date(row.last_dashboard_at as string).toISOString()
      : null,
  };
}

export async function getBeachVendorStatus(
  vendorSlug: string,
): Promise<BeachVendorStatus> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM beach_vendor_status WHERE vendor_slug = ${vendorSlug} LIMIT 1
    `;
    if (rows[0]) return rowToRec(rows[0]);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[beach-vendor-status] read failed:", err);
    }
  }
  return {
    vendorSlug,
    stripeAccountId: null,
    payoutsEnabled: false,
    onboardedAt: null,
    lastDashboardAt: null,
  };
}

/**
 * Set or update the Stripe Connect account ID for a vendor. Idempotent
 * upsert. payoutsEnabled defaults to false on first insert; refresh
 * the value separately via setBeachVendorPayoutsEnabled.
 */
export async function setBeachVendorStripeAccount(
  vendorSlug: string,
  stripeAccountId: string,
  payoutsEnabled: boolean,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO beach_vendor_status (
      vendor_slug, stripe_account_id, payouts_enabled, onboarded_at
    ) VALUES (
      ${vendorSlug}, ${stripeAccountId}, ${payoutsEnabled},
      ${payoutsEnabled ? now : null}
    )
    ON CONFLICT (vendor_slug) DO UPDATE
    SET stripe_account_id = EXCLUDED.stripe_account_id,
        payouts_enabled = EXCLUDED.payouts_enabled,
        onboarded_at = COALESCE(beach_vendor_status.onboarded_at, EXCLUDED.onboarded_at)
  `;
}

export async function setBeachVendorPayoutsEnabled(
  vendorSlug: string,
  payoutsEnabled: boolean,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE beach_vendor_status
    SET payouts_enabled = ${payoutsEnabled},
        onboarded_at = COALESCE(onboarded_at, ${payoutsEnabled ? now : null})
    WHERE vendor_slug = ${vendorSlug}
  `;
}

export async function markBeachVendorDashboardVisit(
  vendorSlug: string,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE beach_vendor_status
    SET last_dashboard_at = ${now}
    WHERE vendor_slug = ${vendorSlug}
  `;
}

/** All beach-vendor statuses — for the Wheelhouse admin overview. */
export async function listAllBeachVendorStatuses(): Promise<BeachVendorStatus[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM beach_vendor_status ORDER BY vendor_slug`;
    return rows.map(rowToRec);
  } catch {
    return [];
  }
}
