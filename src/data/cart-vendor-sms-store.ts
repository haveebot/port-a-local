/**
 * Cart-vendor SMS opt-in state.
 *
 * The A2P 10DLC campaign C2KO2MB is registered for *customer* SMS with
 * explicit form-checkbox opt-in. Cart vendors are a B2B audience whose
 * inclusion in the SMS blast requires its own consent record. This store
 * holds that record per vendor slug.
 *
 * Lifecycle:
 *   pending     — admin sent invite, no reply yet (or no invite sent)
 *   opted_in    — vendor replied YES via SMS (or admin marked manually)
 *   opted_out   — vendor replied NO/STOP/UNSUBSCRIBE etc.
 *
 * Inbound webhook (/api/twilio/sms/inbound) flips the state. Admin tool
 * (/wheelhouse/cart-vendors-sms) sends invites and lets Winston override
 * manually for vendors who consent verbally (phone call, in person).
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS cart_vendor_sms_consents (
      vendor_slug TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('pending','opted_in','opted_out')),
      phone_e164 TEXT NOT NULL,
      invited_at TIMESTAMPTZ,
      opted_in_at TIMESTAMPTZ,
      opted_out_at TIMESTAMPTZ,
      last_inbound_sid TEXT,
      last_inbound_body TEXT,
      manual_override BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS cart_vendor_sms_phone_idx ON cart_vendor_sms_consents(phone_e164)`;
  _schemaReady = true;
}

export type SmsConsentStatus = "pending" | "opted_in" | "opted_out";

export interface SmsConsentRecord {
  vendorSlug: string;
  status: SmsConsentStatus;
  phoneE164: string;
  invitedAt: string | null;
  optedInAt: string | null;
  optedOutAt: string | null;
  lastInboundSid: string | null;
  lastInboundBody: string | null;
  manualOverride: boolean;
  notes: string | null;
}

function rowToRec(row: Record<string, unknown>): SmsConsentRecord {
  return {
    vendorSlug: row.vendor_slug as string,
    status: row.status as SmsConsentStatus,
    phoneE164: row.phone_e164 as string,
    invitedAt: row.invited_at ? new Date(row.invited_at as string).toISOString() : null,
    optedInAt: row.opted_in_at ? new Date(row.opted_in_at as string).toISOString() : null,
    optedOutAt: row.opted_out_at ? new Date(row.opted_out_at as string).toISOString() : null,
    lastInboundSid: (row.last_inbound_sid as string) ?? null,
    lastInboundBody: (row.last_inbound_body as string) ?? null,
    manualOverride: Boolean(row.manual_override),
    notes: (row.notes as string) ?? null,
  };
}

/**
 * Normalize any US phone number to E.164 (+1XXXXXXXXXX). Used for
 * matching inbound webhook From numbers against vendor records.
 */
export function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) return raw;
  return `+1${digits}`;
}

export async function getAllConsents(): Promise<SmsConsentRecord[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM cart_vendor_sms_consents ORDER BY vendor_slug`;
    return rows.map(rowToRec);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cart-vendor-sms] getAllConsents failed:", err);
    }
    return [];
  }
}

export async function getConsentBySlug(
  vendorSlug: string,
): Promise<SmsConsentRecord | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_vendor_sms_consents
      WHERE vendor_slug = ${vendorSlug} LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getConsentByPhone(
  phoneE164: string,
): Promise<SmsConsentRecord | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM cart_vendor_sms_consents
      WHERE phone_e164 = ${phoneE164} LIMIT 1
    `;
    return rows[0] ? rowToRec(rows[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Record that we sent an opt-in invite SMS to this vendor.
 * Idempotent — re-inviting bumps invited_at but doesn't reset status if
 * vendor already opted in or out.
 */
export async function recordInvite(
  vendorSlug: string,
  phoneE164: string,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO cart_vendor_sms_consents (vendor_slug, status, phone_e164, invited_at)
    VALUES (${vendorSlug}, 'pending', ${phoneE164}, ${now})
    ON CONFLICT (vendor_slug) DO UPDATE
    SET phone_e164 = ${phoneE164},
        invited_at = ${now}
  `;
}

/**
 * Flip a vendor to opted-in. Called from the inbound webhook on YES
 * reply, or from the admin tool for verbal consent.
 */
export async function recordOptIn(
  vendorSlug: string,
  opts: { inboundSid?: string; inboundBody?: string; manual?: boolean } = {},
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE cart_vendor_sms_consents
    SET status = 'opted_in',
        opted_in_at = ${now},
        opted_out_at = NULL,
        last_inbound_sid = ${opts.inboundSid ?? null},
        last_inbound_body = ${opts.inboundBody ?? null},
        manual_override = ${Boolean(opts.manual)}
    WHERE vendor_slug = ${vendorSlug}
  `;
}

/**
 * Flip a vendor to opted-out. Called from the inbound webhook on
 * NO/STOP/UNSUBSCRIBE, or from the admin tool. Idempotent.
 */
export async function recordOptOut(
  vendorSlug: string,
  opts: { inboundSid?: string; inboundBody?: string; manual?: boolean } = {},
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE cart_vendor_sms_consents
    SET status = 'opted_out',
        opted_in_at = NULL,
        opted_out_at = ${now},
        last_inbound_sid = ${opts.inboundSid ?? null},
        last_inbound_body = ${opts.inboundBody ?? null},
        manual_override = ${Boolean(opts.manual)}
    WHERE vendor_slug = ${vendorSlug}
  `;
}

/**
 * Slugs of vendors currently opted in to SMS — useful for audit /
 * tracking who explicitly confirmed (vs default-included via Winston's
 * 2026-04-29 rule). Not used by the blast filter anymore.
 */
export async function getOptedInSlugs(): Promise<string[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT vendor_slug FROM cart_vendor_sms_consents
      WHERE status = 'opted_in'
    `;
    return rows.map((r) => r.vendor_slug as string);
  } catch {
    return [];
  }
}

/**
 * Slugs of vendors who have explicitly OPTED OUT of SMS — feeds the
 * rent-confirm blast loop's exclusion list. Per Winston's policy
 * 2026-04-29: cart vendors in the directory are treated as default
 * opt-in; manual opt-out (STOP / NO reply) is the only way they don't
 * receive blasts. So the blast targets ALL active SMS-capable vendors
 * EXCEPT those returned here.
 */
export async function getOptedOutSlugs(): Promise<string[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT vendor_slug FROM cart_vendor_sms_consents
      WHERE status = 'opted_out'
    `;
    return rows.map((r) => r.vendor_slug as string);
  } catch {
    return [];
  }
}
