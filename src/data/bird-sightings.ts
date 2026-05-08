/**
 * Community bird sighting log — local birders submit day-lists, PAL
 * surfaces them on /birding's "From the field" callout + OG image.
 *
 * For now this is a hardcoded TS module so a new sighting is one file
 * edit + commit. When/if cadence picks up enough that this becomes
 * friction (target: 1+ entries/week), promote to Postgres + an admin
 * intake form. Pattern mirrors `delivery-restaurants.ts`.
 *
 * Order: most recent first. The first entry is "current."
 */

export interface BirdSighting {
  /** ISO date (YYYY-MM-DD) of the outing — the day species were observed */
  date: string;
  /** Birder's display name — public attribution */
  birderName: string;
  /** Where the outing happened (preserve, hotspot name) */
  location?: string;
  /** Species observed, in any order. Family grouping happens at render time */
  species: string[];
  /** Optional editor note: standout call-out, weather context, etc. */
  note?: string;
}

/**
 * Group species by rough family/grouping for display on the page. Order
 * within each group is alphabetical for scan-ability. Birder's original
 * order isn't preserved — they typically write as-they-go which is
 * chronological and not as useful to a reader.
 *
 * Groupings are heuristic — based on common-name prefixes/suffixes. If
 * a species doesn't match any rule, it lands in "Other".
 */
export type SpeciesGroup =
  | "waterbirds"
  | "ducks_teal"
  | "herons_egrets"
  | "shorebirds"
  | "gulls_terns"
  | "warblers"
  | "vireos"
  | "orioles"
  | "flycatchers"
  | "raptors"
  | "songbirds"
  | "other";

const GROUP_RULES: { group: SpeciesGroup; matches: (n: string) => boolean }[] =
  [
    {
      group: "ducks_teal",
      matches: (n) =>
        /\b(teal|duck|pintail|merganser|wigeon|gadwall|shoveler|goose)\b/i.test(
          n,
        ),
    },
    {
      group: "herons_egrets",
      matches: (n) => /\b(heron|egret|bittern|night-heron)\b/i.test(n),
    },
    {
      group: "waterbirds",
      matches: (n) =>
        /\b(cormorant|gallinule|coot|spoonbill|stilt|pelican|grebe|loon|anhinga)\b/i.test(
          n,
        ),
    },
    {
      group: "shorebirds",
      matches: (n) =>
        /\b(sandpiper|dowitcher|avocet|phalarope|plover|yellowlegs|willet|whimbrel|turnstone|godwit|killdeer|sanderling|knot)\b/i.test(
          n,
        ),
    },
    {
      group: "gulls_terns",
      matches: (n) => /\b(gull|tern|skimmer|jaeger)\b/i.test(n),
    },
    { group: "warblers", matches: (n) => /\bwarbler|parula|yellowthroat|redstart\b/i.test(n) },
    { group: "vireos", matches: (n) => /\bvireo\b/i.test(n) },
    { group: "orioles", matches: (n) => /\boriole\b/i.test(n) },
    {
      group: "flycatchers",
      matches: (n) =>
        /\b(flycatcher|kingbird|phoebe|kinglet|wood-pewee|pewee)\b/i.test(n),
    },
    {
      group: "raptors",
      matches: (n) =>
        /\b(hawk|eagle|kite|osprey|falcon|vulture|harrier|caracara|owl)\b/i.test(
          n,
        ),
    },
    {
      group: "songbirds",
      matches: (n) =>
        /\b(blackbird|grackle|cardinal|grosbeak|bunting|cuckoo|sparrow|finch|tanager|wren|thrush|catbird|mockingbird|cowbird|swallow|martin|chickadee|titmouse)\b/i.test(
          n,
        ),
    },
  ];

export function classifySpecies(name: string): SpeciesGroup {
  for (const rule of GROUP_RULES) {
    if (rule.matches(name)) return rule.group;
  }
  return "other";
}

/** Display labels for each group, ordered for the UI */
export const GROUP_DISPLAY_ORDER: { group: SpeciesGroup; label: string; emoji: string }[] = [
  { group: "warblers", label: "Warblers", emoji: "🐦" },
  { group: "shorebirds", label: "Shorebirds", emoji: "🪶" },
  { group: "ducks_teal", label: "Ducks & Teal", emoji: "🦆" },
  { group: "waterbirds", label: "Waterbirds", emoji: "💧" },
  { group: "herons_egrets", label: "Herons & Egrets", emoji: "🪿" },
  { group: "gulls_terns", label: "Gulls & Terns", emoji: "🌊" },
  { group: "vireos", label: "Vireos", emoji: "🌳" },
  { group: "orioles", label: "Orioles", emoji: "🍊" },
  { group: "flycatchers", label: "Flycatchers", emoji: "🪰" },
  { group: "songbirds", label: "Songbirds", emoji: "🎵" },
  { group: "raptors", label: "Raptors", emoji: "🦅" },
  { group: "other", label: "Other", emoji: "✨" },
];

