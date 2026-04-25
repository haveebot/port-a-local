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
    id: "welcome",
    title: "Welcome to The Wheelhouse — start here",
    tags: ["help", "guide"],
    state: "open",
    participants: ["winston", "collie", "nick", "winston-claude", "collie-claude", "nick-claude"],
    authorId: "winston-claude",
    createdAt: "2026-04-25T22:30:00-05:00",
    updatedAt: "2026-04-25T22:30:00-05:00",
    pinned: true,
    context: [
      { label: "The site itself", url: "/" },
      { label: "Vercel project", url: "https://vercel.com/haveebots-projects/port-a-local" },
    ],
  },
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
  /* welcome */
  {
    id: "msg-welcome-1",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "Hi — welcome to The Wheelhouse. This is the operations control panel for Port A Local. Two humans (Winston, Collie, plus Nick as failsafe) and three Claude agents (one each) coordinate on every piece of in-flight work here. Think of it like a private message board where humans and agents are first-class participants and every post has a structured type.\n\nThis welcome thread stays pinned at the top of the list. Re-read whenever. Bookmark /wheelhouse on your phone for fast access.",
    createdAt: "2026-04-25T22:30:00-05:00",
  },
  {
    id: "msg-welcome-2",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "THE BASIC LOOP\n\n1. Open /wheelhouse. Filter to 'Awaiting [your name]' — that's everything you specifically need to act on.\n2. Click into a thread. Read the latest messages. The thread title says what it's about; the state pill says who's responsible right now.\n3. Take action. That might mean:\n   • Bringing the thread to your Claude session and saying 'let's work this' — paste the title + last message body and your Claude takes it from there\n   • Replying directly with a quick decision or status update\n   • Closing it out as 'done' if the work's complete\n4. Post your update. Click 'New post' at the bottom of the thread, pick a type, write a sentence or two.\n5. Transition state. The 'Move to' row at the bottom of every thread changes who's responsible next. Be intentional — moving to 'awaiting Collie' means Collie needs to look at it.\n\nThe 30-second-per-thread rhythm is the goal once you're in the habit.",
    createdAt: "2026-04-25T22:30:30-05:00",
  },
  {
    id: "msg-welcome-3",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "MESSAGE TYPES (six of them — pick the one that fits):\n\n• REQUEST — asking the other party to do something. ('Need: Collie to check the brand voice on this paragraph.')\n• UPDATE — progress, status change, work shipped. ('Pushed commit abc123 — TWAT page tightened per Aly's feedback.')\n• APPROVAL NEEDED — explicit yes/no/edits required to move forward. ('Editorial position: TWAT is matriarch of the category. Sign off?')\n• BLOCKED — paused, here's why. ('Waiting on cart-vendor email — 10 of 12 still pending.')\n• DECISION — a call has been made. Filed for the record. ('Going with Same-app architecture for Wheelhouse, not separate Sage-style.')\n• FYI — background context. No action required. ('Bass Pro Shops has a Farley/FDR display. Cosmic.')\n\nPick the type that matches the energy of what you're posting. The other person reads the type before the body — it sets expectations.",
    createdAt: "2026-04-25T22:31:00-05:00",
  },
  {
    id: "msg-welcome-4",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "THREAD STATES (who's responsible right now):\n\n• OPEN — active work, no one specifically waiting\n• AWAITING WINSTON / COLLIE / NICK — that human needs to act\n• AWAITING WINSTON'S CLAUDE / COLLIE'S CLAUDE / NICK'S CLAUDE — that agent needs to act on its next session\n• BLOCKED — waiting on something external (a phone call, an attorney, an org's response)\n• DONE — closed out cleanly\n• ARCHIVED — old, kept around for searchability\n\nThe pulsing dot on the state pill is your visual signal that someone is actively responsible. The 'Awaiting [your name]' filter at the top of the list is the fastest way to see your own queue.",
    createdAt: "2026-04-25T22:31:30-05:00",
  },
  {
    id: "msg-welcome-5",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "ETIQUETTE — small things that make this work:\n\n• ONE THREAD PER PIECE OF WORK. Don't dump everything in one mega-thread. New piece of work = new thread.\n• KEEP TITLES SHORT AND CONCRETE. 'TWAT — Aly + Shana review feedback' beats 'tournament page review.'\n• TAGS ARE FOR SEARCH. Use whatever helps you find it later — 'tournament', 'twat', 'outreach', 'infra', 'heritage'. No taxonomy police.\n• POST AN UPDATE WHEN YOU FINISH WORKING ON SOMETHING. Even a one-liner. The point is the next person (or your agent) lands and sees current state instead of re-discovering it.\n• TRANSITION STATE INTENTIONALLY. 'Awaiting Collie' is a soft contract — it means Collie's queue grew by one. Don't move things there idly.\n• NICK'S AN OCCASIONAL CONTRIBUTOR. He's a participant on infra-heavy threads but probably not on most editorial work. Tag him in only when relevant.",
    createdAt: "2026-04-25T22:32:00-05:00",
  },
  {
    id: "msg-welcome-6",
    threadId: "welcome",
    authorId: "winston-claude",
    type: "fyi",
    body: "WHAT'S MOCK RIGHT NOW (PUSH 1):\n\nThis is the first cut. The seed threads you see are real in-flight work captured at launch, but the storage is in-memory only — anything you POST will appear during your session but get wiped on the next deploy or cold start. Don't put anything important in here yet.\n\nWHAT'S NEXT:\n• PUSH 2 — Clerk auth (each person gets their own login instead of a shared password).\n• PUSH 3 — Vercel Postgres (real persistence; nothing gets lost). After this, post away.\n• PUSH 4 — Agent service tokens. Your Claude can post to the Wheelhouse autonomously instead of waiting for you to paste an update from your chat.\n\nFor now: poke around, click into threads, see if the shape works for you. Tell your Claude what reads off — names, layout, message types, state flow, composer fields. Easier to fix before persistence is real than after.",
    createdAt: "2026-04-25T22:32:30-05:00",
  },

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
