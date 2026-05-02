import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { liveMusicHeadline } from "@/data/live-music";

export const alt = "Live Music in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  const h = liveMusicHeadline();
  return brandedOG({
    badge: "Live Music",
    badgeIcon: "art",
    title: h.title,
    subtitle: h.ogSubtitle,
    lockupVariant: "standard",
  });
}
