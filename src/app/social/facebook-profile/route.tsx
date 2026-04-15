import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

/**
 * Facebook profile picture — 1000×1000 PNG.
 *
 * FB displays at 170×170 desktop / 128×128 mobile, cropped to a circle.
 * We export at 1000×1000 for retina quality. The lighthouse is scaled
 * and centered to stay inside the circle's safe zone (~80% diameter).
 *
 * Visit /social/facebook-profile and right-click → Save Image As.
 */

export const runtime = "nodejs";

/**
 * Retint the static lighthouse SVG from "dark" variant (navy on sand) to
 * "light" variant (sand on navy) using a tokenized swap.
 */
function loadLighthouseLight(filename: string): string {
  const raw = fs
    .readFileSync(path.join(process.cwd(), "public/logos", filename))
    .toString("utf-8");
  const retinted = raw
    .replace(/#0b1120/gi, "__INK__")
    .replace(/#1e3a5f/gi, "__SHADOW__")
    .replace(/#f5f0e8/gi, "__PAPER__")
    .replace(/__INK__/g, "#f5f0e8")
    .replace(/__SHADOW__/g, "#d4c9b8")
    .replace(/__PAPER__/g, "#0b1120");
  return `data:image/svg+xml;base64,${Buffer.from(retinted).toString("base64")}`;
}

export async function GET() {
  const lighthouse = loadLighthouseLight("lighthouse-standard.svg");

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
        <img src={lighthouse} width={680} height={680} alt="" />
      </div>
    ),
    { width: 1000, height: 1000 }
  );
}
