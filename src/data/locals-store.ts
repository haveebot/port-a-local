/**
 * PAL Locals — provider-offer DB layer.
 *
 * Stores incoming `/locals/offer` submissions so:
 *   - Winston can approve/reject via HMAC-signed magic links in the
 *     admin email (mirrors runner approval pattern)
 *   - Approved offers persist beyond the email — won't be lost in inbox
 *   - Two-stage verification: applicant ATTESTS at signup that they'll
 *     email photos; admin separately VERIFIES photos arrived. Same
 *     two-stage model as runner license + insurance.
 *
 * Note: this table holds OFFERS (provider applications). Live LISTINGS
 * (what customers browse on /locals) still live in
 * src/data/locals-listings.ts hand-curated TS for v1. Once an offer is
 * approved + photos verified, Winston manually adds to that file.
 * Future: collapse into one DB-backed listing model.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS locals_offers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      business_name TEXT,
      mode TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      pricing TEXT,
      availability TEXT,
      photos_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
      photos_verified_at TIMESTAMPTZ,
      photos_verified_by TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      approved_by TEXT,
      rejected_at TIMESTAMPTZ,
      rejected_reason TEXT
    )
  `;
  // Sell-mode columns (added 2026-04-27 — Etsy-style on-PAL listings).
  // Idempotent migration so existing rows continue to work.
  await sql`ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS price_cents INTEGER`;
  await sql`ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS fulfillment_note TEXT`;

  // Stripe Connect columns for sell-mode vendor self-onboarding.
  // Vendor portal at /locals/vendor/[offerId] mints accountLinks; the
  // account.updated webhook flips stripe_payouts_enabled when Stripe
  // confirms the vendor's Connect account is live for transfers.
  await sql`ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`;
  await sql`ALTER TABLE locals_offers ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE`;

  // Sell-mode purchase ledger — one row per Stripe Checkout session
  // for sell-mode buys. Used for email-send idempotency (so a
  // customer refreshing the success page doesn't re-fire vendor
  // notification emails) and as the audit trail for sales.
  await sql`
    CREATE TABLE IF NOT EXISTS locals_purchases (
      stripe_session_id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_message TEXT,
      vendor_amount_cents INTEGER NOT NULL,
      pal_fee_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      stripe_payment_intent_id TEXT,
      paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      emails_sent_at TIMESTAMPTZ
    )
  `;

  _schemaReady = true;
}

export interface LocalsOfferRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  mode: "rent" | "hire" | "sell";
  category: string;
  description: string;
  pricing: string | null;
  availability: string | null;
  photosAcknowledged: boolean;
  photosVerifiedAt: string | null;
  photosVerifiedBy: string | null;
  submittedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  /** Sell-mode only: vendor's set price in cents */
  priceCents: number | null;
  /** Sell-mode only: vendor's fulfillment plan (free-form) */
  fulfillmentNote: string | null;
  /** Sell-mode only: vendor's Stripe Connect Express account ID, set
      when vendor onboards via /locals/vendor/[offerId]. */
  stripeAccountId: string | null;
  /** Sell-mode only: true after Stripe confirms vendor's Connect
      account is live for transfers (charges_enabled + payouts_enabled).
      Webhook + refresh route both flip this. */
  stripePayoutsEnabled: boolean;
}

function rowToOffer(row: Record<string, unknown>): LocalsOfferRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    businessName: (row.business_name as string) ?? null,
    mode: row.mode as "rent" | "hire" | "sell",
    category: row.category as string,
    description: row.description as string,
    pricing: (row.pricing as string) ?? null,
    availability: (row.availability as string) ?? null,
    photosAcknowledged: row.photos_acknowledged === true,
    photosVerifiedAt: row.photos_verified_at
      ? new Date(row.photos_verified_at as string).toISOString()
      : null,
    photosVerifiedBy: (row.photos_verified_by as string) ?? null,
    submittedAt: new Date(row.submitted_at as string).toISOString(),
    approvedAt: row.approved_at
      ? new Date(row.approved_at as string).toISOString()
      : null,
    approvedBy: (row.approved_by as string) ?? null,
    rejectedAt: row.rejected_at
      ? new Date(row.rejected_at as string).toISOString()
      : null,
    rejectedReason: (row.rejected_reason as string) ?? null,
    priceCents: row.price_cents != null ? Number(row.price_cents) : null,
    fulfillmentNote: (row.fulfillment_note as string) ?? null,
    stripeAccountId: (row.stripe_account_id as string) ?? null,
    stripePayoutsEnabled: row.stripe_payouts_enabled === true,
  };
}

export interface CreateOfferInput {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  mode: "rent" | "hire" | "sell";
  category: string;
  description: string;
  pricing?: string;
  availability?: string;
  photosAcknowledged?: boolean;
  /** Sell-mode only: vendor's price in cents */
  priceCents?: number;
  /** Sell-mode only: vendor's fulfillment plan ("ship USPS",
      "pickup at studio", "I'll meet you at the marina", etc.) */
  fulfillmentNote?: string;
}

