/**
 * Wheelhouse storage layer — Vercel Postgres implementation.
 *
 * Activated automatically when POSTGRES_URL env var is set (which Vercel
 * sets for you when you provision a Postgres database from the dashboard).
 * Schema lives in `db/wheelhouse-schema.sql`; bootstrapped via the
 * /api/wheelhouse/init endpoint (one-time).
 *
 * Same interface as wheelhouse-store-mock — both implementations are
 * interchangeable behind wheelhouse-store.ts.
 */

import { createPool, type VercelPool } from "@vercel/postgres";
import { SEED_THREADS, SEED_MESSAGES } from "./wheelhouse-seed";

/**
 * Pool factory that handles both Vercel's older POSTGRES_URL convention
 * AND Neon's modern DATABASE_URL convention. The default `sql` export from
 * @vercel/postgres reads POSTGRES_URL only; createPool() lets us explicitly
 * pass either.
 */
let _pool: VercelPool | null = null;
function getPool(): VercelPool {
  if (!_pool) {
    const connectionString =
      process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Neither POSTGRES_URL nor DATABASE_URL env vars are set. " +
          "Provision a Vercel Postgres / Neon database and connect it to this project.",
      );
    }
    _pool = createPool({ connectionString });
  }
  return _pool;
}

/**
 * SQL template tag bound to our pool. Use exactly like the default
 * `import { sql } from '@vercel/postgres'` — same tagged-template API.
 */
const sql: VercelPool["sql"] = ((...args: Parameters<VercelPool["sql"]>) => {
  return getPool().sql(...args);
}) as VercelPool["sql"];
import type {
  Thread,
  ThreadWithMessages,
  Message,
  ThreadState,
  ParticipantId,
  MessageType,
} from "./wheelhouse-types";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** Map a Postgres row → typed Thread */
function rowToThread(row: Record<string, unknown>): Thread {
  return {
    id: row.id as string,
    title: row.title as string,
    tags: (row.tags as string[]) ?? [],
    state: row.state as ThreadState,
    participants: (row.participants as ParticipantId[]) ?? [],
    authorId: row.author_id as ParticipantId,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    context: row.context as Thread["context"] | undefined,
    pinned: row.pinned as boolean,
  };
}

function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    threadId: row.thread_id as string,
    authorId: row.author_id as ParticipantId,
    type: row.type as MessageType,
    body: row.body as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    payload: row.payload as Message["payload"] | undefined,
    readBy: row.read_by as ParticipantId[] | undefined,
  };
}

/* -------------------- Reads -------------------- */

export async function getThreads(): Promise<Thread[]> {
  const { rows } = await sql`
    SELECT id, title, tags, state, participants, author_id, created_at,
           updated_at, context, pinned
    FROM wheelhouse_threads
    ORDER BY pinned DESC, updated_at DESC
  `;
  return rows.map(rowToThread);
}

