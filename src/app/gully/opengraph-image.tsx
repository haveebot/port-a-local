import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Gully — Port A's local search engine";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🔍 Gully",
    title: "Just Gully It",
    subtitle:
      "Port A's local search engine. Every business, every heritage story, every dispatch — one unified index. Built by locals.",
    lockupVariant: "standard",
  });
}
