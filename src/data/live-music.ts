/**
 * Live Music — weekly schedule for Port Aransas venues.
 *
 * Source of truth: the South Jetty's printed "Live Music Tonight" roundup.
 * Refresh cadence: one photo per week to haveebot@gmail.com → OCR + update this file.
 * Scope: Port Aransas venues only (mainland Corpus/Portland/Fulton listings are filtered out).
 *
 * To update:
 *   1. Email the week's printed listing photo to haveebot@gmail.com with subject
 *      "Live Music — Week of MMM DD".
 *   2. Claude transcribes and replaces CURRENT_WEEK below.
 *   3. Optional per-venue enrichment passes happen here too (cover charges, age
 *      restrictions — pulled from venue website/social if not on the printed sheet).
 */

export interface LiveMusicVenue {
  /** stable slug used in the acts list */
  slug: string;
  /** display name */
  name: string;
  /** optional link into our directory; omit when we don't have a listing */
  directoryHref?: string;
}

export interface LiveMusicAct {
  /** ISO date (YYYY-MM-DD) in Central Time */
  date: string;
  /** references LiveMusicVenue.slug */
  venue: string;
  /** band / performer name */
  artist: string;
  /** start time in 12-hour format, e.g. "9 PM" — optional; source often omits */
  time?: string;
  /** short context, e.g. "Recurring every Thursday", "Early set" */
  notes?: string;
  /** cover charge, e.g. "$10", "Free" — show when source provides */
  cover?: string;
  /** age restriction, e.g. "21+", "All ages" */
  ageRestriction?: string;
}

export interface LiveMusicWeek {
  /** ISO date of the first day listed (usually Thursday) */
  weekOf: string;
  /** human-readable source attribution */
  sourcedFrom: string;
  /** ISO date when we received the source */
  sourceReceivedAt: string;
  /** acts during the 7-day window starting at weekOf */
  acts: LiveMusicAct[];
  /** acts printed in the same roundup but beyond the 7-day window */
  upcoming?: LiveMusicAct[];
}

export const VENUES: Record<string, LiveMusicVenue> = {
  "the-gaff": { slug: "the-gaff", name: "The Gaff", directoryHref: "/drink/drink-the-gaff" },
  "shortys": { slug: "shortys", name: "Shorty's", directoryHref: "/drink/drink-shortys" },
  "treasure-island": { slug: "treasure-island", name: "Treasure Island", directoryHref: "/drink/drink-treasure-island" },
  "vfw": { slug: "vfw", name: "VFW Post 8967", directoryHref: "/drink/drink-vfw" },
  "brons": { slug: "brons", name: "Bron's Backyard", directoryHref: "/drink/drink-brons-backyard" },
  "salty-dog": { slug: "salty-dog", name: "Salty Dog", directoryHref: "/drink/drink-salty-dog" },
  "sip-yard": { slug: "sip-yard", name: "Sip Yard" },
};

export const CURRENT_WEEK: LiveMusicWeek = {
  weekOf: "2026-04-23",
  sourcedFrom: "South Jetty — Live Music Tonight, week of Apr 23, 2026",
  sourceReceivedAt: "2026-04-23",
  acts: [
    { date: "2026-04-23", venue: "shortys", artist: "Johnson All Starz", notes: "Recurring every Thursday" },
    { date: "2026-04-23", venue: "the-gaff", artist: "Boudreaux & Pousson" },

    { date: "2026-04-24", venue: "the-gaff", artist: "Boudreaux & Pousson" },
    { date: "2026-04-24", venue: "shortys", artist: "Mantle Jennings" },
    { date: "2026-04-24", venue: "sip-yard", artist: "Young Klassics" },
    { date: "2026-04-24", venue: "brons", artist: "Brandon Michael" },
    { date: "2026-04-24", venue: "treasure-island", artist: "Carson Miller" },
    { date: "2026-04-24", venue: "vfw", artist: "Garry Mitcham" },
    { date: "2026-04-24", venue: "salty-dog", artist: "Dickie Delight" },

    { date: "2026-04-25", venue: "the-gaff", artist: "Jim Dugan" },
    { date: "2026-04-25", venue: "shortys", artist: "John Cortez" },
    { date: "2026-04-25", venue: "brons", artist: "Timothy Noel & Smokin' Guns" },
    { date: "2026-04-25", venue: "sip-yard", artist: "Isaac Jacob" },
    { date: "2026-04-25", venue: "vfw", artist: "Lucky Dogz" },

    { date: "2026-04-26", venue: "shortys", artist: "Boone Holding" },
    { date: "2026-04-26", venue: "shortys", artist: "Jim Dugan & Ty Dietz", notes: "Recurring every Sunday" },
    { date: "2026-04-26", venue: "treasure-island", artist: "Back Pew Revival" },
    { date: "2026-04-26", venue: "brons", artist: "Harmonk" },
    { date: "2026-04-26", venue: "brons", artist: "Groove 2.0" },

    { date: "2026-04-27", venue: "shortys", artist: "John Elijah Band", notes: "Recurring every Monday" },
    { date: "2026-04-27", venue: "brons", artist: "Palacios Bros" },

    { date: "2026-04-28", venue: "vfw", artist: "Brad Ethridge" },
    { date: "2026-04-28", venue: "vfw", artist: "Coastal Benders" },

    { date: "2026-04-29", venue: "the-gaff", artist: "Open Mic with Brad E.", notes: "Recurring every Wednesday" },
  ],
  upcoming: [
    { date: "2026-04-30", venue: "the-gaff", artist: "Jim Dugan" },
    { date: "2026-04-30", venue: "the-gaff", artist: "Jim Bush" },
    { date: "2026-04-30", venue: "the-gaff", artist: "Joe Martyn Rickie" },
    { date: "2026-05-01", venue: "treasure-island", artist: "Raul Ayala" },
    { date: "2026-05-01", venue: "treasure-island", artist: "Jam Band" },
    { date: "2026-05-01", venue: "sip-yard", artist: "Casey Chesnutt" },
    { date: "2026-05-02", venue: "treasure-island", artist: "Palacios Bros" },
    { date: "2026-05-02", venue: "treasure-island", artist: "Cathouse" },
    { date: "2026-05-02", venue: "shortys", artist: "Lucky Dogz" },
    { date: "2026-05-02", venue: "sip-yard", artist: "Case Hardin" },
    { date: "2026-05-02", venue: "sip-yard", artist: "Los Locals" },
    { date: "2026-05-02", venue: "sip-yard", artist: "Logan Samford" },
  ],
};

export function todayInCentral(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export function actsByDate(week: LiveMusicWeek, isoDate: string): LiveMusicAct[] {
  return week.acts.filter((a) => a.date === isoDate);
}

export function actsThisWeek(week: LiveMusicWeek, todayIso: string): { iso: string; acts: LiveMusicAct[] }[] {
  const start = new Date(week.weekOf + "T12:00:00-05:00");
  const days: { iso: string; acts: LiveMusicAct[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (iso < todayIso) continue;
    days.push({ iso, acts: actsByDate(week, iso) });
  }
  return days;
}

export function formatWeekday(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00-05:00");
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Chicago" });
}

export function formatDateLong(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00-05:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Chicago" });
}

export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00-05:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
}
