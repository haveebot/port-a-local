/**
 * Port A Local — Dispatch
 *
 * Current-events editorial, analysis, and investigation. Distinct from Heritage
 * (preserved history). Dispatches are dated, sourced, and carry a point of view.
 *
 * Voice: local, journalistic, specific, sourced. Reluctant to sensationalize.
 */

export interface Dispatch {
  slug: string;
  title: string;
  subtitle: string;
  /** Short description for cards, OG tags, and search */
  description: string;
  category: "editorial" | "analysis" | "investigation" | "news";
  icon: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  /** ISO date of publication */
  date: string;
  /** ISO date of last material update (shown if present) */
  updatedAt?: string;
  /** Tags for search / filtering */
  tags: string[];
  /** Related dispatch slugs */
  relatedDispatches?: string[];
  /** Related heritage story slugs — cross-link into /history */
  relatedStories?: string[];
  /**
   * Optional attention-getting OG visual hook. When present, the
   * dispatch OG renders a high-impact layout instead of the standard
   * branded one — big stat or pull quote on coral, designed to stop
   * the scroll on FB / IG / X feeds.
   *
   *   stat:   { type: "stat", text: "8.7%", label: "..." }
   *   quote:  { type: "quote", text: "...", attribution: "..." }
   */
  ogHighlight?:
    | { type: "stat"; text: string; label: string }
    | { type: "quote"; text: string; attribution: string };
}