export async function getThread(id: string): Promise<Thread | null> {
  const { rows } = await sql`
    SELECT id, title, tags, state, participants, author_id, created_at,
           updated_at, context, pinned
    FROM wheelhouse_threads
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ? rowToThread(rows[0]) : null;
}

export async function getMessagesForThread(
  threadId: string,
): Promise<Message[]> {
  const { rows } = await sql`
    SELECT id, thread_id, author_id, type, body, created_at, payload, read_by
    FROM wheelhouse_messages
    WHERE thread_id = ${threadId}
    ORDER BY created_at ASC
  `;
  return rows.map(rowToMessage);
}

export async function getThreadWithMessages(
  id: string,
): Promise<ThreadWithMessages | null> {
  const thread = await getThread(id);
  if (!thread) return null;
  const messages = await getMessagesForThread(id);
  return { ...thread, messages };
}

export async function getThreadsAwaiting(
  participantId: ParticipantId,
): Promise<Thread[]> {
  const state: ThreadState = `awaiting:${participantId}` as ThreadState;
  const { rows } = await sql`
    SELECT id, title, tags, state, participants, author_id, created_at,
           updated_at, context, pinned
    FROM wheelhouse_threads
    WHERE state = ${state}
    ORDER BY pinned DESC, updated_at DESC
  `;
  return rows.map(rowToThread);
}

export async function getThreadsForParticipant(
  participantId: ParticipantId,
): Promise<Thread[]> {
  // jsonb @> '<participantId>' would need string-encoded array; use ? operator
  const { rows } = await sql`
    SELECT id, title, tags, state, participants, author_id, created_at,
           updated_at, context, pinned
    FROM wheelhouse_threads
    WHERE participants ? ${participantId}
    ORDER BY pinned DESC, updated_at DESC
  `;
  return rows.map(rowToThread);
}

/* -------------------- Mutations -------------------- */

export interface CreateThreadInput {
  title: string;
  tags: string[];
  participants: ParticipantId[];
  authorId: ParticipantId;
  initialMessage?: { type: MessageType; body: string };
  state?: ThreadState;
  context?: { label: string; url: string }[];
}

export async function createThread(
  input: CreateThreadInput,
): Promise<ThreadWithMessages> {
  const id = newId("thread");
  const now = new Date().toISOString();
  const state = input.state ?? "open";
  await sql`
    INSERT INTO wheelhouse_threads (
      id, title, tags, state, participants, author_id,
      created_at, updated_at, context, pinned
    ) VALUES (
      ${id},
      ${input.title.trim()},
      ${JSON.stringify(input.tags)}::jsonb,
      ${state},
      ${JSON.stringify(input.participants)}::jsonb,
      ${input.authorId},
      ${now},
      ${now},
      ${input.context ? JSON.stringify(input.context) : null}::jsonb,
      false
    )
  `;
  const messages: Message[] = [];
  if (input.initialMessage) {
    const msg = await createMessage({
      threadId: id,
      authorId: input.authorId,
      type: input.initialMessage.type,
      body: input.initialMessage.body,
    });
    if (msg) messages.push(msg);
  }
  const thread = await getThread(id);
  if (!thread) throw new Error("Thread vanished after insert");
  return { ...thread, messages };
}

export interface CreateMessageInput {
  threadId: string;
  authorId: ParticipantId;
  type: MessageType;
  body: string;
  payload?: Message["payload"];
}

export async function createMessage(
  input: CreateMessageInput,
): Promise<Message | null> {
  const thread = await getThread(input.threadId);
  if (!thread) return null;
  const id = newId("msg");
  const now = new Date().toISOString();
  await sql`
    INSERT INTO wheelhouse_messages (
      id, thread_id, author_id, type, body, created_at, payload
    ) VALUES (
      ${id},
      ${input.threadId},
      ${input.authorId},
      ${input.type},
      ${input.body.trim()},
      ${now},
      ${input.payload ? JSON.stringify(input.payload) : null}::jsonb
    )
  `;
  await sql`
    UPDATE wheelhouse_threads SET updated_at = ${now} WHERE id = ${input.threadId}
  `;
  const { rows } = await sql`
    SELECT id, thread_id, author_id, type, body, created_at, payload, read_by
    FROM wheelhouse_messages
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ? rowToMessage(rows[0]) : null;
}

export async function transitionThread(
  id: string,
  newState: ThreadState,
): Promise<Thread | null> {
  const now = new Date().toISOString();
  await sql`
    UPDATE wheelhouse_threads
    SET state = ${newState}, updated_at = ${now}
    WHERE id = ${id}
  `;
  return getThread(id);
}

/* -------------------- Activity -------------------- */

export interface ActivityEvent {
  messageId: string;
  threadId: string;
  threadTitle: string;
  threadIsNew: boolean;
  authorId: ParticipantId;
  type: MessageType;
  bodyPreview: string;
  createdAt: string;
}

export interface ActivitySummary {
  windowHours: number;
  windowStart: string;
  newMessages: number;
  newThreads: number;
  activeThreads: number;
  events: ActivityEvent[];
}

const PREVIEW_LEN = 140;
const MAX_EVENTS = 10;

