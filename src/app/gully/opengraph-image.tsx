import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Gully — Port A's local search engine";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Gully",
    badgeIcon: "lighthouse",
    title: "Just Gully It",
    subtitle:
      "Port A's local search engine. Every business, every heritage story, every dispatch — one unified index. Built by locals.",
    path: "/gully",
    category: "gully",
  });
}
