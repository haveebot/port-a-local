import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { fetchBirdCastSnapshot } from "@/lib/birdcast";
import { getLatestSighting } from "@/data/bird-sightings";

export const alt = "Birding in Port Aransas — peak migration";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

/**
 * Dynamic OG for /birding. Priority order:
 *   1. Latest community day-list (if a sighting was logged today/recently)
 *      — leads with the species count + birder attribution. The most
 *      shareable framing because it's real, current, named.
 *   2. Live BirdCast cumulative count (if recent migration is active)
 *   3. BirdCast aloft-now snapshot (if anything's flying)
 *   4. Static "premier birding destination" framing (off-season)
 *
 * Generated fresh on each scrape + cached at the framework layer.
 */
export default async function Image() {
  const sighting = await getLatestSighting().catch(() => null);
  const radar = await fetchBirdCastSnapshot().catch(() => null);

  const recentTotal = Math.round(radar?.recentTotalCombined ?? 0);
  const aloftNow = Math.round(radar?.combinedAloft ?? 0);

  let title: string;
  let subtitle: string;
  let badge = "Birding · Port A";
  let meta: string | undefined;

  if (sighting && sighting.isFresh) {
    title = `${sighting.speciesCount} species. One morning.`;
    const radarLine =
      recentTotal > 100
        ? ` · ${recentTotal.toLocaleString()} crossed the Coastal Bend last night`
        : "";
    subtitle = `Port A birder ${sighting.birderName}'s day-list — Roseate Spoonbills, Cinnamon Teal, 11 species of warblers${radarLine}`;
    badge = "From the field · Port A";
    meta = sighting.date;
  } else if (recentTotal > 100) {
    title = `${recentTotal.toLocaleString()} birds crossed the Coastal Bend`;
    subtitle =
      "Cornell Lab BirdCast radar · last ~12 hours · what's flying, where to look";
  } else if (aloftNow > 100) {
    title = `${aloftNow.toLocaleString()} birds aloft over the Coastal Bend`;
    subtitle =
      "Live BirdCast radar · Aransas + Nueces counties · what's flying, where to look";
  } else {
    title = "Peak Spring Migration in Port Aransas";
    subtitle = "An Audubon-designated Important Bird Area on the Central Flyway";
  }

  return brandedOG({
    badge,
    title,
    subtitle,
    meta,
    lockupVariant: "standard",
  });
}
