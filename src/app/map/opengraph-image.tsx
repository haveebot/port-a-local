import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port Aransas Interactive Map";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🗺️ Map",
    title: "The Island, Mapped",
    subtitle:
      "Every business on Port A Local, placed on real coordinates. 127+ spots across Mustang Island.",
    lockupVariant: "standard",
  });
}
