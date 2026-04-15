import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

/**
 * Facebook cover / banner — 1640×624 PNG.
 *
 * FB display: 820×312 desktop, 640×360 mobile (mobile crops horizontally).
 * Source 1640×624 = 2× desktop for retina. Mobile safe zone is the center
 * ~1110w of the source, so we place the 897w photo centered with ~371px of
 * navy bleed on each side — fully visible on both desktop and mobile.
 *
 * Design: just the sign. 1939 FSA photo of "STRADDLE THE RAIL AND KEEP
 * ASTRIDE — HARBOR ISLAND CAUSEWAY CO." (Russell Lee, Library of Congress,
 * public domain) centered on a navy field. Profile picture carries the brand.
 *
 * Visit /social/facebook-banner and right-click → Save Image As.
 */

export const runtime = "nodejs";

export async function GET() {
  const photoBuf = fs.readFileSync(
    path.join(process.cwd(), "public/archives/causeway-sign-1939.jpg")
  );
  const photo = `data:image/jpeg;base64,${photoBuf.toString("base64")}`;

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
        {/* 1939 causeway sign — native 1024×712 scaled to 897×624 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} width={897} height={624} alt="" />
      </div>
    ),
    { width: 1640, height: 624 }
  );
}
