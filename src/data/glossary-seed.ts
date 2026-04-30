/**
 * Initial seed for the Wheelhouse Glossary — hand-curated PAL feature
 * inventory. Loaded once on first /wheelhouse/glossary page load if
 * the table is empty.
 *
 * Categories (Collie's mental-model groupings, established 2026-04-29):
 *   transact   — paid surfaces (carts / beach / delivery / locals / housekeeping / maintenance)
 *   editorial  — Heritage / Dispatch / Events / Tournaments
 *   browse     — directory / search / map / guides
 *   civic      — alerts / emergency / community
 *   internal   — wheelhouse / admin tools (less Collie-relevant)
 *
 * Order within category = curated for marketing salience (ranked from
 * "easiest splash hook" → "deeper backstop"). Collie can reorder freely.
 */

import type { UpsertGlossaryInput } from "./glossary-store";

export const INITIAL_GLOSSARY_ENTRIES: UpsertGlossaryInput[] = [
  // ---- TRANSACT ----
  {
    id: "transact-beach",
    category: "transact",
    featureName: "Beach Setup (cabanas + chairs)",
    oneLiner: "Local vendor sets up your cabana or chairs on the sand — you walk down and it's there.",
    livesAt: "/beach",
    notableBullets: [
      "Cabana $300/day · Chairs $85/day (transparent vendor + PAL fee split)",
      "Vendor blast: John, Tyler, Danny — first to claim wins",
      "72hr-before-setup free cancellation policy",
      "Stripe Connect auto-payout to vendor at 72hr-before-setup mark",
    ],
    marketingStatus: "active",
    displayOrder: 10,
  },
  {
    id: "transact-cart",
    category: "transact",
    featureName: "Golf Cart Rental",
    oneLiner: "Pick your dates → we blast your booking to 14+ local cart companies → first to claim wins → $20 off their standard rate.",
    livesAt: "/rent",
    notableBullets: [
      "$10/day reservation fee on top of vendor's discounted rate",
      "Pickup OR delivery — customer's call",
      "Vendor SMS opt-in roster (default-opt-in policy 2026-04-29)",
    ],
    marketingStatus: "active",
    displayOrder: 20,
  },
  {
    id: "transact-delivery",
    category: "transact",
    featureName: "Local Food + Convenience Delivery",
    oneLiner: "Restaurant orders + beach essentials delivered by local runners — Stripe Connect for instant payouts.",
    livesAt: "/deliver",
    notableBullets: [
      "Crazy Cajun · Dairy Queen · Lowe's Market (more coming)",
      "$5 first-delivery bonus to runners (Tier 1 of Rewards Program)",
      "Live driver leaderboard at /deliver/runners",
      "Customer order tracking with 4-stage progress + driver name",
    ],
    marketingStatus: "active",
    displayOrder: 30,
  },
  {
    id: "transact-locals",
    category: "transact",
    featureName: "PAL Locals (sell · rent · hire)",
    oneLiner: "Marketplace for local artisans, rentals, and service providers — 10% flat platform fee, customer pays.",
    livesAt: "/locals",
    notableBullets: [
      "Three modes: sell (one-off), rent (gear), hire (skills)",
      "Stripe Connect for sellers — instant payouts",
      "10% on top of vendor quote, customer pays",
      "Photo intake via email-to-hello@ (low friction)",
    ],
    marketingStatus: "active",
    displayOrder: 40,
  },
  {
    id: "transact-housekeeping",
    category: "transact",
    featureName: "Rental Cleaning / Housekeeping",
    oneLiner: "$100/hr cleaning service for vacation rentals — Stripe Checkout up front, manual dispatch v1.",
    livesAt: "/housekeeping",
    notableBullets: [
      "1-hour minimum · ~1 hr per 1000 sqft estimate",
      "Customer email + Wheelhouse mirror on paid",
      "v2 marketplace blast pattern (deferred)",
    ],
    marketingStatus: "active",
    displayOrder: 50,
  },
  {
    id: "transact-maintenance",
    category: "transact",
    featureName: "Maintenance + Handyman Dispatch",
    oneLiner: "$20 Priority Dispatch fee for emergency same-day response; standard urgent is free.",
    livesAt: "/maintenance",
    notableBullets: [
      "John Brown is the maintenance vendor (SMS-only by design)",
      "Priority = $20 dispatch fee · Urgent = free standard",
      "4-hour response window guaranteed for Priority",
    ],
    marketingStatus: "active",
    displayOrder: 60,
  },

  // ---- EDITORIAL ----
  {
    id: "editorial-heritage",
    category: "editorial",
    featureName: "Port A Heritage",
    oneLiner: "Original long-form Port Aransas history — written from public sources + archives, not directory listings.",
    livesAt: "/history",
    notableBullets: [
      "20+ pieces · Sandfest, lighthouse, hurricane history, etc.",
      "Companion photos in /photos archive",
      "Brand voice anti-Tourism Bureau (deep-cut, locals-know)",
    ],
    marketingStatus: "active",
    displayOrder: 10,
  },
  {
    id: "editorial-dispatch",
    category: "editorial",
    featureName: "PAL Dispatch (investigative)",
    oneLiner: "Editorial pieces with civic teeth — economic shifts, governance, community questions.",
    livesAt: "/dispatch",
    notableBullets: [
      "Dispatch #1: 'The Two Port Aransases'",
      "Dispatch #2 in flight: P&Z Capture (CIQ/CIS records pending)",
      "Public-records-only sourcing per editorial rules",
    ],
    marketingStatus: "queued",
    displayOrder: 20,
  },
  {
    id: "editorial-events",
    category: "editorial",
    featureName: "Events Hub Pages",
    oneLiner: "Per-event landing pages with day-of coverage scaffolding (photos, leaderboards, conditions).",
    livesAt: "/events",
    notableBullets: [
      "Tournament templates (DSR, TWAT, Texas Legends)",
      "Festival templates (Kite Festival, Sandfest, Whooping Crane)",
      "Build first, no outreach — orgs come to us",
    ],
    marketingStatus: "queued",
    displayOrder: 30,
  },

  // ---- BROWSE ----
  {
    id: "browse-directory",
    category: "browse",
    featureName: "Business Directory",
    oneLiner: "140+ local businesses with photos, hours, phone, map pins.",
    livesAt: "/eat · /drink · /do · /shop · /stay · /services",
    notableBullets: [
      "Curated, not pay-to-play",
      "PUDs scrubbed (Cinnamon Shore / Palmilla / etc — exception: Lisabella's)",
      "Lighthouse mark + brand-consistent OG cards",
    ],
    marketingStatus: "active",
    displayOrder: 10,
  },
  {
    id: "browse-gully",
    category: "browse",
    featureName: "Gully (site search)",
    oneLiner: "Fuzzy search across the entire site — businesses, heritage, events, portals.",
    livesAt: "/gully · Cmd+K palette everywhere",
    notableBullets: [
      "Fuse.js powered — RAG/vector deferred",
      "Indexed: directory + heritage + dispatch + events + portals + delivery vendors",
      "Future: 'Ask Gully' Claude-augmented Q&A (pending Anthropic key in Vercel)",
    ],
    marketingStatus: "queued",
    displayOrder: 20,
  },
  {
    id: "browse-map",
    category: "browse",
    featureName: "Interactive Map",
    oneLiner: "All directory businesses pinned on a Leaflet map.",
    livesAt: "/map",
    notableBullets: [
      "Filter by category",
      "Click pin → mini-card with quick info",
    ],
    marketingStatus: "queued",
    displayOrder: 30,
  },
  {
    id: "browse-guides",
    category: "browse",
    featureName: "Curated Guides",
    oneLiner: "Editorial pick-lists — 'Where to eat with kids', 'Best happy hours', 'Quiet beaches', etc.",
    livesAt: "/guides",
    notableBullets: [
      "10 guides currently live",
      "Each guide handcrafted; rotates seasonally",
    ],
    marketingStatus: "queued",
    displayOrder: 40,
  },
  {
    id: "browse-trip",
    category: "browse",
    featureName: "Trip Planner",
    oneLiner: "Save businesses to a personal trip plan as you browse.",
    livesAt: "/my-trip",
    notableBullets: [
      "Local-storage backed (no signup)",
      "Save-to-trip button on every business detail page",
    ],
    marketingStatus: "parked",
    displayOrder: 50,
  },

  // ---- CIVIC ----
  {
    id: "civic-alerts",
    category: "civic",
    featureName: "PAL Alerts (banner + SMS push)",
    oneLiner: "Community heads-ups (fireworks, parades, ferry, weather) via site banner + SMS subscription.",
    livesAt: "/emergency · footer 'Get the call before everyone else'",
    notableBullets: [
      "Web push live; SMS push wired (A2P 10DLC verified)",
      "Severity tiers: 🚨 critical · ⚠️ advisory · 📍 info",
      "All severities push — 'good stuff too' not just emergencies",
    ],
    marketingStatus: "active",
    displayOrder: 10,
  },
  {
    id: "civic-fishing",
    category: "civic",
    featureName: "Fishing Report",
    oneLiner: "Daily what's-running summary, tide chart, conditions.",
    livesAt: "/fishing-report",
    notableBullets: [
      "Pulled from public NOAA + tide data",
      "Pairs with Heritage tarpon stories + tournament hub",
    ],
    marketingStatus: "queued",
    displayOrder: 20,
  },
  {
    id: "civic-live",
    category: "civic",
    featureName: "Live Conditions",
    oneLiner: "Real-time island weather, water temp, wind, surf.",
    livesAt: "/live",
    notableBullets: [
      "Server-side fetched, cached briefly",
      "Useful for day-trip-decision making",
    ],
    marketingStatus: "queued",
    displayOrder: 30,
  },

  // ---- INTERNAL ----
  {
    id: "internal-wheelhouse",
    category: "internal",
    featureName: "The Wheelhouse",
    oneLiner: "Internal admin board — threads, alerts, payouts, vendor management, revenue.",
    livesAt: "/wheelhouse",
    notableBullets: [
      "Cookie + bearer auth · agent CLI works against same API",
      "Per-vertical admin tools (Beach payouts, Cart vendor SMS, Runner payouts, etc.)",
      "Live visitors counter + Revenue stats (2026-04-29)",
    ],
    marketingStatus: "do-not-surface",
    displayOrder: 10,
  },
];
