import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port Aransas Fishing Report";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Fishing Report",
    pngIcon: "fish",
    title: "Port A Fishing Report",
    subtitle:
      "Seasonal species, fishing types, TPWD regulations, live conditions, and captain report links.",
    path: "/fishing-report",
    category: "fishing-report",
  });
}
