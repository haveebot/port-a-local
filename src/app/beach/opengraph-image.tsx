import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Beach cabana, chair, and umbrella rentals in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Beach Setup",
    badgeIcon: "beach",
    title: "Beach Setups, Delivered",
    subtitle:
      "Cabana ($300/day) or chairs & umbrellas ($85/day), set up and taken down for you. Anywhere on Mustang Island.",
    lockupVariant: "standard",
  });
}
