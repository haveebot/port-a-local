import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Father's Day in Port A — Carts, Casts & a Cold One";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Guides",
    pngIcon: "location-heart",
    title: "Father's Day in Port A",
    subtitle:
      "Carts, casts & a cold one — a local's weekend guide for Dad, June 19–21.",
    path: "/guides/fathers-day",
    category: "guides",
  });
}
