import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Island Essentials — everything you need to know about Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Essentials",
    badgeIcon: "essentials",
    title: "Island Essentials",
    subtitle:
      "Ferry times, beach rules, parking, emergency contacts. Everything first-time and returning visitors actually need.",
    lockupVariant: "standard",
  });
}
