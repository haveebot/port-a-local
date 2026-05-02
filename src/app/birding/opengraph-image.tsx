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

  const hasLiveData = radar && radar.combinedAloft > 0;

  const title = hasLiveData
    ? `${radar.combinedAloft.toLocaleString()} birds aloft over the Coastal Bend`
    : "Peak Spring Migration in Port Aransas";

  const subtitle = hasLiveData
    ? "Live BirdCast radar · Aransas + Nueces counties · what's flying, where to look"
    : "An Audubon-designated Important Bird Area on the Central Flyway";

  return brandedOG({
    badge: "Birding · Port A",
    title,
    subtitle,
    lockupVariant: "standard",
  });
}
