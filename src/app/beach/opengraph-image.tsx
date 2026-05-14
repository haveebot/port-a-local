import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Beach cabana, chair, and umbrella rentals in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Order",
    what: "Beach Setup",
    pngIcon: "beach-umbrella",
    title: "Beach Setups, Delivered",
    subtitle:
      "Cabana ($300/day) or chairs & umbrellas ($85/day), set up and taken down for you. Anywhere on Mustang Island.",
    path: "/beach",
    category: "beach",
  });
}
