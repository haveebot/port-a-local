import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "List your stuff or services on PAL Locals";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "PAL Locals · Sign up",
    badgeIcon: "services",
    title: "List your stuff. Or your skills.",
    subtitle:
      "Locals only. Tell us what you rent or what you do. We send you the customers. You keep 100% of your quote — any platform fees are on the customer's side, never deducted from your pay.",
    lockupVariant: "standard",
  });
}
