"use client";

import { track } from "@vercel/analytics";
import type { ComponentPropsWithoutRef } from "react";

/**
 * <TrackedAnchor> — drop-in replacement for <a> that fires a Vercel
 * Analytics custom event on click before the navigation happens.
 *
 * Why: server-rendered links can't fire `track()` directly because it's
 * a client-side function. This wrapper makes one-off click tracking on
 * external / mailto / non-router links a single-line change.
 *
 * Usage:
 *   <TrackedAnchor
 *     href="mailto:..."
 *     event="merch_sighting_clicked"
 *     properties={{ eventSlug: "twat-2026" }}
 *     className="..."
 *   >
 *     Send a sighting photo
 *   </TrackedAnchor>
 */
export default function TrackedAnchor({
  event,
  properties,
  onClick,
  ...rest
}: ComponentPropsWithoutRef<"a"> & {
  event: string;
  properties?: Record<string, string | number | boolean>;
}) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        try {
          track(event, properties);
        } catch {
          // never block navigation on analytics errors
        }
        onClick?.(e);
      }}
    />
  );
}
