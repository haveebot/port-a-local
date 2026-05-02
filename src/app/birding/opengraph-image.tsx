import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { fetchBirdCastSnapshot } from "@/lib/birdcast";

export const alt = "Birding in Port Aransas — peak migration";
export const size = ogSize;
export const contentType = ogContentType;

/**
 * Dynamic OG for /birding — pulls live BirdCast counts so the FB share
 * card reflects what's actually flying right now. If radar isn't
 * showing active migration (daytime, off-season), falls back to the
 * static "premier birding destination" framing.
 *
 * Like the live-music OG, this is generated fresh on each scrape +
 * cached at the framework layer. Cornell Lab BirdCast publishes new
 * data every 10 min during migration season.
 */
export default async function Image() {
  const radar = await fetchBirdCastSnapshot().catch(() => null);

  // Prefer the cumulative ~12hr crossing total (impressive nighttime number)
  // over the instantaneous aloft snapshot (small during day). If neither is
  // available, fall back to evergreen framing.
  const recentTotal = Math.round(radar?.recentTotalCombined ?? 0);
  const hasRecentTotal = recentTotal > 100; // skip noise; only show meaningful sums
  const aloftNow = Math.round(radar?.combinedAloft ?? 0);

  let title: string;
  let subtitle: string;

  if (hasRecentTotal) {
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
    badge: "Birding · Port A",
    title,
    subtitle,
    lockupVariant: "standard",
  });
}
