import { Suspense } from "react";
import GullyContent from "./GullyContent";
import AskGullyTrending from "@/components/AskGullyTrending";

export const dynamic = "force-dynamic";

/**
 * /gully — server component shell. Pre-fetches trending Ask Gully
 * questions (server-side DB read on every request, briefly cached)
 * and passes the rendered chip row down to the client GullyContent
 * as a slot.
 *
 * Server-side fetch keeps the trending data shared across all
 * visitors without the client needing to make its own DB call. Falls
 * through to null when not enough data has accumulated, so the row
 * just doesn't render until there's something real to show.
 */
export default function GullyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-navy-400">Loading Gully...</p>
        </div>
      }
    >
      <GullyContent trendingSlot={<AskGullyTrending variant="gully-empty" />} />
    </Suspense>
  );
}
