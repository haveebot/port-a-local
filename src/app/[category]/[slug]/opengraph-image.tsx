import { getBusinessBySlug, getAllBusinessSlugs } from "@/data/businesses";
import { getCategoryBySlug } from "@/data/categories";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";
import type { PortalIconName } from "@/components/brand/PortalIcon";

export const alt = "Port A Local — Business";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getAllBusinessSlugs();
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const business = getBusinessBySlug(slug);

  if (!business) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0b1120",
            color: "#f5f0e8",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Port A Local
        </div>
      ),
      { ...size },
    );
  }

  const cat = getCategoryBySlug(business.category);
  const badgeText = cat ? cat.name : "Port A Local";

  return brandedOG({
    badge: badgeText,
    badgeIcon: business.category as PortalIconName,
    title: business.name,
    subtitle: business.tagline,
    lockupVariant: "standard",
  });
}
