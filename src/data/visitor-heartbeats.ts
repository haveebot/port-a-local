/**
 * Live visitor tracking — minimal heartbeat-based active-session counter.
 *
 * Architecture:
 *   1. Client component (VisitorHeartbeat) generates a session ID on
 *      first render, stores in sessionStorage, POSTs every 30s while
 *      the tab is visible.
 *   2. /api/track-visitor records the heartbeat in this table
 *      (upsert on session_id — only last_seen_at moves).
 *   3. Wheelhouse displays count of distinct sessions seen in last
 *      3 minutes.
 *
 * Privacy: session IDs are client-generated random tokens, stored
 * only in sessionStorage (cleared on tab close). No PII.
 *
 * Cleanup: stale rows pruned by /api/cron/visitor-prune. Without
 * cleanup the table grows linearly (one row per unique session ever);
 * with hourly prune it stays at ~hundreds of rows.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_heartbeats (
      session_id TEXT PRIMARY KEY,
      path TEXT,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS visitor_heartbeats_last_seen_idx ON visitor_heartbeats(last_seen_at DESC)`;
  _schemaReady = true;
}

export async function recordHeartbeat(
  sessionId: string,
  path: string,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO visitor_heartbeats (session_id, path, last_seen_at)
    VALUES (${sessionId}, ${path}, ${now})
    ON CONFLICT (session_id) DO UPDATE
    SET path = EXCLUDED.path,
        last_seen_at = EXCLUDED.last_seen_at
  `;
}

export interface ActiveVisitorInfo {
  count: number;
  paths: Array<{ path: string; n: number }>;
}

/**
 * Active = heartbeat seen in the last `windowSeconds` seconds.
 * Default 180s (3 min) — covers ~6 missed heartbeat intervals at
 * 30s cadence. Catches network blips without including ghost sessions.
 */
export async function getActiveVisitors(
  windowSeconds = 180,
): Promise<ActiveVisitorInfo> {
  try {
    await ensureSchema();
    const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString();
    const { rows: countRows } = await sql`
      SELECT COUNT(*)::int AS n FROM visitor_heartbeats
      WHERE last_seen_at >= ${cutoff}
    `;
    const { rows: pathRows } = await sql`
      SELECT path, COUNT(*)::int AS n
      FROM visitor_heartbeats
      WHERE last_seen_at >= ${cutoff}
      GROUP BY path
      ORDER BY n DESC
      LIMIT 10
    `;
    return {
      count: Number(countRows[0]?.n ?? 0),
      paths: pathRows.map((r) => ({
        path: (r.path as string) ?? "(unknown)",
        n: Number(r.n),
      })),
    };
  } catch {
    return { count: 0, paths: [] };
  }
}

/**
 * Prune heartbeats older than `keepHours`. Keeps the table small.
 * Run via /api/cron/visitor-prune hourly.
 */
export async function pruneOldHeartbeats(keepHours = 6): Promise<number> {
  try {
    await ensureSchema();
    const cutoff = new Date(Date.now() - keepHours * 60 * 60 * 1000).toISOString();
    const { rowCount } = await sql`
      DELETE FROM visitor_heartbeats WHERE last_seen_at < ${cutoff}
    `;
    return rowCount ?? 0;
  } catch {
    return 0;
  }
}
