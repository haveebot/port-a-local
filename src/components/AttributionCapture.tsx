"use client";

import { useEffect } from "react";
import { captureAttributionFromLocation } from "@/lib/attribution";

/**
 * AttributionCapture — site-wide, renders nothing. On first mount it
 * lifts fbclid / utm_* off the landing URL into the first-party
 * `pal_attrib` cookie (see src/lib/attribution.ts). No-op when the URL
 * carries no tracking params, so organic navigation never clobbers a
 * stored ad touch.
 *
 * Mounted once in the root layout body, next to VisitorHeartbeat. Pairs
 * with the Meta Pixel base script in <head> — the pixel sets _fbp/_fbc;
 * this captures the campaign tags + click ID we read at checkout time.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);
  return null;
}
