import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "The 4th of July in Port A — Fireworks, Parade & Beach Days";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Guides",
    pngIcon: "calendar",
    title: "The 4th of July in Port A",
    subtitle:
      "Fireworks, live music & beach days — a local's guide to July 4 weekend.",
    path: "/guides/fourth-of-july",
    category: "guides",
  });
}
