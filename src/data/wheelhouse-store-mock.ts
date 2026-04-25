/**
 * Wheelhouse storage layer.
 *
 * Push 1 — in-memory mutable copy of seed data. Mutations succeed within a
 * single Node.js process lifetime but don't persist across deploys / cold
 * starts. This is intentional: gives the UI realistic feedback while we
 * validate shape, then Push 3 swaps the implementation for Vercel Postgres
 * without touching API routes.
 */

import {
  SEED_THREADS,
  SEED_MESSAGES,
} from "./wheelhouse-seed";
import type {
  Thread,
  ThreadWithMessages,
  Message,
  ThreadState,
  ParticipantId,
  MessageType,
} from "./wheelhouse-types";

let _threads: Thread[] = [...SEED_THREADS];
let _messages: Message[] = [...SEED_MESSAGES];

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* -------------------- Reads -------------------- */

export function getThreads(): Thread[] {
  return [..._threads].sort((a, b) => {
    // Pinned always sorts above non-pinned
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Within each group, most recently updated first
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getThread(id: string): Thread | null {
  return _threads.find((t) => t.id === id) ?? null;
}

export function getMessagesForThread(threadId: string): Message[] {
  return _messages
    .filter((m) => m.threadId === threadId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function getThreadWithMessages(id: string): ThreadWithMessages | null {
  const thread = getThread(id);
  if (!thread) return null;
  return { ...thread, messages: getMessagesForThread(id) };
}

/** All threads where the given participant is responsible right now */
export function getThreadsAwaiting(participantId: ParticipantId): Thread[] {
  return getThreads().filter(
    (t) => t.state === `awaiting:${participantId}`,
  );
}

/** All threads the participant is part of */
export function getThreadsForParticipant(
  participantId: ParticipantId,
): Thread[] {
  return getThreads().filter((t) => t.participants.includes(participantId));
}

/* -------------------- Mutations -------------------- */

export interface CreateThreadInput {
  title: string;
  tags: string[];
  participants: ParticipantId[];
  authorId: ParticipantId;
  initialMessage?: {
    type: MessageType;
    body: string;
  };
  state?: ThreadState;
  context?: { label: string; url: string }[];
}

export function createThread(input: CreateThreadInput): ThreadWithMessages {
  const now = new Date().toISOString();
  const thread: Thread = {
    id: newId("thread"),
    title: input.title.trim(),
    tags: input.tags,
    state: input.state ?? "open",
    participants: input.participants,
    authorId: input.authorId,
    createdAt: now,
    updatedAt: now,
    context: input.context,
  };
  _threads = [thread, ..._threads];

  const messages: Message[] = [];
  if (input.initialMessage) {
    const msg: Message = {
      id: newId("msg"),
      threadId: thread.id,
      authorId: input.authorId,
      type: input.initialMessage.type,
      body: input.initialMessage.body.trim(),
      createdAt: now,
    };
    _messages = [..._messages, msg];
    messages.push(msg);
  }

  return { ...thread, messages };
}

export interface CreateMessageInput {
  threadId: string;
  authorId: ParticipantId;
  type: MessageType;
  body: string;
  payload?: Message["payload"];
}

export function createMessage(input: CreateMessageInput): Message | null {
  const thread = getThread(input.threadId);
  if (!thread) return null;
  const now = new Date().toISOString();
  const msg: Message = {
    id: newId("msg"),
    threadId: input.threadId,
    authorId: input.authorId,
    type: input.type,
    body: input.body.trim(),
    createdAt: now,
    payload: input.payload,
  };
  _messages = [..._messages, msg];
  // Bump thread's updatedAt
  _threads = _threads.map((t) =>
    t.id === input.threadId ? { ...t, updatedAt: now } : t,
  );
  return msg;
}

export function transitionThread(
  id: string,
  newState: ThreadState,
): Thread | null {
  const thread = getThread(id);
  if (!thread) return null;
  const now = new Date().toISOString();
  _threads = _threads.map((t) =>
    t.id === id ? { ...t, state: newState, updatedAt: now } : t,
  );
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

export function getRecentActivity(windowHours = 24): ActivitySummary {
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();
  const threadsById = new Map(_threads.map((t) => [t.id, t]));

  const recentMessages = _messages
    .filter((m) => m.createdAt > cutoffIso)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const newThreads = _threads.filter((t) => t.createdAt > cutoffIso);
  const newThreadIds = new Set(newThreads.map((t) => t.id));
  const activeThreadIds = new Set(recentMessages.map((m) => m.threadId));
  newThreadIds.forEach((id) => activeThreadIds.add(id));

  const events: ActivityEvent[] = recentMessages
    .slice(0, MAX_EVENTS)
    .map((m) => {
      const thread = threadsById.get(m.threadId);
      const body = m.body.length > PREVIEW_LEN
        ? m.body.slice(0, PREVIEW_LEN).trim() + "…"
        : m.body;
      return {
        messageId: m.id,
        threadId: m.threadId,
        threadTitle: thread?.title ?? "(deleted thread)",
        threadIsNew: newThreadIds.has(m.threadId),
        authorId: m.authorId,
        type: m.type,
        bodyPreview: body,
        createdAt: m.createdAt,
      };
    });

  return {
    windowHours,
    windowStart: cutoffIso,
    newMessages: recentMessages.length,
    newThreads: newThreads.length,
    activeThreads: activeThreadIds.size,
    events,
  };
}
