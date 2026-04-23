import { getCategoryBySlug, categories } from "@/data/categories";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";
import type { PortalIconName } from "@/components/brand/PortalIcon";

export const alt = "Port A Local — Directory";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
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

  return brandedOG({
    badge: "Directory",
    badgeIcon: cat.slug as PortalIconName,
    title: cat.name,
    subtitle: cat.description,
    lockupVariant: "standard",
  });
}
