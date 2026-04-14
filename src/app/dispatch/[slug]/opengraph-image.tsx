import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { getDispatchBySlug } from "@/data/dispatches";

export const alt = "Port A Dispatch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadSvg(file: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dispatch = getDispatchBySlug(slug);
  const lighthouseStandard = loadSvg("lighthouse-standard.svg");

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
        {/* Top — dispatch badge + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 20px",
              borderRadius: 999,
              border: "1px solid rgba(232, 101, 111, 0.4)",
              backgroundColor: "rgba(232, 101, 111, 0.12)",
              color: "#f0a0a6",
              fontSize: 16,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            🧭 Dispatch · {dispatch.category}
          </div>
          <span style={{ color: "#4a5568", fontSize: 16 }}>
            {dispatch.readTime} · {date}
          </span>
        </div>

        {/* Center — title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: dispatch.title.length > 30 ? 60 : 72,
              fontWeight: 800,
              color: "#f5f0e8",
              lineHeight: 1.08,
              maxWidth: 1060,
            }}
          >
            {dispatch.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#8896ab",
              lineHeight: 1.35,
              maxWidth: 960,
              fontWeight: 300,
            }}
          >
            {dispatch.subtitle.length > 160
              ? dispatch.subtitle.slice(0, 160) + "..."
              : dispatch.subtitle}
          </div>
        </div>

        {/* Bottom — PAL lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lighthouseStandard} width={54} height={54} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
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
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Port Aransas, TX
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "#4a5568",
              fontFamily: "monospace",
            }}
          >
            27°50′N · 97°03′W
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
