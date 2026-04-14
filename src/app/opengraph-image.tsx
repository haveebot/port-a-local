import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "Port A Local — Port Aransas, TX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadSvg(file: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

export default async function Image() {
  const lighthouseFull = loadSvg("lighthouse-full.svg");

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
          padding: "70px 80px",
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(232, 101, 111, 0.3)",
            backgroundColor: "rgba(232, 101, 111, 0.1)",
            color: "rgba(232, 101, 111, 0.9)",
            fontSize: 18,
            fontWeight: 500,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#e8656f",
            }}
          />
          theportalocal.com
        </div>

        {/* Center — lighthouse + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lighthouseFull} width={220} height={220} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                color: "#e8656f",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              PORT A LOCAL
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#8896ab",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: 14,
                fontWeight: 500,
              }}
            >
              Port Aransas, TX
            </div>
          </div>
        </div>

        {/* Bottom — tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#f5f0e8",
              lineHeight: 1.3,
              fontWeight: 300,
              maxWidth: 900,
            }}
          >
            The local guide. Heritage. Dispatch. Find what is on the island.
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#4a5568",
              fontFamily: "monospace",
              marginTop: 4,
            }}
          >
            27°50′N · 97°03′W
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
