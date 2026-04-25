/**
 * Port A Local — Events
 *
 * Per-event metadata for the events that get a dedicated detail page.
 * Lighter index entries (one-liners by month) still live inline in
 * src/app/events/page.tsx — promote an entry here when it warrants a
 * full hub page (live updates, day-of photo loading, schedule, host
 * profile, etc.).
 */

export interface EventDetails {
  slug: string;
  name: string;
  /** Short headline for cards / OG */
  tagline: string;
  /** Full description for cards, OG tags, search */
  description: string;
  /** ISO start date+time (event begins). Use 24h, local TX time assumed. */
  startISO: string;
  /** ISO end date+time. For multi-day events, the final wrap. */
  endISO: string;
  /** Human-readable date span ("May 8–10, 2026") */
  dateLabel: string;
  /** Human-readable headline time ("Saturday, May 9 · main day") */
  headlineTime: string;
  /** Plain-language venue label */
  venueName: string;
  /** Mailing-style address */
  venueAddress: string;
  /** Lat/lng for the focal beach access point */
  coordinates: [number, number];
  /** Cost label — "Free", "$25", etc. */
  cost: string;
  /** Emoji or icon for nav/cards */
  icon: string;
  /** Featured on home / events index */
  featured: boolean;
  /** Show on the live site */
  published: boolean;
  /** Slug of the host business in src/data/businesses.ts (cross-links) */
  hostBusinessSlug?: string;
  /** Event organizer / host display name */
  hostName: string;
  /** Tags for search / categorization */
  tags: string[];
  /** Optional Facebook event URL (RSVP source) */
  facebookEventURL?: string;
}

export const events: EventDetails[] = [
  {
    slug: "spring-kite-festival-2026",
    name: "Fly It Port A's 2026 Spring Kite Festival",
    tagline:
      "A free Mother's Day weekend kite fly on the south end of Mustang Island.",
    description:
      "Fly It Port A's 2026 Spring Kite Festival — Mother's Day weekend, May 8–10, with Saturday May 9 as the main flying day. Free, family-friendly, beach markers 1–20. Bring a kite or just come watch.",
    startISO: "2026-05-08T10:00:00-05:00",
    endISO: "2026-05-10T18:00:00-05:00",
    dateLabel: "May 8–10, 2026",
    headlineTime: "Saturday, May 9 · setup 10 AM",
    venueName: "Port Aransas Beach (Markers 1–20)",
    venueAddress: "Port Aransas Beach, Port Aransas, TX 78373",
    coordinates: [27.8232, -97.0401],
    cost: "Free",
    icon: "🪁",
    featured: true,
    published: true,
    hostBusinessSlug: "fly-it-port-a",
    hostName: "Fly It Port A",
    tags: [
      "kite festival",
      "family friendly",
      "free",
      "Mother's Day weekend",
      "beach",
      "Fly It Port A",
      "spring",
    ],
    facebookEventURL: "https://www.facebook.com/events/",
  },
  {
    slug: "deep-sea-roundup-2026",
    name: "Port Aransas Deep Sea Roundup — 90th Annual",
    tagline:
      "Texas's oldest fishing tournament. 1932 to today, no break but a war and a pandemic.",
    description:
      "The 90th annual Port Aransas Deep Sea Roundup runs July 9–12, 2026. Six divisions — Bay-Surf, Offshore, Flyfishing, Kayaking, Tarpon Release, Billfish Release — plus the Junior brackets, the Top Woman Angler award, and the kids' Piggy Perch contest. Live leaderboard, dock weigh-in coverage, captain spotlights, and the history that started it all in 1932.",
    startISO: "2026-07-09T17:00:00-05:00",
    endISO: "2026-07-12T15:00:00-05:00",
    dateLabel: "July 9–12, 2026",
    headlineTime: "Tournament fishing Friday & Saturday · Awards Sunday 1 PM",
    venueName: "Roberts Point Park · Fred Rhodes Pavilion",
    venueAddress: "301 N Alister St, Port Aransas, TX 78373",
    coordinates: [27.8362, -97.0644],
    cost: "Spectators free · Anglers register",
    icon: "🏆",
    featured: true,
    published: true,
    hostBusinessSlug: undefined,
    hostName: "Port Aransas Boatmen, Inc.",
    tags: [
      "Deep Sea Roundup",
      "fishing tournament",
      "Boatmen",
      "Texas's oldest tournament",
      "Tarpon Rodeo",
      "billfish",
      "tarpon",
      "Piggy Perch",
      "Roberts Point Park",
      "tournament coverage",
    ],
  },
];

export function getEventBySlug(slug: string): EventDetails | undefined {
  return events.find((e) => e.slug === slug);
}

export function getPublishedEvents(): EventDetails[] {
  return events.filter((e) => e.published);
}

export function getFeaturedEvents(): EventDetails[] {
  return events.filter((e) => e.published && e.featured);
}
