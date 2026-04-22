import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Port A Dispatch — Features, analysis and reporting";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "🧭 Dispatch",
    title: "Dispatch",
    subtitle:
      "Features, analysis and reporting on the island as it is — not as it's advertised.",
    lockupVariant: "standard",
  });
}
