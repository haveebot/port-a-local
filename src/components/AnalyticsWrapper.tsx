"use client";

import { Analytics } from "@vercel/analytics/next";
import type { BeforeSendEvent } from "@vercel/analytics";

/**
 * Wraps Vercel <Analytics /> with a beforeSend filter so admin/operator
 * traffic doesn't pollute the Vercel dashboard.
 *
 * Per Winston rule 2026-04-29 ("clear usable analytics — always"):
 * pageviews from /wheelhouse paths are dropped at source. Vercel never
 * sees them. wheelhouse_analytics_events table query also filters
 * (see getPalStats) so the daily Pulse + orient command stay clean.
 */
export default function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        try {
          const url = event.url || "";
          if (url.includes("/wheelhouse")) return null; // drop admin pageviews
        } catch {
          // ignore — let event through if parsing fails
        }
        return event;
      }}
    />
  );
}
