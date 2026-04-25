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
  /**
   * Historical photo references — points at IDs in src/data/archives.ts.
   * Avoids duplicating photo data; lets the shelf component look up the
   * full ArchivePhoto record at render time. Optional caption/year overrides
   * let us re-frame an existing archive photo for tournament context.
   */
  historicalPhotos?: {
    archiveId: string;
    caption?: string;
    year?: string;
  }[];
  /**
   * Milestones & records — what makes this tournament defensibly historic.
   * Verified-fact-only; speculative records belong in the crowd-source
   * pipeline, not here.
   */
  milestones?: {
    year?: string;
    label: string;
    value: string;
    detail?: string;
  }[];
  /** Source citations — official board + supporting */
  sources: { label: string; url?: string }[];
}

export const tournamentResults: Record<string, TournamentResults> = {
  "texas-legends-billfish-2026": {
    eventSlug: "texas-legends-billfish-2026",
    edition: "2026 edition",
    sanctioningOrg: "Texas Legends Billfish Tournament",
    sanctioningOrgNote:
      "Independent tournament headquartered at Fisherman's Wharf, Port Aransas. Co-directed by Dee Wallace (Texas Saltwater Fishing Hall of Fame). One of three legs of the Texas Triple Crown Billfish Series alongside Lone Star Shootout (Port O'Connor) and TIFT (South Padre Island).",
    divisions: [
      {
        slug: "blue-marlin",
        name: "Blue Marlin (Weighed or Released)",
        short:
          "The marquee species. Can be weighed at the dock OR released and verified by video.",
        rules:
          "Blue marlin caught and released score points; blue marlin brought to the scale also score and qualify for the optional blue marlin pools. Released fish require frame-by-frame video verification per the Wallace protocol — angler in frame, leader visible, hook position confirmed.",
        scoring: "release",
      },
      {
        slug: "white-marlin",
        name: "White Marlin (Release Only)",
        short: "Catch-and-release only. Points by count.",
        rules:
          "Release-only. Video verification required. Each verified white marlin release scores per the official points matrix.",
        scoring: "release",
      },
      {
        slug: "sailfish",
        name: "Sailfish (Release Only)",
        short: "Catch-and-release only. Points by count.",
        rules:
          "Release-only. Video verification required. Each verified sailfish release scores per the official points matrix.",
        scoring: "release",
      },
    ],
    specialAwards: [
      {
        name: "Top Boat (Overall Points)",
        description:
          "Highest total points across blue marlin (weighed or released), white marlin (release), and sailfish (release). The marquee trophy.",
        eligibility: "All registered boats.",
      },
      {
        name: "Top Angler",
        description:
          "Highest individual angler points across the field.",
        eligibility: "All registered anglers.",
      },
      {
        name: "Triple Crown Points",
        description:
          "Cumulative points from Texas Legends + Lone Star Shootout (Port O'Connor) + TIFT (South Padre Island) crown the Grand Champion of the Texas Gulf Coast at the end of the season.",
        eligibility: "Boats fishing all three Triple Crown legs.",
      },
      {
        name: "Mandatory + Optional Pools",
        description:
          "Mandatory billfish pool ($1,000). Optional billfish pools ($2K / $4K / $6K) and optional blue marlin pools ($2K / $4K / $6K) stack on top — anglers pick their exposure level. The bigger the pool, the bigger the check.",
        eligibility: "Per-pool opt-in.",
      },
    ],
    leaderboards: {
      "blue-marlin": {
        divisionSlug: "blue-marlin",
        entries: [],
        status: "Lines-in is Thursday, Aug 6 at first light",
      },
      "white-marlin": {
        divisionSlug: "white-marlin",
        entries: [],
        status: "Lines-in is Thursday, Aug 6 at first light",
      },
      sailfish: {
        divisionSlug: "sailfish",
        entries: [],
        status: "Lines-in is Thursday, Aug 6 at first light",
      },
    },
    captains: [],
    rules: {
      edition: "2026 edition",
      officialUrl: "https://www.txlegends.com/",
      universal: [
        "All boats may depart from any Texas port; all weigh-ins and releases must be verified at Fisherman's Wharf, Port Aransas.",
        "Fish must be caught on IGFA conventional rod, reel, and leader, and boated by hand or gaff.",
        "All billfish releases must be verified by video device — no exceptions. The 'Wallace protocol' (frame-by-frame angler / leader / hook verification) is the standard.",
        "No frozen fish accepted at the scale.",
        "Mandatory billfish pool ($1,000) is required for all entries; optional billfish + blue marlin pools at $2K / $4K / $6K stack on top per angler/boat election.",
        "Live leaderboards run through the official Texas Legends Billfish app (Reel Time Apps).",
        "Triple Crown points are awarded automatically based on Texas Legends finish and roll into the Series total.",
      ],
      divisionNotes: {
        "blue-marlin": [
          "Blue marlin can be weighed OR released. Weighed fish qualify for blue marlin pools and score per weight matrix.",
          "Released blue marlin score per the points matrix and require video verification.",
        ],
        "white-marlin": [
          "Release only. Each verified release scores per the points matrix.",
        ],
        sailfish: [
          "Release only. Each verified release scores per the points matrix.",
        ],
      },
    },
    pastChampions: [
      // 2024
      {
        year: 2024,
        edition: "Aug 7–11, 2024",
        division: "Overall",
        category: "Top Boat",
        angler: "Crew of Freebird (Owner: David Blackbird)",
        boat: "Freebird",
        notes:
          "3,000 points overall. Crew released 4 blue marlin, 2 white marlin, and 7 sailfish across the tournament. Dominant performance.",
        sourceUrl:
          "https://www.reeltimeapps.com/live/tournaments/2024-texas-legends-billfish",
      },
      {
        year: 2024,
        edition: "Aug 7–11, 2024",
        division: "Overall",
        category: "4th Place",
        angler: "Crew of Sigsbee Deep (Owner / Captain: Terrell Miller)",
        boat: "Sigsbee Deep",
        notes:
          "Released 7 sailfish in the 2024 Texas Legends. Same crew was overall champ at the Pachanga that year (1,700 pts).",
        sourceUrl:
          "https://www.portasouthjetty.com/articles/sigsbee-deep-wins-texas-legends/",
      },
    ],
    milestones: [
      {
        year: "2020",
        label: "Texas Triple Crown formed",
        value: "3 tournaments",
        detail:
          "Texas Legends + Lone Star Shootout (Port O'Connor) + TIFT (South Padre) banded together to crown a Grand Champion of the Texas Gulf Coast.",
      },
      {
        year: "Recent",
        label: "Prize purse",
        value: "$800,000+",
        detail:
          "Total prize money across the mandatory and optional pools. Among the largest single-tournament purses on the Texas coast.",
      },
      {
        year: "Standard",
        label: "Wallace release protocol",
        value: "Industry standard",
        detail:
          "Dee Wallace's frame-by-frame billfish release verification is now used by most Texas (and Gulf-wide) tournaments. Originated in his 21 years with the Deep Sea Roundup.",
      },
      {
        year: "Today",
        label: "HQ at Fisherman's Wharf",
        value: "Port Aransas",
        detail:
          "Boats can depart from any Texas port — every catch returns to Fisherman's Wharf in Port A for video verification or the scale.",
      },
    ],
    sources: [
      {
        label: "Texas Legends Billfish — official site",
        url: "https://www.txlegends.com/",
      },
      {
        label: "Reel Time Apps — TXL 2024 + 2025 leaderboards",
        url: "https://www.reeltimeapps.com/live/tournaments/2025-texas-legends-billfish",
      },
      {
        label: "Dee Wallace — Texas Saltwater Fishing Hall of Fame",
        url: "https://txswfhof.com/dee-wallace/",
      },
      {
        label:
          "Port Aransas Museum (PAPHA) — Capt. Dee Wallace on fishing + sportfishing",
        url: "https://portaransasmuseum.org/capt-dee-wallace-fishing-sportfishing/",
      },
      {
        label: "Fisherman's Wharf — TXL tournament HQ",
        url: "https://www.fishermanswharfporta.com/tournaments/texas-legends-billfish-tournament/",
      },
    ],
  },

  "texas-women-anglers-tournament-2026": {
    eventSlug: "texas-women-anglers-tournament-2026",
    edition: "2026 (40+ years on)",
    sanctioningOrg: "Texas Women Anglers Tournament (family-run)",
    sanctioningOrgNote:
      "Founded in the 1980s as a women-only fishing tournament benefiting the Women's Shelter of South Texas (now The Purple Door). Family-run since day one. Proceeds-after-prizes go to the shelter.",
    divisions: [
      {
        slug: "billfish",
        name: "Billfish (Release)",
        short:
          "Blue marlin, white marlin, sailfish — release-only, points-based.",
        rules:
          "Release-only. Points awarded per species per official scoring matrix. Video verification with the day's designated object visible. Billfish points feed directly into the overall trophy calculation.",
        scoring: "release",
      },
      {
        slug: "dolphin",
        name: "Dolphin (Mahi-Mahi)",
        short: "Brought to the scale. Heaviest dolphin scores.",
        rules:
          "Weight-based. 1 point per pound contributes to the overall trophy. Single biggest fish per boat in division.",
        scoring: "weight",
      },
      {
        slug: "tuna",
        name: "Tuna",
        short: "Brought to the scale. Heaviest tuna scores.",
        rules:
          "Weight-based. 1 point per pound contributes to the overall trophy. Single biggest fish per boat in division.",
        scoring: "weight",
      },
      {
        slug: "wahoo",
        name: "Wahoo",
        short: "Brought to the scale. Heaviest wahoo scores.",
        rules:
          "Weight-based. 1 point per pound contributes to the overall trophy. Single biggest fish per boat in division.",
        scoring: "weight",
      },
    ],
    specialAwards: [
      {
        name: "M.L. Walker Perpetual Trophy (Overall Top Boat)",
        description:
          "The marquee trophy. Awarded to the boat with the most total points across all divisions (billfish points + 1 point per pound for dolphin, tuna, and wahoo). Engraved with every winning boat going back decades — the perpetual trophy is the through-line.",
        eligibility: "All registered boats.",
      },
      {
        name: "Top Woman Angler",
        description:
          "Highest individual angler across the field — the lineage carried since 1989.",
        eligibility: "All registered anglers.",
      },
      {
        name: "Cash Pots",
        description:
          "Optional side bets paid in Friday night and called Saturday after the weigh-in. Multiple pot categories.",
        eligibility: "Opt-in per category.",
      },
      {
        name: "Best-Decorated Boat / Theme / Costumes",
        description:
          "Three separate awards for the spectacle side of the weigh-in. Voted on by judges at the wharf.",
        eligibility: "Every boat in the field is eligible.",
      },
    ],
    leaderboards: {
      billfish: {
        divisionSlug: "billfish",
        entries: [],
        status: "Releases logged Saturday — points feed the overall trophy",
      },
      dolphin: {
        divisionSlug: "dolphin",
        entries: [],
        status: "Weigh-in opens Saturday, August 22 at 5 PM",
      },
      tuna: {
        divisionSlug: "tuna",
        entries: [],
        status: "Weigh-in opens Saturday, August 22 at 5 PM",
      },
      wahoo: {
        divisionSlug: "wahoo",
        entries: [],
        status: "Weigh-in opens Saturday, August 22 at 5 PM",
      },
    },
    captains: [],
    rules: {
      edition: "2026 (forthcoming — confirming via official site)",
      officialUrl: "https://texaswomenanglers.org/rules-regulations",
      universal: [
        "All registered anglers must be women. Captains can be any gender.",
        "Anyone may set the hook, then hand the rod to a woman angler — she reels the fish in entirely on her own with no further assistance to the rod or reel.",
        "All fish must be caught on rod and reel with hooks only.",
        "Boats depart Friday at 8 PM; lines in the water Saturday at 6:30 AM.",
        "Weigh-in opens Saturday at 5 PM at Fisherman's Wharf; all boats must be inside the Port A little jetties by 7:30 PM.",
        "Billfish (Blue Marlin, White Marlin, Sailfish) are catch-and-release ONLY.",
        "Video verification required for every fish — the day's designated object (revealed at Friday registration) must be visible in the frame.",
        "Overall trophy = points from billfish + 1 point per pound for dolphin, tuna, and wahoo.",
        "Cash pots are opt-in and paid out per category Saturday evening.",
        "Live leaderboards run through the official Texas Women Angler Tournament app (Reel Time Apps).",
      ],
      divisionNotes: {
        billfish: [
          "Release-only. Points awarded per species per the official scoring matrix.",
          "Video required with the day's designated object visible.",
          "Billfish points feed directly into the overall trophy calculation — the ceiling on what a boat can score.",
        ],
        dolphin: [
          "Weight-based. 1 point per pound contributes to overall.",
          "Single biggest fish per boat scores in this category.",
        ],
        tuna: [
          "Weight-based. 1 point per pound contributes to overall.",
          "Single biggest fish per boat scores in this category.",
        ],
        wahoo: [
          "Weight-based. 1 point per pound contributes to overall.",
          "Single biggest fish per boat scores in this category.",
        ],
      },
    },
    pastChampions: [
      // 2025
      {
        year: 2025,
        edition: "2025 edition",
        division: "Overall",
        category: "Top Boat (M.L. Walker Perpetual Trophy)",
        angler: "Crew of Sea Senora",
        boat: "Sea Senora",
        notes:
          "$128,527 share of the 2025 prize pool; one of 14 money-winning teams that split $403,809 across all categories.",
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
      // 2024
      {
        year: 2024,
        edition: "Aug 23–25, 2024",
        division: "Overall",
        category: "Top Boat (M.L. Walker Perpetual Trophy)",
        angler: "Crew of Instigator",
        boat: "Instigator",
        notes:
          "840.9 total points. Caught and released the 1st-place white marlin and the 2nd-place blue marlin.",
        sourceUrl:
          "https://www.portasouthjetty.com/articles/instigator-first-place-at-women-anglers-tourney/",
      },
      {
        year: 2024,
        edition: "Aug 23–25, 2024",
        division: "Spectacle",
        category: "Best Decorated Boat",
        angler: "Crew of Ambush",
        boat: "Ambush",
        notes:
          'Theme: "Texas Women Anglers Tournament — A Performance." The judges agreed.',
      },
      {
        year: 2024,
        edition: "Aug 23–25, 2024",
        division: "Special",
        category: "TWAT Legacy Award",
        angler: "Penny Slingerland",
        notes:
          "Recognition for years of contribution to the tournament. Awarded at the Sunday ceremony.",
      },
      // 2020 — ran through COVID
      {
        year: 2020,
        edition: "Aug 21–23, 2020 (ran through COVID)",
        division: "Overall",
        category: "Top Boat (M.L. Walker Perpetual Trophy)",
        angler: "Crew of Rebecca — Jae White, Rebecca Ramming, Cole Scott, Megan Keller",
        boat: "Rebecca",
        notes:
          "654.6 total points. Released 5 white marlin and 1 sailfish; weighed 1 dorado. Field: 44 boats released 50 billfish across the weekend; the year's cash pots paid out $388,800 to winners.",
        sourceUrl:
          "https://www.portasouthjetty.com/articles/rebecca-takes-title-in-texas-women-anglers/",
      },
      {
        year: 2020,
        edition: "Aug 21–23, 2020",
        division: "Spectacle",
        category: "Best Decorated Boat (1st)",
        angler: "Crew of Suthern's Pride",
        boat: "Suthern's Pride",
        notes:
          "Walk West took 2nd; the Rebecca (overall winner) took 3rd in best-decorated.",
      },
      // 1989 — founding scale
      {
        year: 1989,
        division: "Founding scale",
        category: "Documented field size",
        angler: "18 boats · 50+ women anglers",
        notes:
          "First documented year-by-year scale of the tournament. The format proves out — and becomes a fixture of August.",
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
    historicalPhotos: [
      {
        archiveId: "fishing-grounds-tarpon-1900",
        caption:
          "The town of Tarpon (later renamed Port Aransas) at the height of the Tarpon Era. Steam-driven launches towed strings of rowboats out to the fishing grounds — the format the Boatmen Association would professionalize into the 1932 Tarpon Rodeo.",
        year: "c. 1900",
      },
      {
        archiveId: "ayres-fishing-1910",
        caption:
          "Robert M. Ayres lands a fish from a rowboat near Port Aransas. This is what \"sport fishing\" looked like before the Roundup standardized the divisions and the dock weigh-in.",
        year: "c. 1910",
      },
      {
        archiveId: "tarpon-inn-historic-1911",
        caption:
          "The Tarpon Inn — Port Aransas's social hub since 1886. The dining room and front porch have hosted every Roundup-era angler from FDR forward. 7,000+ signed tarpon scales line the lobby walls.",
        year: "1911–1924",
      },
      {
        archiveId: "fish-house-1939",
        caption:
          "A working Port Aransas fish house, photographed by Russell Lee for the Farm Security Administration. Seven years into the Tarpon Rodeo / Deep Sea Roundup era — the working waterfront that fed the tournament.",
        year: "1939",
      },
      {
        archiveId: "tarpon-inn-modern-2007",
        caption:
          "The Tarpon Inn in modern form — National Register of Historic Places. FDR's signed tarpon scale is still in the lobby, two doors down from the docks where the modern Roundup boats berth.",
        year: "2007",
      },
    ],
    milestones: [
      {
        year: "1932",
        label: "Inaugural Tarpon Rodeo",
        value: "Year One",
        detail:
          "25 charter and commercial captains form the Boatmen Association. Three-day shotgun start. North Millican wins the first perpetual trophy.",
      },
      {
        year: "1934",
        label: "First woman champion",
        value: "Dorothy Fair",
        detail:
          "Two years into the tournament. The lineage that becomes the modern Top Woman Angler award.",
      },
      {
        year: "1942–1945",
        label: "WWII pause",
        value: "1 of 2 ever",
        detail:
          "Charter captains were doing other work. Only break in the entire run that wasn't a global pandemic.",
      },
      {
        year: "2020",
        label: "COVID pause",
        value: "2 of 2 ever",
        detail: "Second and only other interruption in 90 years.",
      },
      {
        year: "2026",
        label: "Editions to date",
        value: "90 annual",
        detail:
          "Texas's oldest fishing tournament — every documented year except the war and the pandemic.",
      },
      {
        year: "Always",
        label: "Sanctioning org",
        value: "Boatmen Inc.",
        detail:
          "Same Boatmen Association that started it in 1932, continuously running scholarship + community programs alongside the tournament.",
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
