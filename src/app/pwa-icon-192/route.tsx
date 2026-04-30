import { ImageResponse } from "next/og";
import { PWA_LIGHTHOUSE_DATA_URL, PWA_NAVY_BG } from "@/lib/pwaLighthouseSvg";

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
        <img src={PWA_LIGHTHOUSE_DATA_URL} width={108} height={108} alt="" />
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
