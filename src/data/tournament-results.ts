/**
 * Port A Local — Tournament Results
 *
 * Per-tournament structured data: divisions, leaderboards, captain
 * spotlights, special-award contenders. Mirrors the dispatches /
 * events / event-content data layer. New tournaments add one
 * `TournamentResults` entry keyed by event slug.
 *
 * Sources: official tournament boards (cited per entry). We cite
 * the official board as the source of truth and flag any pre-official
 * entry as "unofficial — pending official posting."
 */

export type ScoringMode = "weight" | "length" | "count" | "release";

export interface Division {
  slug: string;
  name: string;
  /** One-line description for cards / index */
  short: string;
  /** Long-form rules and scoring detail */
  rules: string;
  /** weight | length | count (release count) | release (release-only divisions) */
  scoring: ScoringMode;
  /** Adult / Junior / Special category breakdown */
  categories?: string[];
  /** Optional prize / purse note */
  prize?: string;
}

export interface LeaderboardEntry {
  rank: number;
  angler: string;
  /** Boat name */
  boat?: string;
  /** Home port (city, ST) */
  homePort?: string;
  /** Species — for divisions where multiple species are eligible */
  species?: string;
  /** Display-formatted weight, e.g. "84.6 lbs" */
  weight?: string;
  /** Display-formatted length for release divisions, e.g. "82 in" */
  length?: string;
  /** Catch / release count for release divisions */
  count?: number;
  /** ISO timestamp of catch or weigh-in */
  caughtAt?: string;
  /** Marks Junior anglers — gets a badge */
  isJunior?: boolean;
  /** Marks Top Woman Angler contenders — gets a badge */
  isWoman?: boolean;
  /** Free-text note (e.g. "Released alive") */
  notes?: string;
}

export interface DivisionLeaderboard {
  divisionSlug: string;
  /** ISO of last update */
  updatedAt?: string;
  /** Free-text status, e.g. "Day 1 weigh-in complete" */
  status?: string;
  /** Marks the leaderboard as unofficial pending official posting */
  unofficial?: boolean;
  entries: LeaderboardEntry[];
}

export interface CaptainSpotlight {
  /** Captain's full name */
  name: string;
  /** Boat name and class */
  boat: string;
  /** Boat hull length / horsepower / type if known */
  boatDetail?: string;
  /** Home port */
  homePort?: string;
  /** Divisions entered this year */
  divisions: string[];
  /** Bio / story — 2–4 short paragraphs */
  bio: string[];
  /** Notable prior wins */
  priorWins?: string[];
  /** Optional photo path under /public/tournament/<eventSlug>/captains/ */
  photo?: string;
  /** Optional "what they're known for" tag */
  watchFor?: string;
}

export interface PiggyPerchAward {
  category: "most-fish" | "smallest-fish" | "largest-fish" | "best-sportsmanship";
  label: string;
  winner?: string;
  age?: string;
  detail?: string;
}

export interface TournamentResults {
  /** Matches the events.ts slug */
  eventSlug: string;
  /** Display-formatted edition, e.g. "90th Annual" */
  edition: string;
  /** Sponsoring / governing org */
  sanctioningOrg: string;
  /** Optional one-line about the org */
  sanctioningOrgNote?: string;
  /** All divisions — rendered in order */
  divisions: Division[];
  /** Leaderboards keyed by division slug. Empty until day-of. */
  leaderboards: Record<string, DivisionLeaderboard>;
  /** Special awards (Top Woman Angler, etc.) */
  specialAwards?: {
    name: string;
    description: string;
    eligibility: string;
    currentLeader?: LeaderboardEntry;
  }[];
  /** Captain spotlights — pre-event "boats to watch" */
  captains: CaptainSpotlight[];
  /** Piggy Perch (kids' contest) */
  piggyPerch?: {
    location: string;
    startTime: string;
    note: string;
    awards: PiggyPerchAward[];
  };
  /** Source citations — official board + supporting */
  sources: { label: string; url?: string }[];
}