function newOfferId(): string {
  return `offer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createLocalsOffer(
  input: CreateOfferInput,
): Promise<LocalsOfferRecord> {
  await ensureSchema();
  const id = newOfferId();
  await sql`
    INSERT INTO locals_offers (
      id, name, phone, email, business_name,
      mode, category, description, pricing, availability,
      photos_acknowledged, price_cents, fulfillment_note
    ) VALUES (
      ${id},
      ${input.name},
      ${input.phone},
      ${input.email ?? null},
      ${input.businessName ?? null},
      ${input.mode},
      ${input.category},
      ${input.description},
      ${input.pricing ?? null},
      ${input.availability ?? null},
      ${input.photosAcknowledged === true},
      ${input.priceCents ?? null},
      ${input.fulfillmentNote ?? null}
    )
  `;
  const offer = await getLocalsOffer(id);
  if (!offer) throw new Error("Offer vanished after insert");
  return offer;
}

export async function getLocalsOffer(
  id: string,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM locals_offers WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToOffer(rows[0]) : null;
}

export async function approveLocalsOffer(
  id: string,
  approvedBy: string,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE locals_offers
    SET approved_at = ${now},
        approved_by = ${approvedBy},
        rejected_at = NULL,
        rejected_reason = NULL
    WHERE id = ${id}
  `;
  return getLocalsOffer(id);
}

export async function rejectLocalsOffer(
  id: string,
  reason: string,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE locals_offers
    SET rejected_at = ${now},
        rejected_reason = ${reason},
        approved_at = NULL
    WHERE id = ${id}
  `;
  return getLocalsOffer(id);
}

export async function markLocalsOfferPhotosVerified(
  id: string,
  verifiedBy: string,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE locals_offers
    SET photos_verified_at = ${now},
        photos_verified_by = ${verifiedBy}
    WHERE id = ${id}
  `;
  return getLocalsOffer(id);
}

/**
 * Stamp Stripe Connect account ID + payouts state on an offer.
 * Called by /api/locals/vendor/connect/start (after creating the
 * Express account), the refresh route, and the account.updated
 * webhook. Idempotent — safe to call repeatedly.
 */
export async function setLocalsOfferStripeAccount(
  id: string,
  stripeAccountId: string,
  payoutsEnabled: boolean,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  await sql`
    UPDATE locals_offers
    SET stripe_account_id = ${stripeAccountId},
        stripe_payouts_enabled = ${payoutsEnabled}
    WHERE id = ${id}
  `;
  return getLocalsOffer(id);
}

/**
 * Lookup an offer by its Stripe Connect account ID — used by the
 * account.updated webhook to find the row to flip on incoming events.
 */
export async function getLocalsOfferByStripeAccount(
  stripeAccountId: string,
): Promise<LocalsOfferRecord | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM locals_offers
    WHERE stripe_account_id = ${stripeAccountId}
    LIMIT 1
  `;
  return rows[0] ? rowToOffer(rows[0]) : null;
}

/* ------------------- Sell-mode purchase ledger ------------------- */

export interface LocalsPurchaseRecord {
  stripeSessionId: string;
  listingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerMessage: string | null;
  vendorAmountCents: number;
  palFeeCents: number;
  totalCents: number;
  stripePaymentIntentId: string | null;
  paidAt: string;
  emailsSentAt: string | null;
}

function rowToPurchase(row: Record<string, unknown>): LocalsPurchaseRecord {
  return {
    stripeSessionId: row.stripe_session_id as string,
    listingId: row.listing_id as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    customerMessage: (row.customer_message as string) ?? null,
    vendorAmountCents: Number(row.vendor_amount_cents),
    palFeeCents: Number(row.pal_fee_cents),
    totalCents: Number(row.total_cents),
    stripePaymentIntentId: (row.stripe_payment_intent_id as string) ?? null,
    paidAt: new Date(row.paid_at as string).toISOString(),
    emailsSentAt: row.emails_sent_at
      ? new Date(row.emails_sent_at as string).toISOString()
      : null,
  };
}

export interface CreatePurchaseInput {
  stripeSessionId: string;
  listingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerMessage?: string;
  vendorAmountCents: number;
  palFeeCents: number;
  totalCents: number;
  stripePaymentIntentId?: string;
}

/**
 * Idempotently insert a purchase row keyed by Stripe session ID.
 * Returns the existing row if already present (so a customer
 * refreshing the success page doesn't duplicate). The caller can
 * inspect `emailsSentAt` to decide whether to fire the email cascade.
 */
export async function createOrGetLocalsPurchase(
  input: CreatePurchaseInput,
): Promise<LocalsPurchaseRecord> {
  await ensureSchema();
  await sql`
    INSERT INTO locals_purchases (
      stripe_session_id, listing_id,
      customer_name, customer_email, customer_phone, customer_message,
      vendor_amount_cents, pal_fee_cents, total_cents,
      stripe_payment_intent_id
    ) VALUES (
      ${input.stripeSessionId},
      ${input.listingId},
      ${input.customerName},
      ${input.customerEmail},
      ${input.customerPhone},
      ${input.customerMessage ?? null},
      ${input.vendorAmountCents},
      ${input.palFeeCents},
      ${input.totalCents},
      ${input.stripePaymentIntentId ?? null}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
  const purchase = await getLocalsPurchase(input.stripeSessionId);
  if (!purchase) throw new Error("Purchase vanished after upsert");
  return purchase;
}

export async function getLocalsPurchase(
  stripeSessionId: string,
): Promise<LocalsPurchaseRecord | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM locals_purchases
    WHERE stripe_session_id = ${stripeSessionId}
    LIMIT 1
  `;
  return rows[0] ? rowToPurchase(rows[0]) : null;
}

/**
 * Stamp emails_sent_at so refreshes of the success page don't
 * re-fire vendor/customer/admin notifications. Returns true on
 * first successful stamp, false if already stamped (race-safe).
 */
export async function markLocalsPurchaseEmailsSent(
  stripeSessionId: string,
): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rowCount } = await sql`
    UPDATE locals_purchases
    SET emails_sent_at = ${now}
    WHERE stripe_session_id = ${stripeSessionId}
      AND emails_sent_at IS NULL
  `;
  return (rowCount ?? 0) > 0;
}
