/**
 * PAL Council Watch — store for scraped City of Port Aransas council /
 * P&Z / commission meetings, and the editorial digests we write off them.
 *
 * Data flow:
 *   1. Vercel cron hits /api/cron/council-scrape weekly (Mon 8am CT)
 *   2. Scraper pulls CivicWeb's Portal/MeetingSchedule.aspx + recent
 *      MeetingTypeList views, extracts meeting rows, dedups by
 *      civicweb_id, inserts new rows with status='discovered'
 *   3. Editor writes a digest at /wheelhouse/council-watch/[id]
 *      (TBD admin UI), sets digest_markdown + youtube_url, flips
 *      status='published'
 *   4. /council-watch index renders published digests; detail page
 *      at /council-watch/[slug] embeds the YouTube recording + the
 *      digest markdown + links to the source PDF agendas/minutes
 *
 * The piece-of-piece note: each digest is short (200-400 words), in
 * PAL editorial voice, anchored on what got DECIDED — not who said
 * what at the dais.
 */

import { sql } from "@vercel/postgres";

let _schemaReady = false;

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS council_meetings (
      id TEXT PRIMARY KEY,
      civicweb_id TEXT UNIQUE,
      meeting_type TEXT NOT NULL,
      meeting_date TIMESTAMPTZ NOT NULL,
      title TEXT,
      agenda_url TEXT,
      minutes_url TEXT,
      civicweb_url TEXT,
      youtube_url TEXT,
      digest_markdown TEXT,
      digest_slug TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'discovered',
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ,
      authored_by TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS council_meetings_date_idx ON council_meetings(meeting_date DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS council_meetings_status_idx ON council_meetings(status)`;
  _schemaReady = true;
}

export type MeetingStatus = "discovered" | "drafted" | "published";

export interface CouncilMeeting {
  id: string;
  civicwebId: string | null;
  meetingType: string;
  meetingDate: string;
  title: string | null;
  agendaUrl: string | null;
  minutesUrl: string | null;
  civicwebUrl: string | null;
  youtubeUrl: string | null;
  digestMarkdown: string | null;
  digestSlug: string | null;
  status: MeetingStatus;
  firstSeenAt: string;
  publishedAt: string | null;
  authoredBy: string | null;
}

function rowToMeeting(row: Record<string, unknown>): CouncilMeeting {
  return {
    id: row.id as string,
    civicwebId: (row.civicweb_id as string) ?? null,
    meetingType: row.meeting_type as string,
    meetingDate: new Date(row.meeting_date as string).toISOString(),
    title: (row.title as string) ?? null,
    agendaUrl: (row.agenda_url as string) ?? null,
    minutesUrl: (row.minutes_url as string) ?? null,
    civicwebUrl: (row.civicweb_url as string) ?? null,
    youtubeUrl: (row.youtube_url as string) ?? null,
    digestMarkdown: (row.digest_markdown as string) ?? null,
    digestSlug: (row.digest_slug as string) ?? null,
    status: (row.status as MeetingStatus) ?? "discovered",
    firstSeenAt: new Date(row.first_seen_at as string).toISOString(),
    publishedAt: row.published_at
      ? new Date(row.published_at as string).toISOString()
      : null,
    authoredBy: (row.authored_by as string) ?? null,
  };
}

function newMeetingId(): string {
  return `cm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UpsertMeetingInput {
  civicwebId: string;
  meetingType: string;
  meetingDate: string;
  title?: string;
  agendaUrl?: string;
  minutesUrl?: string;
  civicwebUrl?: string;
}

/**
 * Insert a newly-discovered meeting from the scraper. Returns the row
 * (creating if new, ignoring if civicweb_id already known). Idempotent
 * by civicweb_id so the cron can re-run safely.
 */
export async function upsertDiscoveredMeeting(
  input: UpsertMeetingInput,
): Promise<{ meeting: CouncilMeeting; created: boolean }> {
  await ensureSchema();
  const existing = await getMeetingByCivicwebId(input.civicwebId);
  if (existing) {
    // Patch any newly-discovered fields (agenda/minutes/title may have
    // arrived since first scrape) without disturbing editorial state.
    if (
      (input.agendaUrl && !existing.agendaUrl) ||
      (input.minutesUrl && !existing.minutesUrl) ||
      (input.title && !existing.title)
    ) {
      await sql`
        UPDATE council_meetings
        SET title = COALESCE(${input.title ?? existing.title}, title),
            agenda_url = COALESCE(${input.agendaUrl ?? existing.agendaUrl}, agenda_url),
            minutes_url = COALESCE(${input.minutesUrl ?? existing.minutesUrl}, minutes_url),
            civicweb_url = COALESCE(${input.civicwebUrl ?? existing.civicwebUrl}, civicweb_url)
        WHERE id = ${existing.id}
      `;
      const refreshed = await getMeetingByCivicwebId(input.civicwebId);
      return { meeting: refreshed ?? existing, created: false };
    }
    return { meeting: existing, created: false };
  }
  const id = newMeetingId();
  await sql`
    INSERT INTO council_meetings (
      id, civicweb_id, meeting_type, meeting_date,
      title, agenda_url, minutes_url, civicweb_url, status
    ) VALUES (
      ${id},
      ${input.civicwebId},
      ${input.meetingType},
      ${input.meetingDate},
      ${input.title ?? null},
      ${input.agendaUrl ?? null},
      ${input.minutesUrl ?? null},
      ${input.civicwebUrl ?? null},
      'discovered'
    )
  `;
  const created = await getMeetingByCivicwebId(input.civicwebId);
  if (!created) throw new Error("Meeting vanished after insert");
  return { meeting: created, created: true };
}

export async function getMeetingByCivicwebId(
  civicwebId: string,
): Promise<CouncilMeeting | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM council_meetings WHERE civicweb_id = ${civicwebId} LIMIT 1
  `;
  return rows[0] ? rowToMeeting(rows[0]) : null;
}

export async function getMeetingById(
  id: string,
): Promise<CouncilMeeting | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM council_meetings WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? rowToMeeting(rows[0]) : null;
}

export async function getMeetingBySlug(
  slug: string,
): Promise<CouncilMeeting | null> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM council_meetings WHERE digest_slug = ${slug} LIMIT 1
  `;
  return rows[0] ? rowToMeeting(rows[0]) : null;
}

/**
 * Public-facing list — only published digests, most-recent first.
 * Used by /council-watch index.
 */
export async function getPublishedDigests(
  limit: number = 50,
): Promise<CouncilMeeting[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT * FROM council_meetings
      WHERE status = 'published'
      ORDER BY meeting_date DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToMeeting);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[council] getPublishedDigests failed:", err);
    }
    return [];
  }
}

