import { ImageResponse } from "next/og";
import { getStoryBySlug, stories } from "@/data/stories";

export const alt = "Port A Heritage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
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
          Port A Local
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0b1120",
          padding: "60px 70px",
        }}
      >
        {/* Top — badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(232, 101, 111, 0.3)",
              backgroundColor: "rgba(232, 101, 111, 0.1)",
              color: "rgba(232, 101, 111, 0.9)",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            📖 Port A Heritage
          </div>
          <span style={{ color: "#4a5568", fontSize: 16 }}>
            {story.readTime} read
          </span>
        </div>

        {/* Center — title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: 56,
            }}
          >
            <span>{story.icon}</span>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f5f0e8",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {story.title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#8896ab",
              lineHeight: 1.4,
              maxWidth: "800px",
              fontWeight: 300,
            }}
          >
            {story.subtitle.length > 120
              ? story.subtitle.slice(0, 120) + "..."
              : story.subtitle}
          </div>
        </div>

        {/* Bottom — branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#e8656f",
                letterSpacing: "0.05em",
              }}
            >
              PORT A LOCAL
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#4a5568",
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                marginTop: "2px",
              }}
            >
              Port Aransas, TX
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#4a5568" }}>
            theportalocal.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
