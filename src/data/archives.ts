export interface ArchivePhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  sourceUrl: string;
  source: string;
  rights: string;
  tags: string[];
  era: string;
  relatedStory?: string;
}

export const archivePhotos: ArchivePhoto[] = [
  // === 1850s ===
  {
    id: "aransas-pass-chart-1853",
    title: "Reconnaissance of Aransas Pass, 1853",
    description: "U.S. Coast Survey navigation chart of Aransas Pass — the channel that connects the Gulf of Mexico to Corpus Christi Bay. Drawn under Superintendent A.D. Bache. This is what the Mercers were piloting ships through when Robert Ainsworth Mercer began his logs in 1866.",
    date: "1853",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth30999/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/ark:/67531/metapth30999/",
    source: "Portal to Texas History / Star of the Republic Museum",
    rights: "Public Domain (U.S. Government)",
    tags: ["map", "Aransas Pass", "Coast Survey", "navigation", "channel"],
    era: "1850s",
    relatedStory: "mercer-logs",
  },

  // === 1860s ===
  {
    id: "civil-war-aransas-1863",
    title: "Civil War Map — Union Capture of Aransas Pass, 1863",
    description: "Map showing the position of the bar and Confederate batteries at Aransas Pass, each mounting a 20-pound Parrott gun. Union forces under Major General Banks took the position on November 17, 1863. Federal troops blockaded the pass from 1862-1866 — the same blockade that drove the Mercer family inland.",
    date: "1863",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Aransas_Pass%2C_Texas%2C_Taken_by_the_Union_forces_under_Maj._Gen._Banks%2C_Nov._17th.%2C_1863._-_NARA_-_305796.jpg/800px-Aransas_Pass%2C_Texas%2C_Taken_by_the_Union_forces_under_Maj._Gen._Banks%2C_Nov._17th.%2C_1863._-_NARA_-_305796.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aransas_Pass,_Texas,_Taken_by_the_Union_forces_under_Maj._Gen._Banks,_Nov._17th.,_1863._-_NARA_-_305796.jpg",
    source: "National Archives (NARA) via Wikimedia Commons",
    rights: "Public Domain (U.S. Government)",
    tags: ["Civil War", "military", "map", "Aransas Pass", "Union", "Confederate"],
    era: "1860s",
    relatedStory: "mercer-logs",
  },

  // === 1910s ===
  {
    id: "aransas-pass-panoramic-1911",
    title: "Panoramic View of Aransas Pass, Texas",
    description: "A sweeping panoramic photograph of the town of Aransas Pass, Texas — the mainland gateway to Port Aransas across the channel. This was the era when the Aransas Harbor Terminal Railway was running trains to Harbor Island and the first ferry operators were establishing crossings.",
    date: "c. 1911",
    imageUrl: "https://www.loc.gov/resource/pan.6a10138/",
    sourceUrl: "https://www.loc.gov/item/2007661637/",
    source: "Library of Congress",
    rights: "No Known Restrictions",
    tags: ["panoramic", "Aransas Pass", "town", "early 1900s", "railroad"],
    era: "1910s",
    relatedStory: "port-aransas-ferry",
  },
  {
    id: "lighthouse-station-1919",
    title: "Aransas Pass Light Station After the 1919 Hurricane",
    description: "Foundations of the cistern and old dwelling at the Aransas Pass Light Station, photographed September 20, 1919 — weeks after the devastating hurricane that destroyed most of Port Aransas. The 1919 storm brought a 12-to-15-foot surge that wiped out the original Farley Boat Works and depopulated the island.",
    date: "September 20, 1919",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Texas_-_Aransas_Pass_-_DPLA_-_f462e2bddf5998c33c162507371ffe9e.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Texas_-_Aransas_Pass_-_DPLA_-_f462e2bddf5998c33c162507371ffe9e.jpg",
    source: "National Archives (NARA) / Bureau of Lighthouses",
    rights: "Public Domain (U.S. Government)",
    tags: ["lighthouse", "Lydia Ann", "1919 hurricane", "storm damage", "ruins"],
    era: "1910s",
    relatedStory: "lydia-ann-lighthouse",
  },

  // === 1930s ===
  {
    id: "causeway-sign-1939",
    title: "Sign on Causeway from Port Aransas to Aransas Pass",
    description: "A road sign on the causeway connecting Port Aransas to Aransas Pass, photographed by Russell Lee for the Farm Security Administration in February 1939. Two years after FDR caught his tarpon here, this is what the crossing looked like — wooden planks over railroad trestles.",
    date: "February 1939",
    imageUrl: "https://tile.loc.gov/storage-services/service/pnp/fsa/8a25000/8a25300/8a25382v.jpg",
    sourceUrl: "https://www.loc.gov/resource/fsa.8a25382/",
    source: "Library of Congress / FSA-OWI Collection",
    rights: "Public Domain (U.S. Government / FSA)",
    tags: ["causeway", "road", "sign", "1930s", "crossing", "transportation"],
    era: "1930s",
    relatedStory: "port-aransas-ferry",
  },
  {
    id: "fish-house-1939",
    title: "Fish House, Port Aransas, 1939",
    description: "A fish house in Port Aransas, photographed by Russell Lee for the Farm Security Administration in February 1939. Port Aransas was a working fishing village — fish houses like this processed the day's catch for market and local sale.",
    date: "February 1939",
    imageUrl: "https://tile.loc.gov/storage-services/service/pnp/fsa/8a25000/8a25300/8a25386v.jpg",
    sourceUrl: "https://www.loc.gov/item/2017739175/",
    source: "Library of Congress / FSA-OWI Collection",
    rights: "Public Domain (U.S. Government / FSA)",
    tags: ["fishing", "fish house", "commercial", "1930s", "working waterfront"],
    era: "1930s",
    relatedStory: "tarpon-era",
  },

  // === 1970s ===
  {
    id: "celia-grounded-boats-1970",
    title: "Boats Grounded by Hurricane Celia, 1970",
    description: "Boats blown ashore by Hurricane Celia at Aransas Pass, August 1970. Celia made landfall with 161 mph gusts and destroyed 75% of Port Aransas. The fishing fleet was scattered across the island. Pearl Beer donated water when the town's supply was contaminated.",
    date: "August 1970",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Hurricane_celia_grounded_boats.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hurricane_celia_grounded_boats.jpg",
    source: "NOAA Photo Library / Coast and Geodetic Survey",
    rights: "Public Domain (U.S. Government / NOAA)",
    tags: ["Hurricane Celia", "storm", "boats", "damage", "1970", "Aransas Pass"],
    era: "1970s",
    relatedStory: "hurricane-celia",
  },

  // === 1980s ===
  {
    id: "lighthouse-color-1981",
    title: "Aransas Pass Light Station, 1981",
    description: "Color photograph of the Aransas Pass Light Station (Lydia Ann Lighthouse) taken in May 1981, before H-E-B's Charles Butt purchased and relit it in 1988. The lighthouse was deactivated by the Coast Guard in 1952 and sat dark for 36 years.",
    date: "May 1, 1981",
    imageUrl: "https://texashistory.unt.edu/ark:/67531/metapth927076/m1/1/",
    sourceUrl: "https://texashistory.unt.edu/ark:/67531/metapth927076/",
    source: "Texas Historical Commission / Portal to Texas History",
    rights: "Government Source",
    tags: ["lighthouse", "Lydia Ann", "color", "1981", "THC"],
    era: "1980s",
    relatedStory: "lydia-ann-lighthouse",
  },

  // === 2000s ===
  {
    id: "lydia-ann-aerial-2005",
    title: "Lydia Ann Lighthouse — Aerial View",
    description: "Aerial photograph of the Lydia Ann Lighthouse from 300 feet, showing its position on the Lydia Ann Channel. The lighthouse has guided mariners through Aransas Pass since 1857 — the only Texas lighthouse with a live-in keeper.",
    date: "July 5, 2005",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Lydia_Ann_from_300_ft._-_panoramio.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lydia_Ann_from_300_ft._-_panoramio.jpg",
    source: "Wikimedia Commons",
    rights: "CC BY 3.0",
    tags: ["lighthouse", "Lydia Ann", "aerial", "channel"],
    era: "2000s",
    relatedStory: "lydia-ann-lighthouse",
  },
  {
    id: "ferry-landing-2005",
    title: "Ferry Landing, Port Aransas, 2005",
    description: "The TxDOT ferry landing at Port Aransas. The free 24/7 ferry system has operated since 1968 under state control, moving millions of vehicles per year across the Corpus Christi Ship Channel.",
    date: "2005",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/Ferry_Landing_Port_Aransas_Texas_2005.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ferry_Landing_Port_Aransas_Texas_2005.jpg",
    source: "Wikimedia Commons",
    rights: "Public Domain",
    tags: ["ferry", "TxDOT", "landing", "transportation", "channel"],
    era: "2000s",
    relatedStory: "port-aransas-ferry",
  },
  {
    id: "utmsi-campus-2007",
    title: "UTMSI Campus, Port Aransas, 2007",
    description: "The University of Texas Marine Science Institute campus in Port Aransas, landscaped with palms along the ship channel. Founded in 1941 after a zoologist built a one-room shack on a dock to investigate a fish kill — now a 72-acre research campus.",
    date: "June 22, 2007",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/UTMSI_2007.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:UTMSI_2007.jpg",
    source: "Wikimedia Commons / Larry D. Moore",
    rights: "CC BY 4.0",
    tags: ["UTMSI", "university", "marine science", "campus", "research"],
    era: "2000s",
    relatedStory: "red-tide-utmsi",
  },
  {
    id: "noaa-fishermen-2010",
    title: "Fishermen and Yachts, Port Aransas Harbor",
    description: "Small-scale fishermen and yachtsmen sharing the Port Aransas harbor. The working waterfront and the recreational marina have coexisted here for over a century.",
    date: "November 17, 2010",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Fish1581_-_Flickr_-_NOAA_Photo_Library.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fish1581_-_Flickr_-_NOAA_Photo_Library.jpg",
    source: "NOAA Photo Library / William B. Folsom",
    rights: "Public Domain (U.S. Government / NOAA)",
    tags: ["fishing", "harbor", "boats", "waterfront", "marina"],
    era: "2010s",
  },

  // === 2010s ===
  {
    id: "port-aransas-satellite-2014",
    title: "Port Aransas from Space — ISS, 2014",
    description: "Port Aransas and the Intracoastal Waterway photographed from the International Space Station on February 21, 2014. The barrier island, Aransas Pass channel, and Corpus Christi Bay are all visible. The ferry crossing is the thin gap between Mustang Island and Harbor Island.",
    date: "February 21, 2014",
    imageUrl: "https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/imagerecords/83000/83459/ISS038-E-057806.jpg",
    sourceUrl: "https://science.nasa.gov/earth/earth-observatory/port-aransas-and-the-intracoastal-waterway-texas-83459",
    source: "NASA Earth Observatory / ISS",
    rights: "Public Domain (NASA)",
    tags: ["satellite", "aerial", "ISS", "NASA", "barrier island", "geography"],
    era: "2010s",
  },
];

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
