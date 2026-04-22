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
      "Reserve a cart delivered right to your door. $10 reservation fee locks it in. Paid through Port A Local.",
    lockupVariant: "standard",
  });
}
