import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port A Heritage — 21 stories of Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Discover",
    what: "Heritage",
    badgeIcon: "lighthouse",
    title: "Port A Heritage",
    subtitle:
      "The people, places, and moments that shaped Port Aransas. Preserved by locals, built to last.",
    body: "21 stories · built to last",
    path: "/history",
    category: "heritage",
  });
}
