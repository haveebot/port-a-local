export interface Story {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: "heritage" | "people" | "nature" | "events";
  icon: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  /** ISO date string for when the story was published */
  date: string;
  /** Tags for search/filtering */
  tags: string[];
  /** Related business slugs from the directory */
  relatedBusinesses?: string[];
}

export const stories: Story[] = [
  {
    slug: "fdr-tarpon-port-aransas",
    title: "The Day a President Caught a Tarpon",
    subtitle: "May 8, 1937 — FDR, Barney Farley, and the fish that put Port Aransas in the history books",
    description:
      "On a warm May afternoon in 1937, President Franklin D. Roosevelt boarded a locally built Farley boat with fishing guide Barney Farley at the helm. At 3:27 PM, Roosevelt landed a five-foot tarpon off the coast of Port Aransas. The signed scale still hangs in the Tarpon Inn today.",
    category: "heritage",
    icon: "🎣",
    readTime: "8 min",
    featured: true,
    published: true,
    date: "2026-04-12",
    tags: ["FDR", "tarpon", "Farley", "Tarpon Inn", "fishing", "1937", "presidential history"],
    relatedBusinesses: [],
  },
  {
    slug: "tarpon-era",
    title: "The Tarpon Era",
    subtitle: "When Port Aransas was called Tarpon, Texas — and the Silver King ruled the coast",
    description:
      "From the 1880s through the 1960s, tarpon fishing defined Port Aransas. The town was literally renamed after the fish. Guides built their lives around the Silver King, and anglers traveled from across the country to test themselves against it.",
    category: "heritage",
    icon: "👑",
    readTime: "12 min",
    featured: true,
    published: false,
    date: "2026-04-12",
    tags: ["tarpon", "Silver King", "fishing history", "Tarpon Texas", "guides", "sport fishing"],
    relatedBusinesses: [],
  },
  {
    slug: "farley-boat-works",
    title: "Farley Boat Works",
    subtitle: "110 years of wooden boats, hand-carved half-models, and a family legacy that refused to sink",
    description:
      "Fred and Barney Farley arrived on the Texas coast in 1910. By 1914, they were building the first production sport fishing boats in America — no blueprints, just designs sketched on the shop floor. The business closed in 1973. In 2011, the community brought it back to life.",
    category: "heritage",
    icon: "⛵",
    readTime: "10 min",
    featured: true,
    published: true,
    date: "2026-04-12",
    tags: ["Farley", "boat building", "wooden boats", "maritime heritage", "PAPHA", "craftsmanship"],
    relatedBusinesses: [],
  },
  {
    slug: "hurricane-celia",
    title: "Hurricane Celia",
    subtitle: "August 3, 1970 — the storm that destroyed 75% of Port Aransas and the community that rebuilt it",
    description:
      "When Hurricane Celia made landfall on August 3, 1970, it tore through Port Aransas with 161 mph gusts and left three-quarters of the island in ruins. The fishing fleet was scattered. Landmarks were leveled. But the island came back. It always does.",
    category: "heritage",
    icon: "🌀",
    readTime: "10 min",
    featured: true,
    published: true,
    date: "2026-04-12",
    tags: ["Hurricane Celia", "1970", "storms", "resilience", "rebuilding", "natural disaster"],
    relatedBusinesses: [],
  },
  {
    slug: "lydia-ann-lighthouse",
    title: "The Lydia Ann Light",
    subtitle: "Blown up on Christmas Day, rebuilt, deactivated, bought by a billionaire, relit — and nobody agrees on who Lydia Ann was",
    description:
      "Authorized in 1851, bricks lost in a shipwreck, completed in 1857, blown up by Confederates on Christmas Day 1862, rebuilt, served nearly a century, deactivated in 1952, bought by H-E-B's Charles Butt, relit in 1988. The only Texas lighthouse with a live-in keeper. This is its story.",
    category: "heritage",
    icon: "🏮",
    readTime: "7 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["lighthouse", "Lydia Ann", "Fresnel lens", "maritime", "Civil War", "H-E-B", "Charles Butt"],
    relatedBusinesses: [],
  },
  {
    slug: "karankawa-legacy",
    title: "They Said We Were Extinct",
    subtitle: "5,000 years on the Gulf Coast, declared extinct in 1858, written back into the Handbook of Texas in 2020",
    description:
      "The Karankawa inhabited these barrier islands for over five millennia. Colonial propaganda justified their genocide. In 1858 they were declared extinct. In 2020, the Handbook of Texas corrected that lie. In 2025, descendants are fighting to protect a 2,300-year-old sacred site from an oil terminal.",
    category: "heritage",
    icon: "🏝️",
    readTime: "8 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["Karankawa", "indigenous history", "pre-colonial", "Mustang Island", "archaeology", "Donnel Point"],
    relatedBusinesses: [],
  },
  {
    slug: "port-aransas-museum",
    title: "38,000 Photos Nobody Can See",
    subtitle: "Inside the Port Aransas Museum — a 1910 Sears kit house holding the island's institutional memory",
    description:
      "The Port Aransas Museum holds nearly 40,000 historical photos, 1920s film footage, oral histories, and a Fresnel lens from 1860s Paris. The building itself was shipped to the island on a barge in 1910. Almost none of this collection is accessible online. That digital gap is a story in itself.",
    category: "heritage",
    icon: "🏛️",
    readTime: "7 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["museum", "PAPHA", "archive", "photos", "Sears kit house", "Fresnel lens", "Mark Creighton"],
    relatedBusinesses: [],
  },
  {
    slug: "storms-of-port-aransas",
    title: "Built, Destroyed, Rebuilt",
    subtitle: "A history of every hurricane that hit Port Aransas — and the people who refused to leave",
    description:
      "Port Aransas has been destroyed and rebuilt more times than most towns have existed. From the 1919 hurricane that depopulated the island to Harvey in 2017, the cycle of storm and recovery is woven into the DNA of this place.",
    category: "heritage",
    icon: "⛈️",
    readTime: "12 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["hurricanes", "storms", "1919", "Celia", "Harvey", "resilience", "rebuilding"],
    relatedBusinesses: [],
  },
  {
    slug: "chapel-on-the-dunes",
    title: "The Pirate's Poet's Chapel",
    subtitle: "A Texas Poet Laureate, a Wellesley graduate, and the oldest church on Mustang Island — built on a sand dune in 1937",
    description:
      "Aline B. Carter built a chapel atop a sand dune overlooking the Gulf so she could watch the light change. She held Sunday school serving ice cream and cake. The chapel still stands. The Carter family still owns it. PAPHA gives tours twice a month.",
    category: "heritage",
    icon: "⛪",
    readTime: "5 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["Chapel on the Dunes", "Aline Carter", "poet laureate", "church", "architecture", "WPA"],
    relatedBusinesses: [],
  },
  {
    slug: "wwii-coastal-defenses",
    title: "The Guns That Never Fired",
    subtitle: "When 155mm artillery guarded Port Aransas from German U-boats — January 1942 to July 1944",
    description:
      "A month after Pearl Harbor, a German U-boat was spotted miles from Aransas Pass. The Army deployed 360 men with 155mm French-designed guns on Panama mounts, dug into the sand dunes. For two and a half years they watched the Gulf. They never fired a shot.",
    category: "heritage",
    icon: "🎖️",
    readTime: "6 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["WWII", "coastal defense", "military", "U-boats", "50th Coast Artillery", "Harbor Island"],
    relatedBusinesses: [],
  },
  {
    slug: "deep-sea-roundup",
    title: "Texas's Oldest Fishing Tournament",
    subtitle: "From the 1932 Tarpon Rodeo to today's Deep Sea Roundup — 88 years of competition on the Gulf",
    description:
      "In 1932, 25 charter boat captains called themselves the Boatmen Association and staged a three-day Tarpon Rodeo. North Millican caught the winning fish — though locals still say his wife Totsy actually landed it. Dorothy Fair became the first woman champion in 1934. The tournament has run ever since, pausing only for WWII and COVID.",
    category: "events",
    icon: "🏆",
    readTime: "6 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["Deep Sea Roundup", "fishing tournament", "Boatmen", "Tarpon Rodeo", "competition"],
    relatedBusinesses: [],
  },
];

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}

export function getFeaturedStories(): Story[] {
  return stories.filter((s) => s.featured);
}

export function getPublishedStories(): Story[] {
  return stories.filter((s) => s.published);
}
