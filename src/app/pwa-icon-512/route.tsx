import { ImageResponse } from "next/og";
import { PWA_LIGHTHOUSE_DATA_URL, PWA_NAVY_BG } from "@/lib/pwaLighthouseSvg";

/**
 * 512x512 PNG icon for PWA install tiles (Android Chrome,
 * Windows install prompt, etc).
 *
 * Safe-zone padding: lighthouse drawn at 280×280 inside the 512×512
 * frame leaves ~22% margin on every side, well within the 20% safe
 * zone Android adaptive icons clip to. Combined with the navy
 * background, the icon renders cleanly under round / squircle masks.
 */

export const dynamic = "force-static";
export const runtime = "nodejs";

const SIZE = 512;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: PWA_NAVY_BG,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PWA_LIGHTHOUSE_DATA_URL} width={280} height={280} alt="" />
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
