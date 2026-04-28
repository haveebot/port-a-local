import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

/**
 * 192x192 PNG icon — the smaller PWA install tile size (used by
 * older Android, some launchers, the Chrome install card).
 * Mirrors /pwa-icon-512 — same lighthouse, same navy bg, same
 * safe-zone proportions, just sized down.
 */

export const dynamic = "force-static";
export const runtime = "nodejs";

const SIZE = 192;

export async function GET() {
  const svgPath = path.join(process.cwd(), "public/logos/lighthouse-full.svg");
  const svgBuf = fs.readFileSync(svgPath);
  const dataUrl = `data:image/svg+xml;base64,${svgBuf.toString("base64")}`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} width={108} height={108} alt="" />
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