export async function getRecentActivity(
  windowHours = 24,
): Promise<ActivitySummary> {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();

  const { rows: msgRows } = await sql`
    SELECT m.id, m.thread_id, m.author_id, m.type, m.body, m.created_at,
           t.title AS thread_title, t.created_at AS thread_created_at
    FROM wheelhouse_messages m
    JOIN wheelhouse_threads t ON t.id = m.thread_id
    WHERE m.created_at > ${cutoffIso}
    ORDER BY m.created_at DESC
  `;

  const { rows: newThreadRows } = await sql`
    SELECT id FROM wheelhouse_threads
    WHERE created_at > ${cutoffIso}
  `;

  const newThreadIds = new Set(newThreadRows.map((r) => r.id as string));
  const activeThreadIds = new Set<string>(newThreadIds);
  msgRows.forEach((r) => activeThreadIds.add(r.thread_id as string));

  const events: ActivityEvent[] = msgRows.slice(0, MAX_EVENTS).map((r) => {
    const body = (r.body as string).length > PREVIEW_LEN
      ? (r.body as string).slice(0, PREVIEW_LEN).trim() + "…"
      : (r.body as string);
    return {
      messageId: r.id as string,
      threadId: r.thread_id as string,
      threadTitle: r.thread_title as string,
      threadIsNew: newThreadIds.has(r.thread_id as string),
      authorId: r.author_id as ParticipantId,
      type: r.type as MessageType,
      bodyPreview: body,
      createdAt: new Date(r.created_at as string).toISOString(),
    };
  });

  return {
    windowHours,
    windowStart: cutoffIso,
    newMessages: msgRows.length,
    newThreads: newThreadRows.length,
    activeThreads: activeThreadIds.size,
    events,
  };
}

/* -------------------- Schema + seed bootstrap -------------------- */

/** Run once after Postgres is provisioned. Idempotent — safe to re-run. */
export async function initSchemaAndSeed(): Promise<{
  schemaCreated: boolean;
  seeded: boolean;
  threadCount: number;
  messageCount: number;
}> {
  // Create tables if they don't exist
  await sql`
    CREATE TABLE IF NOT EXISTS wheelhouse_threads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      state TEXT NOT NULL,
      participants JSONB NOT NULL,
      author_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      context JSONB,
      pinned BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS wheelhouse_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES wheelhouse_threads(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL,
      type TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB,
      read_by JSONB
    )
  `;
  // Tracks "when did each user last check the inbox / each thread"
  // Scope = "inbox" for the index page; otherwise the thread id
  await sql`
    CREATE TABLE IF NOT EXISTS wheelhouse_user_seen (
      participant_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (participant_id, scope)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_messages_thread_id_idx ON wheelhouse_messages(thread_id)`;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_threads_updated_at_idx ON wheelhouse_threads(updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_threads_state_idx ON wheelhouse_threads(state)`;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_messages_created_at_idx ON wheelhouse_messages(created_at DESC)`;

  // Check if seed already ran
  const { rows: count } = await sql`SELECT COUNT(*)::int AS n FROM wheelhouse_threads`;
  const existing = (count[0]?.n as number) ?? 0;
  if (existing > 0) {
    const { rows: msgCount } =
      await sql`SELECT COUNT(*)::int AS n FROM wheelhouse_messages`;
    return {
      schemaCreated: true,
      seeded: false,
      threadCount: existing,
      messageCount: (msgCount[0]?.n as number) ?? 0,
    };
  }

  // Seed
  for (const t of SEED_THREADS) {
    await sql`
      INSERT INTO wheelhouse_threads (
        id, title, tags, state, participants, author_id,
        created_at, updated_at, context, pinned
      ) VALUES (
        ${t.id},
        ${t.title},
        ${JSON.stringify(t.tags)}::jsonb,
        ${t.state},
        ${JSON.stringify(t.participants)}::jsonb,
        ${t.authorId},
        ${t.createdAt},
        ${t.updatedAt},
        ${t.context ? JSON.stringify(t.context) : null}::jsonb,
        ${t.pinned ?? false}
      )
    `;
  }
  for (const m of SEED_MESSAGES) {
    await sql`
      INSERT INTO wheelhouse_messages (
        id, thread_id, author_id, type, body, created_at, payload
      ) VALUES (
        ${m.id},
        ${m.threadId},
        ${m.authorId},
        ${m.type},
        ${m.body},
        ${m.createdAt},
        ${m.payload ? JSON.stringify(m.payload) : null}::jsonb
      )
    `;
  }

  return {
    schemaCreated: true,
    seeded: true,
    threadCount: SEED_THREADS.length,
    messageCount: SEED_MESSAGES.length,
  };
}
