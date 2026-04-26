import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Drive for PAL Delivery — Port Aransas runners";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Drive for PAL",
    badgeIcon: "services",
    title: "Make beach-day money running PAL deliveries.",
    subtitle:
      "Local runners only. Set your own hours. 100% of tip is yours, paid daily by Venmo. Sign up in two minutes.",
    lockupVariant: "standard",
  });
}
