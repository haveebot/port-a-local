import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Drive for PAL Delivery — Port Aransas runners";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Run for PAL",
    badgeIcon: "services",
    title: "Make beach-day money running local food.",
    subtitle:
      "Half the markup is yours. 100% of every tip is yours. Daily payouts to your bank. Local runners only.",
    lockupVariant: "standard",
  });
}
