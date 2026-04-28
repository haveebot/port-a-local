/**
 * PAL emergency-alert store.
 *
 * Site-wide banner for hurricanes, evacuations, road closures, and
 * any other event where PAL needs to be the FIRST place visitors
 * see authoritative info. Backed by a tiny pal_alerts Postgres table
 * keyed on `active` + `expires_at` for fast lookup.
 *
 * Architecture (Phase 1, this file): single active alert at a time;
 * admin creates via /wheelhouse/alerts; banner reads via
 * getActiveAlert() called by EmergencyBanner.tsx in the root layout.
 *
 * Phase 2 (later): each major event also gets a dedicated
 * /emergency/[slug] page with consolidated updates; alert.linkUrl
 * points there. The schema already has linkUrl + linkLabel for that.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS pal_alerts (
      id TEXT PRIMARY KEY,
      severity TEXT NOT NULL DEFAULT 'warning',
      message TEXT NOT NULL,
      link_url TEXT,
      link_label TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      created_by TEXT NOT NULL,
      dismissed_at TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pal_alerts_active_idx ON pal_alerts(active, expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS pal_alerts_created_at_idx ON pal_alerts(created_at DESC)`;
  _schemaReady = true;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface PALAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  linkUrl: string | null;
  linkLabel: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  createdBy: string;
  dismissedAt: string | null;
}

function rowToAlert(row: Record<string, unknown>): PALAlert {
  return {
    id: row.id as string,
    severity: ((row.severity as string) ?? "warning") as AlertSeverity,
    message: row.message as string,
    linkUrl: (row.link_url as string) ?? null,
    linkLabel: (row.link_label as string) ?? null,
    active: row.active === true,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    expiresAt: row.expires_at
      ? new Date(row.expires_at as string).toISOString()
      : null,
    createdBy: row.created_by as string,
    dismissedAt: row.dismissed_at
      ? new Date(row.dismissed_at as string).toISOString()
      : null,
  };
}

function newAlertId(): string {
  return `alert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateAlertInput {
  severity: AlertSeverity;
  message: string;
  linkUrl?: string;
  linkLabel?: string;
  expiresAt?: string;
  createdBy: string;
}

/**
 * Create a new alert AND deactivate any other active alerts. Single-
 * active-alert invariant — keeps the banner UX simple in Phase 1.
 */
export async function createAlert(input: CreateAlertInput): Promise<PALAlert> {
  await ensureSchema();
  // Dismiss any existing active alerts first — single-active invariant
  const now = new Date().toISOString();
  await sql`
    UPDATE pal_alerts
    SET active = FALSE,
        dismissed_at = ${now},
        updated_at = ${now}
    WHERE active = TRUE
  `;
  const id = newAlertId();
  await sql`
    INSERT INTO pal_alerts (
      id, severity, message, link_url, link_label,
      active, expires_at, created_by
    ) VALUES (
      ${id},
      ${input.severity},
      ${input.message},
      ${input.linkUrl ?? null},
      ${input.linkLabel ?? null},
      TRUE,
      ${input.expiresAt ?? null},
      ${input.createdBy}
    )
  `;
  const created = await getAlertById(id);
  if (!created) throw new Error("Alert vanished after insert");
  return created;
}

export async function getAlertById(id: string): Promise<PALAlert | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM pal_alerts WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToAlert(rows[0]) : null;
}

/**
 * The hot path — called by EmergencyBanner.tsx on every server render
 * (including the root layout, which means it runs on every page).
 * Returns the most recent active alert that hasn't expired, or null.
 * Indexed on (active, expires_at) so this is essentially free even
 * with no active alert (empty index scan).
 *
 * Defensive: any DB error (build-time prerender, network glitch,
 * missing schema, missing env vars) returns null — the banner simply
 * doesn't render. We fail closed; never blow up the page render.
 */
export async function getActiveAlert(): Promise<PALAlert | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM pal_alerts
      WHERE active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return rows[0] ? rowToAlert(rows[0]) : null;
  } catch (err) {
    // Build-time prerender (no DB), network failure, or missing schema
    // — degrade gracefully to "no active alert."
    if (process.env.NODE_ENV !== "production") {
      console.warn("[alerts] getActiveAlert failed, returning null:", err);
    }
    return null;
  }
}

/**
 * Auto-deactivate any active alerts whose expires_at has passed.
 * Cheap idempotent housekeeping; cron-friendly. Returns the count
 * deactivated.
 */
export async function expireStaleAlerts(): Promise<number> {
  await ensureSchema();
  const now = new Date().toISOString();
  const { rowCount } = await sql`
    UPDATE pal_alerts
    SET active = FALSE,
        dismissed_at = ${now},
        updated_at = ${now}
    WHERE active = TRUE
      AND expires_at IS NOT NULL
      AND expires_at <= NOW()
  `;
  return rowCount ?? 0;
}

export async function dismissAlert(
  id: string,
  dismissedBy: string,
): Promise<PALAlert | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    UPDATE pal_alerts
    SET active = FALSE,
        dismissed_at = ${now},
        updated_at = ${now}
    WHERE id = ${id}
  `;
  // Note dismissedBy is captured in updated_at + the wheelhouse audit
  // log mirror (future); v1 just records the time.
  void dismissedBy;
  return getAlertById(id);
}

export async function getAlertHistory(limit: number = 20): Promise<PALAlert[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM pal_alerts
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToAlert);
}
