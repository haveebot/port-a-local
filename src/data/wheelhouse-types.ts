/**
 * The Wheelhouse — type model
 *
 * Shared workspace for two humans (Winston, Collie) and their two Claude
 * agents (winston-claude, collie-claude). Each open piece of work is a
 * thread. Each post in a thread is a structured Message. Threads have
 * state that says who's responsible right now.
 *
 * V1 is mock-storage-backed; Push 3 swaps in Vercel Postgres.
 */

/* ------------------------------------------------------------------------ */
/* Participants                                                             */
/* ------------------------------------------------------------------------ */

export type ParticipantId =
  | "winston"
  | "collie"
  | "nick"
  | "winston-claude"
  | "collie-claude"
  | "nick-claude";

export type ParticipantKind = "human" | "agent";

export interface Participant {
  id: ParticipantId;
  /** Display name shown in UI */
  name: string;
  kind: ParticipantKind;
  /** For agents: which human they belong to */
  ownerId?: ParticipantId;
  /** Color token for visual identification */
  accent: "navy" | "coral" | "purple" | "gold" | "teal" | "indigo";
  /** Short label for participant badges */
  short: string;
}

export const PARTICIPANTS: Participant[] = [
  { id: "winston", name: "Winston", kind: "human", accent: "navy", short: "W" },
  { id: "collie", name: "Collie", kind: "human", accent: "coral", short: "C" },
  { id: "nick", name: "Nick", kind: "human", accent: "teal", short: "N" },
  {
    id: "winston-claude",
    name: "Winston's Claude",
    kind: "agent",
    ownerId: "winston",
    accent: "purple",
    short: "WC",
  },
  {
    id: "collie-claude",
    name: "Collie's Claude",
    kind: "agent",
    ownerId: "collie",
    accent: "gold",
    short: "CC",
  },
  {
    id: "nick-claude",
    name: "Nick's Claude",
    kind: "agent",
    ownerId: "nick",
    accent: "indigo",
    short: "NC",
  },
];

export function getParticipant(id: ParticipantId): Participant {
  const p = PARTICIPANTS.find((p) => p.id === id);
  if (!p) throw new Error(`Unknown participant: ${id}`);
  return p;
}

/* ------------------------------------------------------------------------ */
/* Messages                                                                 */
/* ------------------------------------------------------------------------ */

export type MessageType =
  | "request" /* asking for action */
  | "update" /* progress / status change */
  | "approval-needed" /* explicit yes/no required */
  | "blocked" /* paused, here's why */
  | "decision" /* a call has been made */
  | "fyi"; /* just informing */

export interface MessageTypeMeta {
  label: string;
  /** One-line description shown in tooltips / composer */
  hint: string;
  /** Tailwind class slug for the type pill */
  tone: "coral" | "navy" | "amber" | "red" | "purple" | "sand";
}

export const MESSAGE_TYPE_META: Record<MessageType, MessageTypeMeta> = {
  request: {
    label: "Request",
    hint: "Asking the other party to do something.",
    tone: "coral",
  },
  update: {
    label: "Update",
    hint: "Progress, status change, or work shipped.",
    tone: "navy",
  },
  "approval-needed": {
    label: "Approval needed",
    hint: "Explicit yes / no / edits required to move forward.",
    tone: "amber",
  },
  blocked: {
    label: "Blocked",
    hint: "Work is paused — here's why.",
    tone: "red",
  },
  decision: {
    label: "Decision",
    hint: "A call has been made. Filed for the record.",
    tone: "purple",
  },
  fyi: {
    label: "FYI",
    hint: "Background context. No action required.",
    tone: "sand",
  },
};

export interface Message {
  id: string;
  threadId: string;
  authorId: ParticipantId;
  type: MessageType;
  /** Plain-text body. Markdown allowed. */
  body: string;
  /** ISO timestamp */
  createdAt: string;
  /** Optional structured payload — links, file refs, commit SHAs */
  payload?: {
    links?: { label: string; url: string }[];
    commitSha?: string;
    /** Free-form key/value bag for future use */
    extra?: Record<string, string | number | boolean>;
  };
  /** Participant IDs who've marked this message read */
  readBy?: ParticipantId[];
}

/* ------------------------------------------------------------------------ */
/* Threads                                                                  */
/* ------------------------------------------------------------------------ */

export type ThreadState =
  | "open"
  | "awaiting:winston"
  | "awaiting:collie"
  | "awaiting:nick"
  | "awaiting:winston-claude"
  | "awaiting:collie-claude"
  | "awaiting:nick-claude"
  | "blocked"
  | "done"
  | "archived";

export interface ThreadStateMeta {
  label: string;
  /** Hex / tailwind tone */
  tone: "coral" | "navy" | "amber" | "red" | "purple" | "green" | "sand";
}

export const THREAD_STATE_META: Record<ThreadState, ThreadStateMeta> = {
  open: { label: "Open", tone: "navy" },
  "awaiting:winston": { label: "Awaiting Winston", tone: "coral" },
  "awaiting:collie": { label: "Awaiting Collie", tone: "coral" },
  "awaiting:nick": { label: "Awaiting Nick", tone: "coral" },
  "awaiting:winston-claude": {
    label: "Awaiting Winston's Claude",
    tone: "purple",
  },
  "awaiting:collie-claude": {
    label: "Awaiting Collie's Claude",
    tone: "purple",
  },
  "awaiting:nick-claude": {
    label: "Awaiting Nick's Claude",
    tone: "purple",
  },
  blocked: { label: "Blocked", tone: "red" },
  done: { label: "Done", tone: "green" },
  archived: { label: "Archived", tone: "sand" },
};

export interface Thread {
  id: string;
  /** Short title (under ~80 chars). What this thread is about. */
  title: string;
  /** Tags — used for filtering. e.g. "tournament", "outreach", "infra" */
  tags: string[];
  state: ThreadState;
  /** ParticipantIds involved in this thread */
  participants: ParticipantId[];
  /** Who created the thread */
  authorId: ParticipantId;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp — most recent activity */
  updatedAt: string;
  /** Optional links to context (commits, pages, docs, vault paths) */
  context?: { label: string; url: string }[];
  /** When true, sorts to the top of every list regardless of updatedAt */
  pinned?: boolean;
}

export interface ThreadWithMessages extends Thread {
  messages: Message[];
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Determine "who's responsible right now" for a thread, derived from state.
 * Returns ParticipantId or null when the thread is open / blocked / done.
 */
export function responsibleParticipant(state: ThreadState): ParticipantId | null {
  if (state.startsWith("awaiting:")) {
    return state.replace("awaiting:", "") as ParticipantId;
  }
  return null;
}

/** All available tags drawn from a list of threads */
export function uniqueTags(threads: Thread[]): string[] {
  return [...new Set(threads.flatMap((t) => t.tags))].sort();
}
