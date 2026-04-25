/**
 * Port A Local — Tournament Season
 *
 * The local handle for Port Aransas's summer fishing-tournament cluster.
 * Lives at /events/tournament-season as a comparison + history hub.
 *
 * Structure: each entry is a season member. Some have full hub pages
 * on /events/[slug] (DSR, TWAT). Others are stubs — when their full
 * hubs are built, this file's `detailHref` pointer is the only thing
 * that needs updating.
 */

export interface SeasonMember {
  /** Display name */
  name: string;
  /** Acronym or short alias */
  alias?: string;
  /** Live detail-page href if one exists; null until built */
  detailHref: string | null;
  /** Tournament icon */
  icon: string;
  /** One-line positioning headline */
  positioning: string;
  /** Founded year (number when known) */
  founded: number;
  /** Sanctioning org / organizer */
  sanctioning: string;
  /** 2026 date label — "tentative" until officially announced */
  dates2026: string;
  /** Number of divisions */
  divisions: string;
  /** Scoring rule one-liner */
  scoring: string;
  /** Beneficiary or where the proceeds go */
  beneficiary: string;
  /** Verifiable scale signal — most-recent purse, field size, or impact */
  scaleSignal: string;
  /** Distinct cultural beat — what makes this one feel different */
  cultureNote: string;
  /** Public viewing notes — when/where to watch for free */
  viewingNotes: string;
  /** Source URL — official site */
  officialUrl: string;
}

export const seasonMembers: SeasonMember[] = [
  {
    name: "Port Aransas Deep Sea Roundup",
    alias: "DSR",
    detailHref: "/events/deep-sea-roundup-2026",
    icon: "🏆",
    positioning:
      "Texas's oldest fishing tournament — the institution of the season.",
    founded: 1932,
    sanctioning: "Port Aransas Boatmen, Inc.",
    dates2026: "July 9–12, 2026",
    divisions:
      "6 (Bay-Surf, Offshore, Flyfishing, Kayaking, Tarpon Release, Billfish Release)",
    scoring: "Heaviest fish per species per division; release divisions by length / count.",
    beneficiary:
      "Boatmen Inc. scholarship + community programs (year-round).",
    scaleSignal:
      "90th annual edition. Continuous run since 1932 (only WWII and 2020 paused it).",
    cultureNote:
      "Multi-generational and family-friendly. Piggy Perch (kids' contest) is a real award category. Top Woman Angler lineage carried since Dorothy Fair, 1934.",
    viewingNotes:
      "Friday + Saturday weigh-ins at Roberts Point Park's Fred Rhodes Pavilion, 5–8 PM. Sunday awards + public fish fry at the Civic Center, noon. All free to watch.",
    officialUrl: "https://deepsearoundup.org",
  },
  {
    name: "The Billfish Pachanga",
    alias: "Pachanga",
    detailHref: null,
    icon: "🐟",
    positioning:
      "The newest of the marquee four — limited-field, conservation-anchored billfish tournament.",
    founded: 2018, // approximate — 2025 was 7th annual
    sanctioning: "Independent (held at Virginia's on the Bay)",
    dates2026: "Mid-July (TBD — 2025 was July 16–19)",
    divisions:
      "Billfish + standard offshore species, capped to 40 boats.",
    scoring:
      "Catch-and-release for billfish with verification protocol; weighted scoring across the field.",
    beneficiary:
      "Harte Research Institute for Sportfish Science + Port Aransas Scholarship Fund.",
    scaleSignal:
      "7th annual edition by 2025. Field strictly capped at 40 boats — the only marquee tournament that turns boats away.",
    cultureNote:
      "Smaller, science-anchored, more selective. The Pachanga benefits sportfish research at Harte Research Institute (Texas A&M Corpus Christi) — a tournament that funds the science of the fish it chases.",
    viewingNotes:
      "Check-in + registration at Virginia's on the Bay, evening kickoff. Public viewing details TBD per year.",
    officialUrl: "https://www.billfishpachanga.com/",
  },
  {
    name: "Texas Legends Billfish Tournament",
    alias: "Texas Legends",
    detailHref: null,
    icon: "🎣",
    positioning:
      "The biggest purse on the Texas Gulf Coast — a Triple Crown circuit anchor.",
    founded: 2010, // approximate — confirm closer to event
    sanctioning: "Texas Legends (independent)",
    dates2026: "Early August (TBD — 2025 was Aug 6–10)",
    divisions:
      "Billfish + offshore species, calcuttas, jackpots.",
    scoring:
      "Catch-and-release billfish with weighted points; large cash purse + jackpots stacked across categories.",
    beneficiary:
      "Tournament-funded prizes; portions of fees historically support local charities.",
    scaleSignal:
      "$800,000+ in prize money in recent editions. One of three legs of the Texas Triple Crown Billfish Series (with Lone Star Shootout in Port O'Connor and TIFT in South Padre Island).",
    cultureNote:
      "The big-money one. Multi-million-dollar offshore yachts, professional captains, serious leaderboard battles. Triple Crown points feed a season-long champion.",
    viewingNotes:
      "Public weigh-in at Fisherman's Wharf evenings. Check official site for 2026 dates + schedule.",
    officialUrl: "https://www.txlegends.com/",
  },
  {
    name: "Texas Women Anglers Tournament",
    alias: "TWAT",
    detailHref: "/events/texas-women-anglers-tournament-2026",
    icon: "🎣",
    positioning:
      "The matriarch of the women-only fishing tournament — charity-engine, family-run, no online merch store.",
    founded: 1984,
    sanctioning: "Fox family (Pete Fox founded; Chris Fox + Fox family today)",
    dates2026: "Late August (tentative Aug 21–23)",
    divisions: "4 (Billfish, Dolphin, Tuna, Wahoo) — offshore-only.",
    scoring:
      "Billfish points + 1 point per pound for dolphin, tuna, and wahoo. Overall = total. Women-only on the boats.",
    beneficiary:
      "The Purple Door (Coastal Bend's shelter for survivors of domestic violence and sexual assault, formerly Women's Shelter of South Texas). $130K+ raised across 40+ years.",
    scaleSignal:
      "$403,809 in 2025 prize money across 14 money winners. Pete Fox inducted into Texas Saltwater Fishing Hall of Fame, 2021.",
    cultureNote:
      "The most spectacular weigh-in on the coast. Themed boat parade, costumes, mariachi bands appearing on the bridges of multi-million-dollar yachts. Bigger crowd than several mega-money tournaments.",
    viewingNotes:
      "Friday reception (downtown, venue TBD by organizer). Saturday harbor circle starting ~6 PM at Fisherman's Wharf with parade docking after the 7:30 PM jetties cutoff. Sunday awards + check presentation to The Purple Door.",
    officialUrl: "https://texaswomenanglers.org/",
  },
];

/** Check whether a given event slug is part of Tournament Season */
export function isInTournamentSeason(eventSlug: string): boolean {
  const target = `/events/${eventSlug}`;
  return seasonMembers.some((m) => m.detailHref === target);
}

/** Sort members by their 2026 calendar order — earliest first */
export function getSeasonMembersInOrder(): SeasonMember[] {
  // Manual order based on calendar position (DSR July → Pachanga mid-July → Legends early Aug → TWAT late Aug)
  const order = [
    "Port Aransas Deep Sea Roundup",
    "The Billfish Pachanga",
    "Texas Legends Billfish Tournament",
    "Texas Women Anglers Tournament",
  ];
  return order
    .map((name) => seasonMembers.find((m) => m.name === name))
    .filter((m): m is SeasonMember => Boolean(m));
}
