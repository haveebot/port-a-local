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

export interface PastChampion {
  /** Tournament year */
  year: number;
  /** Edition label, e.g. "88th Annual" — optional */
  edition?: string;
  /** Division slug or human label */
  division: string;
  /** Optional category — e.g. "Junior", "Top Woman Angler", "Grand Champion" */
  category?: string;
  /** Champion's name */
  angler: string;
  /** Optional boat name */
  boat?: string;
  /** Optional home port */
  homePort?: string;
  /** Species + winning fish detail */
  species?: string;
  /** Display-formatted weight */
  weight?: string;
  /** Display-formatted length for release-division winners */
  length?: string;
  /** Free-text note (e.g. "Stringer included 1st-place flounder and redfish") */
  notes?: string;
  /** Source URL for verification */
  sourceUrl?: string;
}

export interface TournamentRules {
  /** Display label for the most recent rules edition shown */
  edition: string;
  /** Last-updated date for the rules being summarized */
  updatedAt?: string;
  /** External URL to the official rules — primary CTA */
  officialUrl: string;
  /** Optional direct PDF link if the org publishes one */
  officialPdfUrl?: string;
  /** Universal rules across all divisions — short bullets */
  universal: string[];
  /** Per-division rule snippets keyed by division slug */
  divisionNotes?: Record<string, string[]>;
  /** Optional historical rules archive — past editions */
  archive?: { year: number; label: string; url?: string }[];
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
  /** Tournament rules — official link + editorial summary */
  rules?: TournamentRules;
  /** Past champions archive — newest first. Crowd-sourced expansion expected. */
  pastChampions?: PastChampion[];
  /** Source citations — official board + supporting */
  sources: { label: string; url?: string }[];
}