/**
 * The log. Most recent first. To add: prepend a new BirdSighting object.
 * Species names: write as the birder wrote (subspecies included if the
 * birder distinguished them — e.g. Yellow-rumped's Audubon's vs Myrtle).
 */
export const SIGHTINGS: BirdSighting[] = [
  {
    date: "2026-05-02",
    birderName: "Beyrl Armstrong",
    location: "Leonabelle Turnbull Birding Center + nearby preserves",
    species: [
      // Waterbirds + ducks
      "Double-crested Cormorant",
      "Black-bellied Whistling Duck",
      "Cinnamon Teal",
      "Blue-winged Teal",
      "Northern Pintail",
      "Common Gallinule",
      "American Coot",
      "Roseate Spoonbill",
      "Black-necked Stilt",
      "Red-breasted Merganser",
      // Herons + egrets
      "Snowy Egret",
      "Great Egret",
      "Green Heron",
      "Great Blue Heron",
      // Shorebirds
      "Long-billed Dowitcher",
      "Short-billed Dowitcher",
      "American Avocet",
      "Wilson's Phalarope",
      "Least Sandpiper",
      "Semipalmated Sandpiper",
      // Gulls + terns
      "Common Tern",
      "Caspian Tern",
      "Laughing Gull",
      "Herring Gull",
      // Warblers (11)
      "American Redstart",
      "Blackburnian Warbler",
      "Magnolia Warbler",
      "Chestnut-sided Warbler",
      "Black-throated Green Warbler",
      "Audubon's Warbler",
      "Myrtle Warbler",
      "Bay-breasted Warbler",
      "Northern Parula",
      "Common Yellowthroat",
      "Wilson's Warbler",
      // Vireos
      "White-eyed Vireo",
      "Black-capped Vireo",
      "Warbling Vireo",
      // Orioles
      "Bullock's Oriole",
      "Hooded Oriole",
      "Orchard Oriole",
      // Flycatchers
      "Ruby-crowned Kinglet",
      "Willow Flycatcher",
      "Olive-sided Flycatcher",
      "Eastern Phoebe",
      // Other songbirds
      "Red-winged Blackbird",
      "Great-tailed Grackle",
      "Northern Cardinal",
      "Rose-breasted Grosbeak",
      "Indigo Bunting",
      "Yellow-billed Cuckoo",
      // Raptors
      "Turkey Vulture",
    ],
    note: "Peak spring migration — outstanding warbler diversity (11 species) including Blackburnian and Bay-breasted, plus the always-iconic Roseate Spoonbill.",
  },
];

/**
 * Returns the most recent sighting + a freshness flag (true if logged
 * within the last 7 days). Used by /birding's page + OG image to decide
 * whether to lead with community content or fall back to BirdCast radar.
 */
export async function getLatestSighting(): Promise<
  | (BirdSighting & {
      speciesCount: number;
      isFresh: boolean;
    })
  | null
> {
  const latest = SIGHTINGS[0];
  if (!latest) return null;
  const ageMs = Date.now() - new Date(latest.date + "T12:00:00").getTime();
  const isFresh = ageMs < 7 * 24 * 60 * 60 * 1000;
  return {
    ...latest,
    speciesCount: latest.species.length,
    isFresh,
  };
}

/**
 * Group a species list by family. Returns groups in display order, with
 * empty groups omitted. Within each group, species are sorted alphabetically.
 */
export function groupSpecies(
  species: string[],
): { group: SpeciesGroup; label: string; emoji: string; species: string[] }[] {
  const buckets = new Map<SpeciesGroup, string[]>();
  for (const name of species) {
    const g = classifySpecies(name);
    if (!buckets.has(g)) buckets.set(g, []);
    buckets.get(g)!.push(name);
  }
  return GROUP_DISPLAY_ORDER.filter((d) => (buckets.get(d.group)?.length ?? 0) > 0).map(
    (d) => ({
      ...d,
      species: (buckets.get(d.group) ?? []).slice().sort((a, b) =>
        a.localeCompare(b),
      ),
    }),
  );
}
