import { ImageResponse } from "next/og";
import { PWA_LIGHTHOUSE_DATA_URL, PWA_NAVY_BG } from "@/lib/pwaLighthouseSvg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
        {/* Lighthouse drawn at 100×100 inside the 180×180 frame —
            ~22% margin on each side keeps the icon inside iOS's
            home-screen rounded-rect mask without clipping. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PWA_LIGHTHOUSE_DATA_URL} width={100} height={100} alt="" />
      </div>
    ),
    { ...size },
  );
}
