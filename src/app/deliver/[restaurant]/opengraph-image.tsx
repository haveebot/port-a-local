import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { getRestaurant } from "@/data/delivery-restaurants";

export const alt = "PAL Delivery — restaurant menu";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image({
  params,
}: {
  params: { restaurant: string };
}) {
  const r = getRestaurant(params.restaurant);
  if (!r) {
    return brandedOG({
      badge: "Delivery · Beta",
      badgeIcon: "eat",
      title: "PAL Delivery",
      subtitle: "Local food, to your beach house.",
      lockupVariant: "standard",
    });
  }
  return brandedOG({
    badge: "Delivery · Beta",
    badgeIcon: "eat",
    title: r.name,
    subtitle: r.shortDescription,
    lockupVariant: "standard",
  });
}
