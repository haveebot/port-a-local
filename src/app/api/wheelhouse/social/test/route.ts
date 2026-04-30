import { NextResponse } from "next/server";
import { isMetaConfigured, pingMeta } from "@/lib/metaGraph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Phase 0 self-check — pings Meta Graph API with the configured
 * Page Access Token and returns the Page name. Lets Winston verify
 * his Phase 0 setup landed correctly without having to manually
 * curl Graph API.
 *
 * Auth: gated by Wheelhouse middleware (cookie/bearer).
 */
export async function GET() {
  const configured = isMetaConfigured();
  const ping = await pingMeta();
  return NextResponse.json({
    configured,
    ping,
    instructions: !ping.ok
      ? {
          envVarsNeeded: [
            "META_PAGE_ID",
            "META_PAGE_ACCESS_TOKEN",
            "META_INSTAGRAM_ACCOUNT_ID (optional, only for IG)",
          ],
          docs:
            "Drop into Vercel env vars (Production scope). Redeploy or hit a fresh request — env vars are read at invocation time.",
        }
      : undefined,
  });
}
