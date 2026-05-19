import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Beach setup rentals in Port Aransas — chairs, shade, and gear delivered to the sand";
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
      "Skip the haul. Skip the setup. Local crew has your chairs, shade, and gear waiting on the sand when you walk up.",
    path: "/beach",
    category: "beach",
  });
}
