import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port Aransas Historical Archives";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🏛️ Archives",
    title: "Historical Archives",
    subtitle:
      "Public-domain photographs of Port Aransas, 1853–2017. The largest organized digital archive of the island, anywhere.",
    lockupVariant: "standard",
  });
}
