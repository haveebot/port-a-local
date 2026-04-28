import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function loadSvg(file: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

export default async function AppleIcon() {
  const lighthouseFull = loadSvg("lighthouse-full.svg");

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
        }}
      >
        {/* Lighthouse drawn at 100×100 inside the 180×180 frame —
            ~22% margin on each side keeps the icon inside iOS's
            home-screen rounded-rect mask without clipping. The
            previous 160px size left only ~6% margin and got
            visually trimmed in some launcher tiles. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lighthouseFull} width={100} height={100} alt="" />
      </div>
    ),
    { ...size }
  );
}
