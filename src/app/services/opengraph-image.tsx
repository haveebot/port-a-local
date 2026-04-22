import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";

export const alt = "Services on Port A Local";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandedOG({
    badge: "Services",
    badgeIcon: "services",
    title: "Island Services",
    subtitle:
      "Book direct through PAL: golf cart rentals, beach setups, property maintenance. Plus vetted service providers from the directory.",
    lockupVariant: "standard",
  });
}
