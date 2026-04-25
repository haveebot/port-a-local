import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Tournament Season — Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return brandedOG({
    badge: "Tournament Season",
    badgeIcon: "events",
    title: "Port Aransas's summer fishing fixture",
    subtitle:
      "Four marquee tournaments July–August. DSR. Pachanga. Texas Legends. TWAT. The local handle for the cluster.",
    meta: "May–November · 20+ tournaments",
    lockupVariant: "standard",
  });
}
