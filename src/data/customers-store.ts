/**
 * Apple Sign-In customer persistence.
 *
 * Postgres-backed, self-bootstrapping schema (mirrors the delivery-store
 * pattern — no manual migration). Best-effort: if POSTGRES_URL isn't
 * configured we log and return a synthetic record so sign-in keeps
 * working in dev / preview where the DB might not be wired up.
 */

import { createPool, type VercelPool } from "@vercel/postgres";

export interface Customer {
  appleSub: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  firstSeenAt: string;
  lastSignedInAt: string;
  signInCount: number;
}

let _pool: VercelPool | null = null;
function getPool(): VercelPool | null {
  if (_pool) return _pool;
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) return null;
  _pool = createPool({ connectionString });
  return _pool;
}

let _schemaReady = false;
async function ensureSchema(pool: VercelPool): Promise<void> {
  if (_schemaReady) return;
  await pool.sql`
    CREATE TABLE IF NOT EXISTS customers (
      apple_sub        TEXT PRIMARY KEY,
      email            TEXT,
      display_name     TEXT,
      email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
      first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_signed_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sign_in_count    INTEGER NOT NULL DEFAULT 1
    )
  `;
  await pool.sql`CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email)`;
  _schemaReady = true;
}

interface UpsertInput {
  appleSub: string;
  email?: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
}

/**
 * Insert-or-update a customer at sign-in time. Returns the row.
 *
 * Apple only sends email + displayName on the FIRST sign-in for a given
 * Apple account, so we COALESCE on update to preserve what we previously
 * captured rather than overwriting with NULLs on returning sign-ins.
 *
 * Returns null if Postgres isn't configured — caller should fall back to
 * a synthetic record so sign-in continues to work.
 */
export async function upsertCustomerOnSignIn(
  input: UpsertInput
): Promise<Customer | null> {
  const pool = getPool();
  if (!pool) return null;

  try {
    await ensureSchema(pool);
    const result = await pool.sql`
      INSERT INTO customers (apple_sub, email, display_name, email_verified)
      VALUES (
        ${input.appleSub},
        ${input.email ?? null},
        ${input.displayName ?? null},
        ${input.emailVerified ?? false}
      )
      ON CONFLICT (apple_sub) DO UPDATE SET
        email             = COALESCE(EXCLUDED.email, customers.email),
        display_name      = COALESCE(EXCLUDED.display_name, customers.display_name),
        email_verified    = customers.email_verified OR EXCLUDED.email_verified,
        last_signed_in_at = NOW(),
        sign_in_count     = customers.sign_in_count + 1
      RETURNING
        apple_sub,
        email,
        display_name,
        email_verified,
        first_seen_at,
        last_signed_in_at,
        sign_in_count
    `;
    const row = result.rows[0] as
      | {
          apple_sub: string;
          email: string | null;
          display_name: string | null;
          email_verified: boolean;
          first_seen_at: string | Date;
          last_signed_in_at: string | Date;
          sign_in_count: number;
        }
      | undefined;
    if (!row) return null;
    return {
      appleSub: row.apple_sub,
      email: row.email,
      displayName: row.display_name,
      emailVerified: row.email_verified,
      firstSeenAt:
        typeof row.first_seen_at === "string"
          ? row.first_seen_at
          : row.first_seen_at.toISOString(),
      lastSignedInAt:
        typeof row.last_signed_in_at === "string"
          ? row.last_signed_in_at
          : row.last_signed_in_at.toISOString(),
      signInCount: row.sign_in_count,
    };
  } catch (err) {
    // Best effort — sign-in should not fail because of a DB hiccup.
    // Log loudly so we notice, then let the caller use a synthetic record.
    console.error("[customers-store] upsert failed:", err);
    return null;
  }
}

export async function getCustomerBySub(appleSub: string): Promise<Customer | null> {
  const pool = getPool();
  if (!pool) return null;
  try {
    await ensureSchema(pool);
    const result = await pool.sql`
      SELECT apple_sub, email, display_name, email_verified,
             first_seen_at, last_signed_in_at, sign_in_count
      FROM customers
      WHERE apple_sub = ${appleSub}
    `;
    const row = result.rows[0] as
      | {
          apple_sub: string;
          email: string | null;
          display_name: string | null;
          email_verified: boolean;
          first_seen_at: string | Date;
          last_signed_in_at: string | Date;
          sign_in_count: number;
        }
      | undefined;
    if (!row) return null;
    return {
      appleSub: row.apple_sub,
      email: row.email,
      displayName: row.display_name,
      emailVerified: row.email_verified,
      firstSeenAt:
        typeof row.first_seen_at === "string"
          ? row.first_seen_at
          : row.first_seen_at.toISOString(),
      lastSignedInAt:
        typeof row.last_signed_in_at === "string"
          ? row.last_signed_in_at
          : row.last_signed_in_at.toISOString(),
      signInCount: row.sign_in_count,
    };
  } catch (err) {
    console.error("[customers-store] getCustomerBySub failed:", err);
    return null;
  }
}
