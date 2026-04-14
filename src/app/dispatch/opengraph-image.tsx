import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "Port A Dispatch — Editorial, analysis, and reporting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadSvg(file: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

export default async function Image() {
  const lighthouseStandard = loadSvg("lighthouse-standard.svg");

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
            gap: 14,
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(232, 101, 111, 0.4)",
            backgroundColor: "rgba(232, 101, 111, 0.12)",
            color: "#f0a0a6",
            fontSize: 18,
            fontWeight: 500,
            alignSelf: "flex-start",
          }}
        >
          🧭 Dispatch
        </div>

        {/* Center */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 800,
              color: "#f5f0e8",
              lineHeight: 1.05,
              maxWidth: 1040,
            }}
          >
            Dispatch
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#8896ab",
              lineHeight: 1.35,
              maxWidth: 900,
              fontWeight: 300,
            }}
          >
            Editorial, analysis, and reporting on the island as it is — not as
            it is advertised.
          </div>
        </div>

        {/* Bottom — lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lighthouseStandard} width={60} height={60} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#e8656f",
                  letterSpacing: "0.04em",
                }}
              >
                PORT A LOCAL
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#4a5568",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                Port Aransas, TX
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 16,
              color: "#4a5568",
              fontFamily: "monospace",
            }}
          >
            theportalocal.com/dispatch
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
