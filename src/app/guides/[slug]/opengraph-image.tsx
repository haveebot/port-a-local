import { guides, getGuideBySlug } from "@/data/guides";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";
import { emojiToIconName } from "@/components/brand/PortalIcon";

export const alt = "Port A Local — Guides";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
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
          Port A Local — Guides
        </div>
      ),
      { ...size },
    );
  }

  return brandedOG({
    badge: "Guides",
    badgeIcon: emojiToIconName[guide.icon] ?? "guides",
    title: guide.title,
    subtitle: guide.subtitle,
    lockupVariant: "standard",
  });
}
