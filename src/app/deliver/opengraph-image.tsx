import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "PAL Delivery — local food to your beach house";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Delivery · Beta",
    badgeIcon: "eat",
    title: "Local food, to your beach house.",
    subtitle:
      "Real Port Aransas spots. Local drivers. No app. PAL picks up, PAL delivers — you eat on the porch.",
    lockupVariant: "standard",
  });
}