export const tournamentResults: Record<string, TournamentResults> = {
  "texas-women-anglers-tournament-2026": {
    eventSlug: "texas-women-anglers-tournament-2026",
    edition: "2026 (40+ years on)",
    sanctioningOrg: "Texas Women Anglers Tournament (family-run)",
    sanctioningOrgNote:
      "Founded in the 1980s as a women-only fishing tournament benefiting the Women's Shelter of South Texas (now The Purple Door). Family-run since day one. Proceeds-after-prizes go to the shelter.",
    divisions: [
      {
        slug: "bay",
        name: "Bay Division",
        short: "Inshore — bays, jetties, surf. Trout, redfish, flounder, drum.",
        rules:
          "Eligible inshore species per official rules. Single biggest fish per angler scores. The bay fleet typically posts the most-watched leaderboard at the weigh-in.",
        scoring: "weight",
      },
      {
        slug: "offshore",
        name: "Offshore Division",
        short: "Beyond the jetties — kingfish, snapper, ling, dorado.",
        rules:
          "Eligible offshore species per official rules. Single biggest fish per angler scores. Offshore boats fish further from harbor; long day for the team.",
        scoring: "weight",
      },
      {
        slug: "release",
        name: "Release Division (billfish + tarpon)",
        short:
          "Catch-and-release for billfish (blue marlin, white marlin, sailfish) and tarpon.",
        rules:
          "Release-only with photo verification per official protocol. Honors the conservation commitment built into the modern tournament format.",
        scoring: "release",
      },
    ],
    specialAwards: [
      {
        name: "Top Boat",
        description: "Highest-scoring boat across the field.",
        eligibility: "Awarded Sunday at the awards ceremony.",
      },
      {
        name: "Top Woman Angler",
        description:
          "Highest individual angler — the lineage carried since 1989.",
        eligibility: "All registered anglers.",
      },
      {
        name: "Cash Pots",
        description:
          "Optional side bets paid into Friday night and called Saturday after the weigh-in.",
        eligibility: "Opt-in per category.",
      },
    ],
    leaderboards: {
      bay: {
        divisionSlug: "bay",
        entries: [],
        status: "Weigh-in opens Saturday, August 22 at 5 PM",
      },
      offshore: {
        divisionSlug: "offshore",
        entries: [],
        status: "Weigh-in opens Saturday, August 22 at 5 PM",
      },
      release: {
        divisionSlug: "release",
        entries: [],
        status: "Releases logged through the weekend",
      },
    },
    captains: [],
    rules: {
      edition: "2026 (forthcoming — confirming via official site)",
      officialUrl: "https://texaswomenanglers.org/",
      universal: [
        "All registered anglers must be women.",
        "Boats depart Friday at 8 PM; lines in the water Saturday at 6:30 AM.",
        "Weigh-in opens Saturday at 5 PM at Fisherman's Wharf.",
        "Billfish (Blue Marlin, White Marlin, Sailfish) and Tarpon are catch-and-release ONLY.",
        "Cash pots are opt-in and paid out per category Saturday evening.",
        "Captains can be any gender — all anglers must be women.",
        "Live leaderboards run through the official Texas Women Angler Tournament app (Reel Time Apps).",
      ],
      divisionNotes: {
        bay: [
          "Inshore species per official rules — trout, redfish, flounder, drum, others.",
          "Single biggest fish per angler scores per species.",
        ],
        offshore: [
          "Offshore species per official rules — kingfish, snapper, ling, dorado, others.",
          "Long day on the water; many teams pre-stage Friday night.",
        ],
        release: [
          "Photo + verification required per official release protocol.",
          "All billfish and all tarpon are release-only across every division.",
        ],
      },
    },
    pastChampions: [
      {
        year: 2025,
        edition: "2025 edition",
        division: "Overall",
        category: "Top Boat",
        angler: "Crew of Sea Senora",
        boat: "Sea Senora",
        notes:
          "Top boat overall. $128,527 share of the 2025 prize pool; one of 14 money-winning teams that split $403,809 across all categories.",
        sourceUrl:
          "https://www.reeltimeapps.com/live/tournaments/2025-texas-women-angler-tournament/payouts",
      },
      {
        year: 2025,
        edition: "2025 edition",
        division: "Overall",
        category: "Top Woman Angler",
        angler: "Jordan Soechting",
        notes:
          "Highest individual scoring angler in the 2025 field.",
        sourceUrl:
          "https://www.reeltimeapps.com/live/tournaments/2025-texas-women-angler-tournament/leaderboards",
      },
      {
        year: 1989,
        division: "Founding scale",
        category: "Documented field size",
        angler: "18 boats · 50+ women anglers",
        notes:
          "First documented year-by-year scale of the tournament. Today's field: ~40 boats and 300+ anglers — a roughly 6× growth in participation.",
      },
    ],
    sources: [
      {
        label: "TWAT — official site",
        url: "https://texaswomenanglers.org/",
      },
      {
        label: "Reel Time Apps — TWAT live leaderboards (2025)",
        url: "https://www.reeltimeapps.com/live/tournaments/2025-texas-women-angler-tournament/leaderboards",
      },
      {
        label: "The Purple Door — beneficiary",
        url: "https://purpledoortx.org/",
      },
      {
        label: "Port Aransas CVB — TWAT listing",
        url: "https://www.portaransas.org/blog/stories/post/texas-women-anglers-tournament/",
      },
    ],
  },

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
    rules: {
      edition: "2026 (90th Annual)",
      officialUrl: "https://deepsearoundup.org/tournament-rules/",
      universal: [
        "Boats may not depart before 4:00 AM on any day of fishing.",
        "Fishing begins at 7:00 AM official tournament time.",
        "All catches must be at the weigh station by 7:00 PM the same day they were caught to score.",
        "All anglers must register through deepsearoundup.org and read the full rule set before fishing.",
        "Billfish (Blue Marlin, White Marlin, Sailfish) and Tarpon are catch-and-release ONLY in every division.",
        "Trophies are awarded for 1st and 2nd place by weight per eligible species in each division.",
        "Junior anglers compete in their own bracket within Bay-Surf and Offshore — same waters, separate awards.",
        "Top Woman Angler is awarded across all divisions.",
      ],
      divisionNotes: {
        "bay-surf": [
          "Inshore species per official rules — redfish, trout, flounder, others.",
          "Single biggest fish per angler per species scores.",
          "Junior bracket runs in parallel.",
        ],
        offshore: [
          "Offshore species per official rules.",
          "Departure rule applies — first hooks aren't until 7 AM.",
          "Junior bracket runs in parallel.",
        ],
        flyfishing: [
          "Fly tackle exclusively — fly rod, fly reel, fly line, fly leader.",
          "Eligible species per official rules; sometimes a length-only release category.",
        ],
        kayak: [
          "Kayak / paddle craft only — no motor assistance, including pedal drives where prohibited.",
          "Standard species rules per the kayak division specification.",
        ],
        "tarpon-release": [
          "Catch-and-release only.",
          "Length is recorded; fish swims away.",
          "Honors the 1932 Tarpon Rodeo origin format.",
        ],
        "billfish-release": [
          "Release-only with weighted scoring per species.",
          "Boats fish offshore at their own risk and timing.",
          "Photo + verification required per official protocol.",
        ],
      },
      archive: [
        {
          year: 2024,
          label: "2024 (88th edition) — coverage via PA South Jetty",
          url: "https://roundup.portasouthjetty.com/edition/2025-07-10/",
        },
      ],
    },
    pastChampions: [
      // 2024 (88th Annual)
      {
        year: 2024,
        edition: "88th Annual",
        division: "Bay-Surf",
        category: "Grand Champion",
        angler: "Adair Bates",
        homePort: "Corpus Christi, TX",
        notes:
          "Stringer included the 1st-place flounder and redfish — wrapped both species on the same day.",
        sourceUrl: "https://www.portasouthjetty.com/articles/bates-and-clay-win-roundup/",
      },
      {
        year: 2024,
        edition: "88th Annual",
        division: "Offshore",
        category: "Junior Grand Champion",
        angler: "Charley Hicks",
        homePort: "Ponder, TX",
        notes:
          "1st-place wahoo, 1st-place blue marlin (release), 2nd-place white marlin and sailfish — multi-species sweep.",
        sourceUrl: "https://www.portasouthjetty.com/articles/bates-and-clay-win-roundup/",
      },
      {
        year: 2024,
        edition: "88th Annual",
        division: "Offshore",
        category: "1st Place Red Snapper",
        angler: "Hannah Barnwell",
        homePort: "Port Aransas, TX",
        species: "Red Snapper",
        sourceUrl: "https://portabucketlist.com/class/deep-sea-round-up/",
      },
      // Foundational champions — keepers
      {
        year: 1934,
        division: "Tarpon Rodeo",
        category: "First Woman Champion",
        angler: "Dorothy Fair",
        notes:
          "First woman to win a Roundup category. Her championship is the lineage for the modern Top Woman Angler award.",
      },
      {
        year: 1932,
        division: "Tarpon Rodeo",
        category: "Inaugural Champion",
        angler: "North Millican",
        species: "Tarpon",
        notes:
          "Won the perpetual trophy at the inaugural 1932 Tarpon Rodeo. Locals still credit his wife Totsy as the angler who actually landed the fish.",
      },
    ],
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
