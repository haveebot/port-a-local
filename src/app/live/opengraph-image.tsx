import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Island Pulse — live conditions and webcams in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "📡 Island Pulse",
    title: "Live from the Island",
    subtitle:
      "Webcams, tides, weather, marine traffic. Real-time conditions on Mustang Island.",
    lockupVariant: "standard",
  });
}
