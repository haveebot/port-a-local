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
  _schemaReady = true;
}

export interface LocalsOfferRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  mode: "rent" | "hire";
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
}

function rowToOffer(row: Record<string, unknown>): LocalsOfferRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    businessName: (row.business_name as string) ?? null,
    mode: row.mode as "rent" | "hire",
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
  };
}

export interface CreateOfferInput {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  mode: "rent" | "hire";
  category: string;
  description: string;
  pricing?: string;
  availability?: string;
  photosAcknowledged?: boolean;
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
      photos_acknowledged
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
      ${input.photosAcknowledged === true}
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
