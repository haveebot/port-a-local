import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Events & Happenings in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🎪 Events",
    title: "Events & Happenings",
    subtitle:
      "Annual festivals, recurring gatherings, and what is actually happening on the island this month.",
    lockupVariant: "standard",
  });
}
