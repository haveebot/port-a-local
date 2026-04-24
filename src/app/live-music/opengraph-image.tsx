import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Live Music Tonight in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Live Music",
    badgeIcon: "art",
    title: "Live Music Tonight",
    subtitle:
      "Who is playing where across the island — The Gaff, Shorty's, Bron's, Treasure Island, Sip Yard, VFW, Salty Dog.",
    lockupVariant: "standard",
  });
}
