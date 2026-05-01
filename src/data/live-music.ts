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
  "bierhaus": { slug: "bierhaus", name: "BierHaus" },
  "beach-bums": { slug: "beach-bums", name: "Beach Bums" },
  "art-center": { slug: "art-center", name: "Port Aransas Art Center" },
  "marker-25": { slug: "marker-25", name: "Marker 25 (beach)" },
  "fred-rhodes": { slug: "fred-rhodes", name: "Fred Rhodes Pavilion" },
};

export const CURRENT_WEEK: LiveMusicWeek = {
  weekOf: "2026-04-30",
  sourcedFrom: "Collie — Port A Local calendar (week of Apr 30, 2026)",
  sourceReceivedAt: "2026-04-30",
  acts: [
    // Thursday (carried from prior week's preview)
    { date: "2026-04-30", venue: "the-gaff", artist: "Jim Dugan" },
    { date: "2026-04-30", venue: "the-gaff", artist: "Jim Bush" },
    { date: "2026-04-30", venue: "the-gaff", artist: "Joe Martyn Ricke" },

    // Friday — May 1
    { date: "2026-05-01", venue: "art-center", artist: "First Friday", time: "5:30 PM" },
    { date: "2026-05-01", venue: "the-gaff", artist: "Aaron Boultinghouse", time: "7 PM" },
    { date: "2026-05-01", venue: "brons", artist: "Harmonx", time: "7 PM" },
    { date: "2026-05-01", venue: "vfw", artist: "Chris Lancaster", time: "7 PM" },
    { date: "2026-05-01", venue: "sip-yard", artist: "Casey Chesnutt", time: "7:30 PM" },
    { date: "2026-05-01", venue: "marker-25", artist: "Moonfire party", time: "7:30 PM" },
    { date: "2026-05-01", venue: "shortys", artist: "Boone Holding", time: "9 PM" },
    { date: "2026-05-01", venue: "treasure-island", artist: "Raul Ayala", time: "9 PM" },

    // Saturday — May 2
    { date: "2026-05-02", venue: "bierhaus", artist: "Big Time Jukebox", time: "6 PM" },
    { date: "2026-05-02", venue: "vfw", artist: "Groove 2.0", time: "7 PM" },
    { date: "2026-05-02", venue: "the-gaff", artist: "Joe Martyn Ricke", time: "7 PM" },
    { date: "2026-05-02", venue: "brons", artist: "Ruben V", time: "7 PM" },
    { date: "2026-05-02", venue: "sip-yard", artist: "Mykel Martin", time: "7:30 PM" },
    { date: "2026-05-02", venue: "sip-yard", artist: "Case Hardin", time: "9 PM" },
    { date: "2026-05-02", venue: "shortys", artist: "Lucky Dogz", time: "9 PM" },
    { date: "2026-05-02", venue: "treasure-island", artist: "Jam Band", time: "9 PM" },
    { date: "2026-05-02", venue: "beach-bums", artist: "SA Lights — Journey Tribute", time: "9 PM" },

    // Sunday — May 3
    { date: "2026-05-03", venue: "fred-rhodes", artist: "Farmers Market", time: "10 AM" },
    { date: "2026-05-03", venue: "bierhaus", artist: "Mykel Martin", time: "2 PM" },
    { date: "2026-05-03", venue: "shortys", artist: "Jim Dugan", time: "3 PM" },
  ],
  upcoming: [],
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
