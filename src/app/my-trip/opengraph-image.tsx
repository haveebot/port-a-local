import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "My Trip — saved spots in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Plan",
    what: "My Trip",
    pngIcon: "location-heart",
    title: "Your Port A, Saved",
    subtitle:
      "Pin businesses, heritage stories, and dispatch pieces. Plan the trip you want, with the places you actually care about.",
    path: "/my-trip",
    category: "my-trip",
  });
}
