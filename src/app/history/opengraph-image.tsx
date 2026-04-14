import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port A Heritage — 21 stories of Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "📖 Heritage",
    title: "Port A Heritage",
    subtitle:
      "The people, places, and moments that shaped Port Aransas. Preserved by locals, built to last.",
    lockupVariant: "standard",
  });
}
