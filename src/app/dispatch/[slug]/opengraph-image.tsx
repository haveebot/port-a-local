import { getDispatchBySlug } from "@/data/dispatches";
import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";

export const alt = "Port A Dispatch";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dispatch = getDispatchBySlug(slug);

  if (!dispatch) {
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
          Port A Dispatch
        </div>
      ),
      { ...size }
    );
  }

  const date = new Date(dispatch.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return brandedOG({
    badge: `🧭 Dispatch · ${dispatch.category}`,
    title: dispatch.title,
    subtitle: dispatch.subtitle,
    meta: `${dispatch.readTime} · ${date}`,
    lockupVariant: "standard",
  });
}
