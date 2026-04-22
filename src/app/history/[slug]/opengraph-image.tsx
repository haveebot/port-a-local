import { getStoryBySlug } from "@/data/stories";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";
import { emojiToIconName } from "@/components/brand/PortalIcon";

export const alt = "Port A Heritage";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
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
          Port A Heritage
        </div>
      ),
      { ...size }
    );
  }

  return brandedOG({
    badge: `Heritage · ${story.category}`,
    badgeIcon: emojiToIconName[story.icon] ?? "heritage",
    title: story.title,
    subtitle: story.subtitle,
    meta: `${story.readTime} read`,
    lockupVariant: "standard",
  });
}
