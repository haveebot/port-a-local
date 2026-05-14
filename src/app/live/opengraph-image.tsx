import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Island Pulse — live conditions and webcams in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Live Conditions",
    badgeIcon: "lighthouse",
    title: "Live from the Island",
    subtitle:
      "Webcams, tides, weather, marine traffic. Real-time conditions on Mustang Island.",
    path: "/live",
    category: "live-conditions",
  });
}