/**
 * Admin list — every meeting (discovered + drafted + published).
 * Used by /wheelhouse/council-watch admin (Phase 2 if Winston wants).
 */
export async function getAllMeetings(
  limit: number = 100,
): Promise<CouncilMeeting[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT * FROM council_meetings
    ORDER BY meeting_date DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToMeeting);
}

export interface UpdateDigestInput {
  digestMarkdown?: string;
  digestSlug?: string;
  youtubeUrl?: string;
  authoredBy?: string;
  status?: MeetingStatus;
}

export async function updateDigest(
  id: string,
  input: UpdateDigestInput,
): Promise<CouncilMeeting | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? now : null;
  await sql`
    UPDATE council_meetings
    SET digest_markdown = COALESCE(${input.digestMarkdown ?? null}, digest_markdown),
        digest_slug = COALESCE(${input.digestSlug ?? null}, digest_slug),
        youtube_url = COALESCE(${input.youtubeUrl ?? null}, youtube_url),
        authored_by = COALESCE(${input.authoredBy ?? null}, authored_by),
        status = COALESCE(${input.status ?? null}, status),
        published_at = COALESCE(${publishedAt}, published_at)
    WHERE id = ${id}
  `;
  return getMeetingById(id);
}

/** Generate a slug from meeting type + date — predictable + stable. */
export function buildDigestSlug(
  meetingType: string,
  meetingDate: string,
): string {
  const dateStr = new Date(meetingDate).toISOString().slice(0, 10);
  const typeSlug = meetingType
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${typeSlug}-${dateStr}`;
}
