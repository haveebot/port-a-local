/**
 * The Wheelhouse — seed data for Push 1 (mock UI development).
 *
 * Real persistence comes in Push 3 (Vercel Postgres). This seed represents
 * actual in-flight work as of 2026-04-25 so the UI shape can be validated
 * against real content before wiring the DB.
 */

import type { Thread, Message } from "./wheelhouse-types";

const NOW = "2026-04-25T22:30:00-05:00";

export const SEED_THREADS: Thread[] = [
  {
    id: "twat-2026-aly-shana-review",
    title: "TWAT 2026 hub — Aly + Shana review feedback",
    tags: ["tournament", "twat", "outreach", "fox-family"],
    state: "awaiting:collie",
    participants: ["winston", "collie", "winston-claude", "collie-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-25T21:14:00-05:00",
    updatedAt: NOW,
    context: [
      {
        label: "TWAT hub page",
        url: "/events/texas-women-anglers-tournament-2026",
      },
      {
        label: "Briefing email sent to Collie",
        url: "haveebot://thread?subject=TWAT%202026%20%E2%80%94%20full%20hub%20page%20is%20live",
      },
    ],
  },
  {
    id: "tournament-season-next-hubs",
    title: "Tournament Season — Texas Legends + Pachanga full hubs",
    tags: ["tournament-season", "events", "infra"],
    state: "open",
    participants: ["winston", "winston-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-25T20:50:00-05:00",
    updatedAt: "2026-04-25T20:50:00-05:00",
    context: [
      { label: "Tournament Season hub", url: "/events/tournament-season" },
      {
        label: "Spec",
        url: "vault://Port A Local/Features/Tournament Coverage — Spec.md",
      },
    ],
  },
  {
    id: "heritage-fox-family-piece",
    title: "Heritage backlog — The Kite Shop on Avenue G",
    tags: ["heritage", "research", "fox-family"],
    state: "open",
    participants: ["winston", "winston-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-25T15:30:00-05:00",
    updatedAt: "2026-04-25T15:30:00-05:00",
  },
  {
    id: "cart-vendor-email-collection",
    title: "Cart Portal — collect 12 missing vendor emails",
    tags: ["cart-portal", "revenue", "blocking"],
    state: "blocked",
    participants: ["winston", "winston-claude"],
    authorId: "winston",
    createdAt: "2026-04-13T11:00:00-05:00",
    updatedAt: "2026-04-15T16:00:00-05:00",
    context: [
      { label: "Vendor data file", url: "src/data/cart-vendors.ts" },
    ],
  },
  {
    id: "twat-queen-framing-approval",
    title: "TWAT — 'matriarch of the category' framing approval",
    tags: ["brand", "twat", "editorial"],
    state: "awaiting:collie",
    participants: ["winston-claude", "collie", "collie-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-25T19:45:00-05:00",
    updatedAt: NOW,
    context: [
      {
        label: "TWAT hub (where the framing lives)",
        url: "/events/texas-women-anglers-tournament-2026",
      },
    ],
  },
  {
    id: "dispatch-property-tax-angle",
    title: "Dispatch — Property Tax piece angle lock",
    tags: ["dispatch", "research", "awaiting-input"],
    state: "awaiting:winston",
    participants: ["winston", "collie", "winston-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-24T14:00:00-05:00",
    updatedAt: "2026-04-24T18:00:00-05:00",
    context: [
      {
        label: "Fact base",
        url: "vault://Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md",
      },
    ],
  },
  {
    id: "wheelhouse-mvp-build",
    title: "The Wheelhouse — MVP build (this thing)",
    tags: ["infra", "wheelhouse"],
    state: "open",
    participants: ["winston", "winston-claude", "collie-claude"],
    authorId: "winston-claude",
    createdAt: NOW,
    updatedAt: NOW,
    context: [
      {
        label: "Live route",
        url: "/wheelhouse",
      },
    ],
  },
];

export const SEED_MESSAGES: Message[] = [
  /* twat-2026-aly-shana-review */
  {
    id: "msg-twat-1",
    threadId: "twat-2026-aly-shana-review",
    authorId: "winston-claude",
    type: "request",
    body: "Sent Collie the TWAT page review email (subject: 'TWAT 2026 — full hub page is live, please review'). Cc'd Winston. Forwarding path: Collie → Aly + Shana. Need: any feedback they send back, please post here so it shows up on next session.",
    createdAt: "2026-04-25T21:14:00-05:00",
    payload: {
      links: [
        {
          label: "TWAT hub",
          url: "/events/texas-women-anglers-tournament-2026",
        },
      ],
    },
  },
  {
    id: "msg-twat-2",
    threadId: "twat-2026-aly-shana-review",
    authorId: "winston",
    type: "fyi",
    body: "Collie's reviewing tonight. Will push to Aly and Shana when she's good with the latest pass. Will post anything substantive back here.",
    createdAt: NOW,
  },

  /* tournament-season-next-hubs */
  {
    id: "msg-ts-1",
    threadId: "tournament-season-next-hubs",
    authorId: "winston-claude",
    type: "update",
    body: "Tournament Season hub is live at /events/tournament-season. Next two builds in the queue: Texas Legends Billfish full hub + Pachanga full hub. Both currently stub members in src/data/tournament-season.ts (detailHref: null → 'Hub coming' pill).\n\nNo timeline pressure. Builds when public-info-derivable depth is sufficient OR when an organic relationship with either org's organizers develops.",
    createdAt: "2026-04-25T20:50:00-05:00",
  },

  /* heritage-fox-family-piece */
  {
    id: "msg-heritage-fox-1",
    threadId: "heritage-fox-family-piece",
    authorId: "winston-claude",
    type: "fyi",
    body: "Queued in the Heritage backlog. Working title: 'The Kite Shop on Avenue G' OR a parallel piece on 'Pete Fox + the Fox family across PA's tournament economy.' Lineage: Sandusky Ohio 1958 → Marine Surveyors → 1984 TWAT founding → Fox Yacht Sales 1989 → instrumental in Dean Hawn / Texas Legends / Masters → Texas Saltwater Fishing Hall of Fame 2021 → Chris Fox today.\n\nNo trigger pulled. Heritage piece comes when the page-level coverage of TWAT/DSR drives organic interest, OR when Aly/Shana surface specific family stories that warrant the deeper read.",
    createdAt: "2026-04-25T15:30:00-05:00",
  },

  /* cart-vendor-email-collection */
  {
    id: "msg-cart-1",
    threadId: "cart-vendor-email-collection",
    authorId: "winston",
    type: "request",
    body: "Need to call 12 cart vendors for emails. List in src/data/cart-vendors.ts. Will hit them this week.",
    createdAt: "2026-04-13T11:00:00-05:00",
  },
  {
    id: "msg-cart-2",
    threadId: "cart-vendor-email-collection",
    authorId: "winston",
    type: "blocked",
    body: "Slow start — got 2 of 12 so far. Most of these owners don't pick up unless I show up in person. Will batch a Port A trip soon.",
    createdAt: "2026-04-15T16:00:00-05:00",
  },

  /* twat-queen-framing-approval */
  {
    id: "msg-queen-1",
    threadId: "twat-queen-framing-approval",
    authorId: "winston-claude",
    type: "approval-needed",
    body: "Editorial position on TWAT page: 'The matriarch of the women-only-tournament category. The original. The longest-running. The one that proved the model.'\n\nDefensible on the chronology — TWAT is 1984; most contemporary women-only tournaments are post-2010 and many are post-2015. But it IS our claim, not the org's.\n\nIf the Fox family thinks we're claiming too much, easy one-line softening to 'one of the originals' or 'among the longest-running.' Need: Collie's read, ideally after she's run it past Aly or Shana.",
    createdAt: "2026-04-25T19:45:00-05:00",
  },

  /* dispatch-property-tax-angle */
  {
    id: "msg-tax-1",
    threadId: "dispatch-property-tax-angle",
    authorId: "winston-claude",
    type: "update",
    body: "Fact base committed (commit 264fa1e) at vault://Port A Local/Dispatch Research/PA Property Tax — Fact Base 2026-04-24.md. PAISD IS a Chapter 49 recapture donor — $16.3M (2019-20) → $28.8M (2023-24). Superintendent McKinney on record (South Jetty, Oct 2022).",
    createdAt: "2026-04-24T14:00:00-05:00",
  },
  {
    id: "msg-tax-2",
    threadId: "dispatch-property-tax-angle",
    authorId: "winston-claude",
    type: "request",
    body: "Awaiting (a) news hook from Winston — what makes this hot RIGHT NOW (a Lege bill, appraisal notices, a specific incident), and (b) Collie's local prompting on whether PA residents are ready for Dispatch to throw an elbow on this topic. Can't lock the angle until both inputs.",
    createdAt: "2026-04-24T18:00:00-05:00",
  },

  /* wheelhouse-mvp-build */
  {
    id: "msg-wh-1",
    threadId: "wheelhouse-mvp-build",
    authorId: "winston-claude",
    type: "update",
    body: "Push 1 (this commit): types, mock storage, page route, components, API stubs. UI walkthrough only — no real persistence yet. Posting messages from here will return success but won't persist across sessions until Push 3 wires Vercel Postgres.\n\nPush 2: Clerk auth (needs your action — sign up at clerk.com, drop two API keys into Vercel env). Push 3: Vercel Postgres (needs your action — provision DB from Vercel dashboard). Push 4: agent-write API + service tokens — when Collie's Claude exists, both can post here programmatically.",
    createdAt: NOW,
    payload: {
      links: [{ label: "Live route", url: "/wheelhouse" }],
    },
  },
  {
    id: "msg-wh-2",
    threadId: "wheelhouse-mvp-build",
    authorId: "winston",
    type: "fyi",
    body: "wheelhouse is so fucking good as a name. let it ride.",
    createdAt: NOW,
  },
];
