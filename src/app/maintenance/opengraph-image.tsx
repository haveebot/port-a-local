import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Property maintenance in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-dynamic";

export default function Image() {
  return brandedOG({
    where: "Order",
    what: "Maintenance",
    pngIcon: "tools",
    title: "Island Property Maintenance",
    subtitle:
      "Standard or priority dispatch. Locally-handled repairs, property checks, and quick fixes — 7 AM to 8 PM, year-round.",
    path: "/maintenance",
    category: "maintenance",
  });
}