export const dispatches: Dispatch[] = [
  {
    slug: "highway-361-fatal-crashes",
    title: "Three Dead in Five Days on the “Island Road”",
    subtitle:
      "Port A Local pulled ten years of state crash records for State Highway 361. Per mile driven, the island road produces fewer crashes than a typical Texas rural two-lane highway — and nearly twice the deaths. Every fatal crash on the corridor since 2016 is north of the only stretch TxDOT has funded.",
    description:
      "Two fatal crashes five days apart in August 2026 killed three people on State Highway 361 between Port Aransas and Park Road 22. Neither involved alcohol; both were centerline crossings. Port A Local pulled the TxDOT crash file for the corridor — 421 crashes, 14 fatal crashes, 17 deaths since 2016 — and mapped every one against the road's design and TxDOT's own funding record.",
    category: "investigation",
    icon: "🛣️",
    readTime: "12 min",
    featured: true,
    published: true,
    date: "2026-08-15",
    tags: [
      "Port Aransas",
      "Highway 361",
      "SH 361",
      "Mustang Island",
      "TxDOT",
      "traffic safety",
      "crash records",
      "CRIS",
      "raised median",
      "access management",
      "Beach Access Road 1B",
      "Cinnamon Shore",
      "Sea Oats Group",
      "Corpus Christi MPO",
      "City Council",
      "development",
    ],
    relatedDispatches: [
      "highway-361-after-dark",
      "the-two-port-aransases",
      "closed-session-66-million",
    ],
    ogHighlight: {
      type: "stat",
      text: "14 of 14",
      label:
        "Fatal crashes on SH 361 since 2016 are north of the stretch TxDOT funded first",
    },
  },
  {
    slug: "highway-361-after-dark",
    title: "We Were Asked What the Crash File Says About Darkness",
    subtitle:
      "Readers asked whether the ten-year record on State Highway 361 shows a day-and-night pattern. It does. A crash after dark on an unlit stretch of the island road is about four times as likely to kill as the same crash in daylight — and the Nueces County legislative delegation meets TxDOT about the highway on Wednesday.",
    description:
      "A follow-up analysis of the TxDOT crash file for SH 361 between Port Aransas and Park Road 22, sorted by the light condition recorded on each crash report. Darkness is 27% of the corridor's crashes and half its fatal ones; 8pm to 6am accounts for 22% of crashes and 58% of deaths; every fatal crash after dark is at or north of Access Road 2.",
    category: "analysis",
    icon: "🌙",
    readTime: "5 min",
    featured: true,
    published: true,
    date: "2026-08-17",
    tags: [
      "Port Aransas",
      "Highway 361",
      "SH 361",
      "Mustang Island",
      "TxDOT",
      "traffic safety",
      "crash records",
      "CRIS",
      "highway lighting",
      "Todd Hunter",
      "raised median",
      "data analysis",
    ],
    relatedDispatches: ["highway-361-fatal-crashes"],
    ogHighlight: {
      type: "stat",
      text: "7.0%",
      label:
        "How often a crash after dark with no lighting kills someone on SH 361 — in daylight it is 1.7%",
    },
  },
  {
    slug: "closed-session-66-million",
    title: "$66 Million in Closed Session",
    subtitle:
      "Wednesday at 5 PM, the Port Aransas City Council votes to consent to a $66 million hotel-and-convention center at Palmilla Beach Resort. The Master Development Agreement is being negotiated in closed session. Seven years ago, the same Council made a similar decision the same way — and the project was never built.",
    description:
      "On May 20, 2026, the Port Aransas City Council is scheduled to consent to a Municipal Management District financing a $66 million hotel-and-convention center at Palmilla Beach Resort, with the underlying agreement negotiated in closed session. The 2019 procurement of a similar project, also deliberated outside the public packet, was awarded to a lower-scoring bidder and never built. The bidder the 2019 rubric had winning is the bidder on Wednesday's vote.",
    category: "investigation",
    icon: "📋",
    readTime: "7 min",
    featured: true,
    published: true,
    date: "2026-05-17",
    tags: [
      "Port Aransas",
      "City Council",
      "Palmilla Beach",
      "Cinnamon Shore",
      "McCombs Properties",
      "KM Beach LLC",
      "Municipal Management District",
      "MMD",
      "TIRZ",
      "hotel conference center",
      "closed session",
      "David Parsons",
      "Marsha Shields",
      "Red McCombs",
      "PUD",
      "P&Z Capture",
    ],
    relatedDispatches: ["the-two-port-aransases"],
    ogHighlight: {
      type: "stat",
      text: "$66M",
      label: "Closed-session vote · Port Aransas City Council · May 20, 2026",
    },
  },
  {
    slug: "nueces-drought-disaster-2026",
    title: "Nueces County Declares Local Drought Disaster",
    subtitle:
      "Reservoirs at 8.7 percent combined capacity. Stage 3 restrictions in force. Level 1 emergency projected for September. What today's declaration changes, and what it means for the island.",
    description:
      "On April 30, 2026, Nueces County declared a local disaster over the deepening drought and water shortage. Port Aransas — on the same water system as Corpus Christi — is inside the declaration. The numbers behind it, the desalination plant that wasn't, and what visitors should expect.",
    category: "news",
    icon: "💧",
    readTime: "9 min",
    featured: true,
    published: true,
    date: "2026-04-30",
    tags: [
      "drought",
      "Nueces County",
      "Corpus Christi water",
      "Choke Canyon",
      "Lake Corpus Christi",
      "Harbor Island desal",
      "water restrictions",
      "Stage 3",
      "Texas Water Development Board",
      "Port Aransas Conservancy",
      "James King",
      "Dan Pecore",
      "Charles Bujan",
      "Scott Holt",
      "Joan Holt",
      "Cathy Fulton",
      "Beverly Bolner",
      "Bruce Clark",
      "Tammy King",
      "Deeport",
      "Barney Farley",
      "TCEQ",
      "SOAH",
      "Greg Abbott",
      "disaster declaration",
    ],
    relatedDispatches: ["the-two-port-aransases"],
    relatedStories: ["fdr-tarpon-port-aransas", "farley-boat-works"],
    ogHighlight: {
      type: "stat",
      text: "8.7%",
      label: "Combined reservoir capacity · April 2026",
    },
  },
  {
    slug: "the-two-port-aransases",
    title: "Port Aransas — A Tale of Two Islands",
    subtitle:
      "Tourism dashboards say the island is up. Main Street tells a different story — and the numbers, read carefully, agree.",
    description:
      "A national-chain drive-thru closes on Highway 361 while a $1.3 billion PUD expansion breaks ground a few miles south. The Tourism Bureau says everything is up. The Texas Comptroller tells a quieter, more complicated story. What the island's dashboards can and cannot see.",
    category: "editorial",
    icon: "🧭",
    readTime: "11 min",
    featured: true,
    published: true,
    date: "2026-04-14",
    tags: [
      "Port Aransas",
      "economy",
      "tourism",
      "Cinnamon Shore",
      "Palmilla Beach",
      "Sunflower Beach",
      "Mark Schnell",
      "30A",
      "HOT tax",
      "sales tax",
      "PAISD",
      "Sonic",
      "PUD",
      "development",
    ],
    relatedDispatches: [],
    relatedStories: ["storms-of-port-aransas", "cinnamon-shore-tension"],
  },
];

export function getDispatchBySlug(slug: string): Dispatch | undefined {
  return dispatches.find((d) => d.slug === slug);
}

export function getPublishedDispatches(): Dispatch[] {
  return dispatches.filter((d) => d.published);
}

export function getFeaturedDispatches(): Dispatch[] {
  return dispatches.filter((d) => d.published && d.featured);
}
