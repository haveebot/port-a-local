import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port Aransas Curated Guides";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Guides",
    pngIcon: "location-heart",
    title: "Curated Guides",
    subtitle:
      "Happy Hour, Pet-Friendly, Date Night, Seafood, and more. Honest shortlists built from the directory — not promoted placements.",
    path: "/guides",
    category: "guides",
  });
}
