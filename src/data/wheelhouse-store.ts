/**
 * Wheelhouse storage layer — public interface.
 *
 * Auto-detects backend:
 *   - POSTGRES_URL set         → Vercel Postgres (real persistence)
 *   - POSTGRES_URL absent      → in-memory mock (Push 1 fallback)
 *
 * Same function signatures as both implementations. API routes import
 * from here — they don't know which backend is active.
 *
 * Functions are async to match the Postgres impl. Mock impl is sync
 * internally; we wrap reads in Promise.resolve so the surface stays
 * uniform.
 */

import type {
  Thread,
  ThreadWithMessages,
  Message,
  ThreadState,
  ParticipantId,
  MessageType,
} from "./wheelhouse-types";
import * as mock from "./wheelhouse-store-mock";
import * as pg from "./wheelhouse-store-pg";

// Neon's current integration uses DATABASE_URL; older Vercel Postgres docs
// used POSTGRES_URL. Detect either.
const USE_PG = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

/* -------------------- Reads -------------------- */

export async function getThreads(): Promise<Thread[]> {
  return USE_PG ? pg.getThreads() : Promise.resolve(mock.getThreads());
}

export async function getThread(id: string): Promise<Thread | null> {
  return USE_PG ? pg.getThread(id) : Promise.resolve(mock.getThread(id));
}

export async function getMessagesForThread(
  threadId: string,
): Promise<Message[]> {
  return USE_PG
    ? pg.getMessagesForThread(threadId)
    : Promise.resolve(mock.getMessagesForThread(threadId));
}

export async function getThreadWithMessages(
  id: string,
): Promise<ThreadWithMessages | null> {
  return USE_PG
    ? pg.getThreadWithMessages(id)
    : Promise.resolve(mock.getThreadWithMessages(id));
}

export async function getThreadsAwaiting(
  participantId: ParticipantId,
): Promise<Thread[]> {
  return USE_PG
    ? pg.getThreadsAwaiting(participantId)
    : Promise.resolve(mock.getThreadsAwaiting(participantId));
}

export async function getThreadsForParticipant(
  participantId: ParticipantId,
): Promise<Thread[]> {
  return USE_PG
    ? pg.getThreadsForParticipant(participantId)
    : Promise.resolve(mock.getThreadsForParticipant(participantId));
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
  return USE_PG
    ? pg.createThread(input)
    : Promise.resolve(mock.createThread(input));
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
  return USE_PG
    ? pg.createMessage(input)
    : Promise.resolve(mock.createMessage(input));
}

export async function transitionThread(
  id: string,
  newState: ThreadState,
): Promise<Thread | null> {
  return USE_PG
    ? pg.transitionThread(id, newState)
    : Promise.resolve(mock.transitionThread(id, newState));
}

/** Backend status — handy for the init / debug surface */
export function backendStatus(): { backend: "postgres" | "mock" } {
  return { backend: USE_PG ? "postgres" : "mock" };
}

/** Run only when Postgres is active. Bootstraps schema + seed. */
export async function initSchemaAndSeed() {
  if (!USE_PG) {
    throw new Error(
      "Postgres backend not active — POSTGRES_URL env var is not set. Provision a Vercel Postgres database first.",
    );
  }
  return pg.initSchemaAndSeed();
}
