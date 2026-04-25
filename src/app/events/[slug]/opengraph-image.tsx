import { getEventBySlug } from "@/data/events";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";

export const alt = "Port A Local — Event";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
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
          Port A Local — Events
        </div>
      ),
      { ...size },
    );
  }

  return brandedOG({
    badge: `Event · ${event.cost}`,
    badgeIcon: "events",
    title: event.name,
    subtitle: event.tagline,
    meta: event.dateLabel,
    lockupVariant: "standard",
  });
}
