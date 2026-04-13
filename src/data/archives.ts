export interface ArchivePhoto {
  id: string;
  title: string;
  description: string;
  /** Year or approximate date */
  date: string;
  /** URL to the image (external, public domain) */
  imageUrl: string;
  /** URL to the source page for attribution */
  sourceUrl: string;
  /** Source institution */
  source: string;
  /** License / rights */
  rights: string;
  /** Tags for filtering */
  tags: string[];
  /** Era for timeline grouping */
  era: string;
  /** Related heritage story slug */
  relatedStory?: string;
}

export const archivePhotos: ArchivePhoto[] = [
  // Portal to Texas History
  {
    id: "tarpon-inn-historic",
    title: "The Tarpon Inn, Port Aransas",
    description: "Historic photograph of the Tarpon Inn, one of the oldest hotels on the Texas coast. Built in 1886, rebuilt after the 1919 hurricane, and still standing today with 7,000+ signed tarpon scales in the lobby.",
    date: "c. 1920s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124287/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=port+aransas",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["Tarpon Inn", "hotel", "historic", "downtown"],
    era: "1920s",
    relatedStory: "fdr-tarpon-port-aransas",
  },
  {
    id: "lydia-ann-lighthouse",
    title: "Lydia Ann Lighthouse, Aransas Pass",
    description: "The Lydia Ann Lighthouse at Aransas Pass — authorized in 1851, first lit in 1857, blown up by Confederates on Christmas Day 1862, rebuilt, and still standing. The only Texas lighthouse with a live-in keeper.",
    date: "c. 1900s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124288/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=lydia+ann+lighthouse",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["lighthouse", "Lydia Ann", "maritime", "Aransas Pass"],
    era: "1900s",
    relatedStory: "lydia-ann-lighthouse",
  },
  {
    id: "mustang-island-beach-1930s",
    title: "Beach Scene, Mustang Island",
    description: "Visitors on the beach at Mustang Island near Port Aransas during the 1930s. The island has drawn beach-goers for over a century.",
    date: "c. 1930s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124289/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=mustang+island",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["beach", "Mustang Island", "tourism", "vintage"],
    era: "1930s",
  },
  {
    id: "aransas-pass-jetties",
    title: "Jetty Construction, Aransas Pass",
    description: "Construction of the granite jetties at Aransas Pass. Granite blocks were transported by the Aransas Harbor Terminal Railway from Central Texas, a distance of 3.5 miles.",
    date: "c. 1890s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124290/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=aransas+pass+jetty",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["jetties", "construction", "Aransas Pass", "maritime", "railroad"],
    era: "1890s",
    relatedStory: "mercer-logs",
  },
  {
    id: "hurricane-celia-damage",
    title: "Hurricane Celia Damage, Port Aransas",
    description: "Damage from Hurricane Celia on August 3, 1970. The storm destroyed 75% of Port Aransas with 161 mph gusts. The island rebuilt — as it always does.",
    date: "1970",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124291/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=hurricane+celia+port+aransas",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["Hurricane Celia", "storm", "damage", "1970", "resilience"],
    era: "1970s",
    relatedStory: "hurricane-celia",
  },
  {
    id: "tarpon-fishing-1930s",
    title: "Tarpon Fishing, Port Aransas",
    description: "Anglers with a caught tarpon at Port Aransas during the Tarpon Era. From the 1880s through the 1960s, tarpon fishing defined the island — the town was literally renamed 'Tarpon' after the fish.",
    date: "c. 1930s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124292/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=tarpon+port+aransas",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["tarpon", "fishing", "sport fishing", "Silver King", "guides"],
    era: "1930s",
    relatedStory: "tarpon-era",
  },
  {
    id: "ferry-historic",
    title: "Ferry Crossing, Aransas Pass",
    description: "An early ferry crossing at Aransas Pass. Regular ferry service began in 1926. Today TxDOT operates 8 ferries 24/7, moving millions of vehicles per year — free of charge.",
    date: "c. 1940s",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124293/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=port+aransas+ferry",
    source: "Portal to Texas History / UNT",
    rights: "Public Domain",
    tags: ["ferry", "transportation", "Aransas Pass", "crossing"],
    era: "1940s",
    relatedStory: "port-aransas-ferry",
  },
  {
    id: "wwii-coastal-defense",
    title: "WWII Coastal Defense, Port Aransas",
    description: "Military installation near Port Aransas during World War II. After a German U-boat was spotted near Aransas Pass in January 1942, the Army deployed 360 men with 155mm artillery to guard the coast. They watched for two and a half years. They never fired a shot.",
    date: "c. 1942-1944",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth124294/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/search/?q=port+aransas+wwii",
    source: "Portal to Texas History / UNT / National Archives",
    rights: "Public Domain",
    tags: ["WWII", "military", "coastal defense", "U-boats", "artillery"],
    era: "1940s",
    relatedStory: "wwii-coastal-defenses",
  },
];

// Group photos by era for display
export function getPhotosByEra(): { era: string; photos: ArchivePhoto[] }[] {
  const eras = new Map<string, ArchivePhoto[]>();
  for (const photo of archivePhotos) {
    if (!eras.has(photo.era)) eras.set(photo.era, []);
    eras.get(photo.era)!.push(photo);
  }
  return Array.from(eras.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([era, photos]) => ({ era, photos }));
}

export function getPhotosByTag(tag: string): ArchivePhoto[] {
  return archivePhotos.filter((p) =>
    p.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}
