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
  "bernies": { slug: "bernies", name: "Bernie's Beach House" },
  "sip-yard": { slug: "sip-yard", name: "Sip Yard" },
  "bierhaus": { slug: "bierhaus", name: "BierHaus" },
  "reds-patio-bar": { slug: "reds-patio-bar", name: "Red's Patio Bar" },
  "beach-bums": { slug: "beach-bums", name: "Beach Bums" },
  "art-center": { slug: "art-center", name: "Port Aransas Art Center" },
  "marker-25": { slug: "marker-25", name: "Marker 25 (beach)" },
  "fred-rhodes": { slug: "fred-rhodes", name: "Fred Rhodes Pavilion" },
  "roberts-point-park": { slug: "roberts-point-park", name: "Roberts Point Park" },
  "roosevelts-tarpon-inn": { slug: "roosevelts-tarpon-inn", name: "Roosevelt's at the Tarpon Inn" },
};

export const CURRENT_WEEK: LiveMusicWeek = {
  weekOf: "2026-06-28",
  sourcedFrom: "Port A Local — week of June 28, 2026",
  sourceReceivedAt: "2026-06-28",
  acts: [
    // Sunday — June 28
    { date: "2026-06-28", venue: "bernies", artist: "Tumble Dry Low" },
    { date: "2026-06-28", venue: "brons", artist: "Tate Mitchell" },
    { date: "2026-06-28", venue: "salty-dog", artist: "Clark Bros" },
    { date: "2026-06-28", venue: "shortys", artist: "Jim Dugan" },
    { date: "2026-06-28", venue: "shortys", artist: "Ty Dietz" },
    { date: "2026-06-28", venue: "sip-yard", artist: "Brett Axelson" },
    { date: "2026-06-28", venue: "the-gaff", artist: "Brad Ethridge", notes: "Open mic" },
    { date: "2026-06-28", venue: "salty-dog", artist: "Karaoke" },

    // Monday — June 29
    { date: "2026-06-29", venue: "shortys", artist: "John Elijah Band" },
    { date: "2026-06-29", venue: "brons", artist: "Karaoke" },

    // Tuesday — June 30
    { date: "2026-06-30", venue: "brons", artist: "Brandon Michael" },
    { date: "2026-06-30", venue: "vfw", artist: "Brad Ethridge" },

    // Wednesday — July 1
    { date: "2026-07-01", venue: "brons", artist: "Jerry Ward Duo" },

    // Thursday — July 2
    { date: "2026-07-02", venue: "sip-yard", artist: "Carson Jeffrey" },
    { date: "2026-07-02", venue: "brons", artist: "Brad Ethridge" },

    // Friday — July 3 (4th of July weekend kicks off)
    { date: "2026-07-03", venue: "treasure-island", artist: "Diamond's Edge" },
    { date: "2026-07-03", venue: "treasure-island", artist: "Five Card Draw" },
    { date: "2026-07-03", venue: "sip-yard", artist: "Kin Faux" },
    { date: "2026-07-03", venue: "salty-dog", artist: "Clark Bros", notes: "4th of July weekend" },
    { date: "2026-07-03", venue: "roosevelts-tarpon-inn", artist: "The Dunebillies" },
    { date: "2026-07-03", venue: "brons", artist: "Tallula Junction" },

    // Saturday — July 4
    { date: "2026-07-04", venue: "sip-yard", artist: "Clay Hollis", notes: "4th of July" },
    { date: "2026-07-04", venue: "bierhaus", artist: "Bigtime Jukebox" },
    { date: "2026-07-04", venue: "vfw", artist: "The Groove 2.0" },
    { date: "2026-07-04", venue: "brons", artist: "David Florez Duo" },
    { date: "2026-07-04", venue: "bernies", artist: "20th Annual 4th of July Bash", notes: "Holiday bash" },
  ],
  upcoming: [
    { date: "2026-07-05", venue: "brons", artist: "Brandon Michael Band" },
    { date: "2026-07-07", venue: "brons", artist: "Ty Dietz" },
    { date: "2026-07-09", venue: "brons", artist: "Billy Snipes" },
    { date: "2026-07-10", venue: "treasure-island", artist: "JonMikael Mraz Band" },
    { date: "2026-07-10", venue: "brons", artist: "Chanklas" },
    { date: "2026-07-11", venue: "brons", artist: "Dreaming in Color" },
    { date: "2026-07-12", venue: "treasure-island", artist: "Drew Brown Band" },
    { date: "2026-07-12", venue: "brons", artist: "The Resolution" },
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

/**
 * True once the printed week's 7-day window is fully past. The page uses this
 * to switch into its "between schedules" state (venue directory + how-to-find
 * copy) instead of advertising a dated week with zero shows — the site should
 * never look stale just because a weekly refresh hasn't landed yet.
 */
export function weekIsStale(
  week: LiveMusicWeek = CURRENT_WEEK,
  today: string = todayInCentral(),
): boolean {
  const end = new Date(week.weekOf + "T12:00:00-05:00");
  end.setDate(end.getDate() + 7);
  return today >= end.toISOString().slice(0, 10);
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

/**
 * Convert a printed-roundup time string ("9 PM", "7:30 PM", "10 AM") into a
 * fractional hour 0-23.999 for sort purposes. Missing time → 0 (sorts first
 * when DESC, last when ASC). Used by liveMusicHeadline to pick "headliner-ish"
 * acts (later start time = more headline-ish for the FB-share OG card).
 */
function parseActTime(time: string | undefined): number {
  if (!time) return 0;
  const m = time.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!m) return 0;
  let hr = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const isPm = m[3].toUpperCase() === "PM";
  if (isPm && hr !== 12) hr += 12;
  if (!isPm && hr === 12) hr = 0;
  return hr + min / 60;
}

/**
 * Sort score for "headline-iness." Late-start = more headline-ish; tributes
 * /featured/headliner-tagged acts get a half-hour boost so they surface above
 * regulars in the same time tier (e.g., a 9 PM tribute beats a 9 PM regular)
 * but don't leapfrog a later-start act (a 7 PM tribute does NOT beat a 9 PM
 * regular). Stable sort preserves data-file order within ties.
 */
function actHeadlineScore(act: LiveMusicAct): number {
  let score = parseActTime(act.time);
  const haystack = `${act.artist} ${act.notes ?? ""}`;
  if (/tribute|featur|headlin/i.test(haystack)) score += 0.5;
  return score;
}

export interface LiveMusicHeadline {
  /** "Tonight" if today has shows; else the day-name (Saturday, Sunday); else "This Week" */
  framing: string;
  /** ISO date the framing refers to — undefined for the no-shows-anywhere fallback */
  iso?: string;
  /** Number of acts on the framing day */
  count: number;
  /** Top 4 acts on the framing day, sorted by start time DESC ("headliner-ish" first) */
  topActs: LiveMusicAct[];
  /** ~50ch — for <title>, OG title, FB share-card headline */
  title: string;
  /** ~140ch — for <meta description> + OG description */
  description: string;
  /** ~80ch — for the OG image's subtitle line under the headline */
  ogSubtitle: string;
}

/**
 * Produce dynamic, day-of-week-aware copy for /live-music's metadata + OG card.
 *
 * Logic:
 *   - If today has shows  → frame as "Tonight"
 *   - Else next day with shows → frame as that weekday name
 *   - Else fallback → "Live Music This Week" generic copy
 *
 * Picks "top 3" by latest-start-time as a proxy for headline-iness — 9 PM
 * shows feature before 7 PM. Not perfect (no actual headliner flag in source
 * data) but matches the caption style Collie + Winston naturally write.
 *
 * Pure (no DB / no API calls) so it's safe to call from generateMetadata,
 * the OG image route, AND the page render. Same input → same output.
 */
export function liveMusicHeadline(
  week: LiveMusicWeek = CURRENT_WEEK,
  today: string = todayInCentral(),
): LiveMusicHeadline {
  const days = actsThisWeek(week, today);
  const targetDay = days.find((d) => d.acts.length > 0);

  if (!targetDay) {
    return {
      framing: "This Week",
      count: 0,
      topActs: [],
      title: "Live Music in Port Aransas",
      description:
        "Who's playing where across Port Aransas venues. Updated weekly from the printed roundup.",
      ogSubtitle:
        "The Gaff · Shorty's · Bron's · Treasure Island · Sip Yard · VFW",
    };
  }

  const sortedActs = [...targetDay.acts].sort(
    (a, b) => actHeadlineScore(b) - actHeadlineScore(a),
  );
  const topActs = sortedActs.slice(0, 4);
  const top3 = sortedActs.slice(0, 3);

  const framing = targetDay.iso === today ? "Tonight" : formatWeekday(targetDay.iso);
  const count = targetDay.acts.length;
  const word = count === 1 ? "act" : "acts";

  const title = `${framing}: ${count} live ${word} across Port Aransas`;

  const headlinerStrs = top3.map((a) => {
    const venueName = VENUES[a.venue]?.name ?? a.venue;
    return `${a.artist} at ${venueName}`;
  });
  const remaining = count - top3.length;
  const description =
    remaining > 0
      ? `${headlinerStrs.join(", ")}. Plus ${remaining} more across the island.`
      : `${headlinerStrs.join(", ")}.`;

  const subtitleArtists = topActs.map((a) => a.artist).join(" · ");
  const ogSubtitle =
    sortedActs.length > 4
      ? `${subtitleArtists} + ${sortedActs.length - 4} more`
      : subtitleArtists;

  return {
    framing,
    iso: targetDay.iso,
    count,
    topActs,
    title,
    description,
    ogSubtitle,
  };
}
