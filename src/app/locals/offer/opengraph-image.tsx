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
      "Locals only. Tell us what you want to rent or what you do for money. We send you the customers — no commitment, no fee until you make money.",
    lockupVariant: "standard",
  });
}
