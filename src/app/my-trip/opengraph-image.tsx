import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "My Trip — saved spots in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "❤️ My Trip",
    title: "Your Port A, Saved",
    subtitle:
      "Pin businesses, heritage stories, and dispatch pieces. Plan the trip you want, with the places you actually care about.",
    lockupVariant: "standard",
  });
}
