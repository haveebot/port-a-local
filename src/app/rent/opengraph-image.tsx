import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Golf cart rentals in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Rent a Cart",
    badgeIcon: "cart",
    title: "Golf Cart Rentals",
    subtitle:
      "Book through PAL — we route your reservation to 20+ Port A cart shops. First to claim wins, $20+ discount baked in. Pickup or delivery, vendor's call.",
    lockupVariant: "standard",
  });
}