export const tournamentResults: Record<string, TournamentResults> = {
  "deep-sea-roundup-2026": {
    eventSlug: "deep-sea-roundup-2026",
    edition: "90th Annual",
    sanctioningOrg: "Port Aransas Boatmen, Inc.",
    sanctioningOrgNote:
      "Founded in 1932 as a charter-and-commercial captains' association. Stages the Roundup every July; runs scholarship + community programs year-round.",
    divisions: [
      {
        slug: "bay-surf",
        name: "Bay-Surf",
        short:
          "Inshore — bay, jetty, and surf species. The most-entered division.",
        rules:
          "Eligible inshore species (redfish, trout, flounder, others per official rules). Single biggest fish per angler scores. Junior anglers compete in their own bracket within the same waters.",
        scoring: "weight",
        categories: ["Adult", "Junior"],
      },
      {
        slug: "offshore",
        name: "Offshore",
        short:
          "Beyond the jetties — kingfish, snapper, ling, and the deep-water lineup.",
        rules:
          "Eligible offshore species per official rules. Single biggest fish per angler scores. Junior anglers compete in their own bracket. Most boats fish out of Port Aransas Marina or Fisherman's Wharf.",
        scoring: "weight",
        categories: ["Adult", "Junior"],
      },
      {
        slug: "flyfishing",
        name: "Flyfishing",
        short: "Fly rod only — bay or surf. The purist's division.",
        rules:
          "Fly tackle exclusively. Species per official rules. Single biggest fish scores; some years feature a length-only release category.",
        scoring: "weight",
      },
      {
        slug: "kayak",
        name: "Kayaking",
        short:
          "Human-powered only — paddle craft fishing the bays and shallow surf.",
        rules:
          "Kayak / paddle craft only — no motor assistance. Single biggest fish per angler scores. Often the most photogenic division at weigh-in.",
        scoring: "weight",
      },
      {
        slug: "tarpon-release",
        name: "Tarpon Release",
        short:
          "Release-only — the Roundup's connection to its 1932 Tarpon Rodeo origin.",
        rules:
          "Catch-and-release only. Length is recorded; fish swims away. Honors the original 1932 Tarpon Rodeo scoring tradition adapted for modern conservation.",
        scoring: "length",
      },
      {
        slug: "billfish-release",
        name: "Billfish Release",
        short:
          "Blue marlin, white marlin, sailfish — release-only, scored by count.",
        rules:
          "Release-only, count-based scoring. Weighted by species (blue marlin > white marlin > sailfish per official scoring matrix). Boats fishing offshore for legitimate billfish travel hours to find fishable water.",
        scoring: "release",
      },
    ],
    specialAwards: [
      {
        name: "Top Woman Angler",
        description:
          "Recognizes the woman with the highest-scoring fish across all divisions.",
        eligibility: "Eligible across all divisions. Awarded Sunday at the Civic Center.",
      },
      {
        name: "Junior Champion (per division)",
        description:
          "Bay-Surf and Offshore divisions each have a Junior bracket awarded separately.",
        eligibility: "Junior anglers per official rules age limit.",
      },
    ],
    leaderboards: {
      "bay-surf": { divisionSlug: "bay-surf", entries: [], status: "Weigh-ins begin Friday, July 10" },
      offshore: { divisionSlug: "offshore", entries: [], status: "Weigh-ins begin Friday, July 10" },
      flyfishing: { divisionSlug: "flyfishing", entries: [], status: "Weigh-ins begin Friday, July 10" },
      kayak: { divisionSlug: "kayak", entries: [], status: "Weigh-ins begin Friday, July 10" },
      "tarpon-release": { divisionSlug: "tarpon-release", entries: [], status: "Releases begin Friday, July 10" },
      "billfish-release": { divisionSlug: "billfish-release", entries: [], status: "Releases begin Friday, July 10" },
    },
    captains: [],
    piggyPerch: {
      location: "Roberts Point Park (announced day-of)",
      startTime: "Saturday morning, July 11",
      note: "Bait and tackle provided. Open to kids. Awards: Most Fish, Smallest Fish, Largest Fish, and Best Sportsmanship — the only fishing contest where the smallest fish is a trophy.",
      awards: [
        { category: "most-fish", label: "Most Fish" },
        { category: "smallest-fish", label: "Smallest Fish" },
        { category: "largest-fish", label: "Largest Fish" },
        { category: "best-sportsmanship", label: "Best Sportsmanship" },
      ],
    },
    sources: [
      {
        label: "Deep Sea Roundup — official site",
        url: "https://deepsearoundup.org",
      },
      {
        label: "Deep Sea Roundup — Port Aransas South Jetty edition",
        url: "https://roundup.portasouthjetty.com",
      },
      {
        label: "Port Aransas Boatmen, Inc. — sanctioning org",
        url: "https://paboatmen.org/",
      },
      {
        label:
          "Port Aransas CVB — Texas's Oldest Fishing Tournament",
        url: "https://www.portaransas.org/blog/stories/post/deep-sea-roundup/",
      },
      {
        label:
          "PAL Heritage — Texas's Oldest Fishing Tournament (1932 → today)",
        url: "https://theportalocal.com/history/deep-sea-roundup",
      },
    ],
  },
};

export function getTournamentResults(
  eventSlug: string,
): TournamentResults | undefined {
  return tournamentResults[eventSlug];
}
