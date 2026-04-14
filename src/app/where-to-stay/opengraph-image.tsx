import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Where to Stay in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🏠 Where to Stay",
    title: "Where to Stay",
    subtitle:
      "Neighborhoods, lodging styles, and how to pick where on the island fits how you want to be here.",
    lockupVariant: "standard",
  });
}
