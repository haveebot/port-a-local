import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port Aransas Fishing Report";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    badge: "Fishing Report",
    badgeIcon: "fish",
    title: "Port A Fishing Report",
    subtitle:
      "Seasonal species, fishing types, TPWD regulations, live conditions, and captain report links.",
    lockupVariant: "standard",
    category: "fishing-report",
  });
}
