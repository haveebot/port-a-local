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
      "On a warm May afternoon in 1937, President Franklin D. Roosevelt boarded a locally built Farley boat with fishing guide Barney Farley at the helm. At 3:27 PM, Roosevelt landed a five-foot tarpon off the coast of Port Aransas. The signed scale still hangs in the Tarpon Inn today. No single page on the internet tells this story in full. Until now.",
    category: "heritage",
    icon: "🎣",
    readTime: "8 min",
    featured: true,
    published: false,
    date: "2026-04-12",
    tags: ["FDR", "tarpon", "Farley", "Tarpon Inn", "fishing", "1937", "presidential history"],
    relatedBusinesses: [],
  },
  {
    slug: "tarpon-era",
    title: "The Tarpon Era",
    subtitle: "When Port Aransas was called Tarpon, Texas — and the Silver King ruled the coast",
    description:
      "From the 1880s through the 1960s, tarpon fishing defined Port Aransas. The town was literally renamed after the fish. Guides built their lives around the Silver King, and anglers traveled from across the country to test themselves against it. This is the story of how one fish shaped an entire community.",
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
      "Fred and Barney Farley arrived on the Texas coast in 1910. By 1914, they were building the first production sport fishing boats in America — no blueprints, just designs sketched on the shop floor. A hurricane destroyed the original location. The business closed in 1973. And then, in 2011, the community brought it back to life.",
    category: "heritage",
    icon: "⛵",
    readTime: "10 min",
    featured: true,
    published: false,
    date: "2026-04-12",
    tags: ["Farley", "boat building", "wooden boats", "maritime heritage", "PAPHA", "craftsmanship"],
    relatedBusinesses: [],
  },
  {
    slug: "hurricane-celia",
    title: "Hurricane Celia",
    subtitle: "August 3, 1970 — the storm that destroyed 75% of Port Aransas and the community that rebuilt it",
    description:
      "When Hurricane Celia made landfall on August 3, 1970, it tore through Port Aransas with 161 mph gusts and left three-quarters of the island in ruins. The fishing fleet was scattered. Landmarks were leveled. A Farley boat wrecked by the storm now sits in the Port Aransas Museum. But the island came back. It always does.",
    category: "heritage",
    icon: "🌀",
    readTime: "10 min",
    featured: true,
    published: false,
    date: "2026-04-12",
    tags: ["Hurricane Celia", "1970", "storms", "resilience", "rebuilding", "natural disaster"],
    relatedBusinesses: [],
  },
  {
    slug: "lydia-ann-lighthouse",
    title: "The Lydia Ann Light",
    subtitle: "The last operational lighthouse in Texas, a French-made lens, and 150 years guiding ships home",
    description:
      "A Fourth Order Fresnel lens, manufactured in 1860s Paris by Henry Lapaute, guided ships through Lydia Ann Channel for 74 years. The lens now lives in the Port Aransas Museum. The lighthouse itself still stands — the last operational lighthouse on the Texas coast. This is its story.",
    category: "heritage",
    icon: "🏮",
    readTime: "7 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["lighthouse", "Lydia Ann", "Fresnel lens", "maritime", "navigation", "French manufacture"],
    relatedBusinesses: [],
  },
  {
    slug: "karankawa-legacy",
    title: "4,500 Years Before Port Aransas",
    subtitle: "The Karankawa people, the island's first residents, and research that rewrites what we thought we knew",
    description:
      "Long before the tarpon anglers, before the Farleys, before the town had a name, the Karankawa people lived on these barrier islands for over four millennia. Recent research by Alejandro Oyoque and Enrique Gonzales has traced Karankawa descendants surviving into Mexico. Their story is the island's oldest — and its least told.",
    category: "heritage",
    icon: "🏝️",
    readTime: "8 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["Karankawa", "indigenous history", "pre-colonial", "Mustang Island", "archaeology"],
    relatedBusinesses: [],
  },
  {
    slug: "port-aransas-museum",
    title: "25,500 Stories on Alister Street",
    subtitle: "Inside the Port Aransas Museum — the island's institutional memory, housed in a 1910 kit house",
    description:
      "The Port Aransas Museum holds over 25,500 historical photos and documents, film footage from the 1920s and 1930s, oral history interviews with notable islanders, and artifacts from the tarpon era through Hurricane Celia. It is the single richest archive of island history in existence — and most of it has never been seen online.",
    category: "heritage",
    icon: "🏛️",
    readTime: "7 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["museum", "PAPHA", "archive", "photos", "artifacts", "oral history", "Port Aransas history"],
    relatedBusinesses: [],
  },
  {
    slug: "storms-of-port-aransas",
    title: "Built, Destroyed, Rebuilt",
    subtitle: "A history of every hurricane that hit Port Aransas — and the people who refused to leave",
    description:
      "Port Aransas has been destroyed and rebuilt more times than most towns have existed. From the devastating 1919 hurricane that wiped the Tarpon Inn off its foundation to Hurricane Harvey in 2017, the cycle of storm and recovery is woven into the island's DNA. This is the complete storm history of Port Aransas.",
    category: "heritage",
    icon: "⛈️",
    readTime: "12 min",
    featured: false,
    published: false,
    date: "2026-04-12",
    tags: ["hurricanes", "storms", "1919", "Celia", "Harvey", "Allen", "resilience", "rebuilding"],
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
