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

import { sql } from "@vercel/postgres";
import { SEED_THREADS, SEED_MESSAGES } from "./wheelhouse-seed";
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
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_messages_thread_id_idx ON wheelhouse_messages(thread_id)`;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_threads_updated_at_idx ON wheelhouse_threads(updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS wheelhouse_threads_state_idx ON wheelhouse_threads(state)`;

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
