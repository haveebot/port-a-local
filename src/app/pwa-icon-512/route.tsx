import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

/**
 * 512x512 PNG icon for PWA install tiles (Android Chrome,
 * Windows install prompt, etc).
 *
 * Why a route handler instead of a static PNG: PAL doesn't ship a
 * static 512 master file. Generating from /public/logos/lighthouse-full.svg
 * keeps brand fidelity locked to a single source — when the icon
 * gets refined, every consumer (favicon, apple-icon, this PWA tile)
 * picks it up automatically on next deploy.
 *
 * Safe-zone padding: lighthouse drawn at 280×280 inside the 512×512
 * frame leaves ~14% margin on every side, well within the 20% safe
 * zone Android adaptive icons clip to. Combined with the navy
 * background, the icon renders cleanly under round / squircle masks.
 */

export const dynamic = "force-static";
export const runtime = "nodejs";

const SIZE = 512;

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
          backgroundColor: "#0b1120", // navy-900 — matches manifest theme_color
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} width={280} height={280} alt="" />
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
