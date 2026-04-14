import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port A Through Your Eyes";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "📸 Community Photos",
    title: "Port A Through Your Eyes",
    subtitle:
      "The island, as locals and visitors see it. Anonymous submissions welcome.",
    lockupVariant: "standard",
  });
}
