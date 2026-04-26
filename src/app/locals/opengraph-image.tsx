import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "PAL Locals — rent gear, hire services in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Locals",
    badgeIcon: "services",
    title: "Rent it. Hire them. From locals.",
    subtitle:
      "Real Port Aransas locals with stuff to rent and skills to bring to your trip. Beach gear, watercraft, photographers, captains, errand runners — the actual people who live here.",
    lockupVariant: "standard",
  });
}
