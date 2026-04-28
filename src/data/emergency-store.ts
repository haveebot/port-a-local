/**
 * PAL Emergency Events — multi-day situation pages.
 *
 * Sibling of pal_alerts (the site-wide top-of-page banner). Each
 * emergency_event is a long-lived record for an ongoing situation
 * (hurricane, evacuation window, road closure, water-system advisory)
 * that warrants a dedicated `/emergency/[slug]` page with a running
 * timeline of updates.
 *
 * Architecture:
 *   pal_alerts         → the banner state (single-active invariant,
 *                         disappears when dismissed)
 *   emergency_events   → the page-level record (persists forever as
 *                         post-event archive; resolved_at marks the
 *                         end of active state)
 *   emergency_updates  → timeline entries on an event (FYI, conditions,
 *                         decisions, all-clear)
 *
 * Phase 1 (already shipped): banner via pal_alerts, manual trigger.
 * Phase 2 Stage A (this file): dedicated event pages + running updates.
 * Phase 2 Stage B (later): NWS / CivicPlus / TxDOT auto-feeds; SMS /
 *                          email / push subscriber delivery.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS emergency_events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'warning',
      kind TEXT NOT NULL DEFAULT 'general',
      status TEXT NOT NULL DEFAULT 'active',
      started_at TIMESTAMPTZ,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by TEXT NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS emergency_events_status_idx ON emergency_events(status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS emergency_events_started_idx ON emergency_events(started_at DESC NULLS LAST)`;

  await sql`
    CREATE TABLE IF NOT EXISTS emergency_updates (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES emergency_events(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'info',
      title TEXT,
      body TEXT NOT NULL,
      source_url TEXT,
      source_label TEXT,
      author_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS emergency_updates_event_idx ON emergency_updates(event_id, created_at DESC)`;
  _schemaReady = true;
}

export type EventSeverity = "info" | "warning" | "critical";
export type EventStatus = "active" | "watching" | "resolved";
export type EventKind =
  | "weather"
  | "evacuation"
  | "road-closure"
  | "water-advisory"
  | "fire"
  | "general";
export type UpdateKind =
  | "info"
  | "conditions"
  | "decision"
  | "warning"
  | "all-clear";

export interface EmergencyEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  severity: EventSeverity;
  kind: EventKind;
  status: EventStatus;
  startedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  createdBy: string;
}

export interface EmergencyUpdate {
  id: string;
  eventId: string;
  kind: UpdateKind;
  title: string | null;
  body: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  authorId: string;
  createdAt: string;
}

function rowToEvent(row: Record<string, unknown>): EmergencyEvent {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    severity: ((row.severity as string) ?? "warning") as EventSeverity,
    kind: ((row.kind as string) ?? "general") as EventKind,
    status: ((row.status as string) ?? "active") as EventStatus,
    startedAt: row.started_at
      ? new Date(row.started_at as string).toISOString()
      : null,
    resolvedAt: row.resolved_at
      ? new Date(row.resolved_at as string).toISOString()
      : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    createdBy: row.created_by as string,
  };
}

function rowToUpdate(row: Record<string, unknown>): EmergencyUpdate {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    kind: ((row.kind as string) ?? "info") as UpdateKind,
    title: (row.title as string) ?? null,
    body: row.body as string,
    sourceUrl: (row.source_url as string) ?? null,
    sourceLabel: (row.source_label as string) ?? null,
    authorId: row.author_id as string,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function newEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function newUpdateId(): string {
  return `upd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateEventInput {
  slug: string;
  title: string;
  summary: string;
  severity?: EventSeverity;
  kind?: EventKind;
  startedAt?: string;
  createdBy: string;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EmergencyEvent> {
  await ensureSchema();
  const id = newEventId();
  await sql`
    INSERT INTO emergency_events (
      id, slug, title, summary, severity, kind, status, started_at, created_by
    ) VALUES (
      ${id},
      ${input.slug},
      ${input.title},
      ${input.summary},
      ${input.severity ?? "warning"},
      ${input.kind ?? "general"},
      'active',
      ${input.startedAt ?? null},
      ${input.createdBy}
    )
  `;
  const created = await getEventBySlug(input.slug);
  if (!created) throw new Error("Event vanished after insert");
  return created;
}

export async function getEventBySlug(
  slug: string,
): Promise<EmergencyEvent | null> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM emergency_events WHERE slug = ${slug} LIMIT 1
    `;
    return rows[0] ? rowToEvent(rows[0]) : null;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[emergency] getEventBySlug failed:", err);
    }
    return null;
  }
}

export async function getEventById(
  id: string,
): Promise<EmergencyEvent | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM emergency_events WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToEvent(rows[0]) : null;
}

/**
 * Public-facing list — active + watching first, resolved sorted by
 * created_at DESC (most recent post-event records first).
 */
export async function getEventList(
  limit: number = 30,
): Promise<EmergencyEvent[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM emergency_events
      ORDER BY
        CASE status
          WHEN 'active' THEN 0
          WHEN 'watching' THEN 1
          ELSE 2
        END ASC,
        created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToEvent);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[emergency] getEventList failed:", err);
    }
    return [];
  }
}

export interface UpdateEventInput {
  status?: EventStatus;
  severity?: EventSeverity;
  summary?: string;
  resolvedAt?: string;
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<EmergencyEvent | null> {
  await ensureSchema();
  await sql`
    UPDATE emergency_events
    SET status = COALESCE(${input.status ?? null}, status),
        severity = COALESCE(${input.severity ?? null}, severity),
        summary = COALESCE(${input.summary ?? null}, summary),
        resolved_at = COALESCE(${input.resolvedAt ?? null}, resolved_at)
    WHERE id = ${id}
  `;
  return getEventById(id);
}

export interface CreateUpdateInput {
  eventId: string;
  kind?: UpdateKind;
  title?: string;
  body: string;
  sourceUrl?: string;
  sourceLabel?: string;
  authorId: string;
}

export async function createUpdate(
  input: CreateUpdateInput,
): Promise<EmergencyUpdate> {
  await ensureSchema();
  const id = newUpdateId();
  await sql`
    INSERT INTO emergency_updates (
      id, event_id, kind, title, body, source_url, source_label, author_id
    ) VALUES (
      ${id},
      ${input.eventId},
      ${input.kind ?? "info"},
      ${input.title ?? null},
      ${input.body},
      ${input.sourceUrl ?? null},
      ${input.sourceLabel ?? null},
      ${input.authorId}
    )
  `;
  const { rows } = await sql`
    SELECT * FROM emergency_updates WHERE id = ${id} LIMIT 1
  `;
  if (!rows[0]) throw new Error("Update vanished after insert");
  return rowToUpdate(rows[0]);
}

export async function getUpdatesForEvent(
  eventId: string,
): Promise<EmergencyUpdate[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM emergency_updates
      WHERE event_id = ${eventId}
      ORDER BY created_at DESC
    `;
    return rows.map(rowToUpdate);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[emergency] getUpdatesForEvent failed:", err);
    }
    return [];
  }
}
