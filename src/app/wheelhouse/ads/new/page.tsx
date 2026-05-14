import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSentPostsToCheck, type SocialPost } from "@/data/social-post-store";
import { isBoostConfigured, listCustomAudiences } from "@/lib/metaAds";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";
import CreateAdForm from "./CreateAdForm";

export const dynamic = "force-dynamic";

/**
 * Create Ad — operator-facing form for launching a dedicated Meta ad
 * campaign on an existing sent FB post. Distinct from Boost (which has
 * a fixed Traffic objective + $5/day cap); this exposes objective +
 * larger caps ($50/day, 30 days).
 *
 * Server component pulls the list of eligible sent posts + the stub-mode
 * flag, then hands off to the CreateAdForm client component for the
 * interactive submit flow.
 */

interface PromotablePost {
  id: number;
  caption: string;
  externalPostId: string;
  channel: string;
  sentAt: string | null;
}

function toPromotable(p: SocialPost): PromotablePost {
  return {
    id: p.id,
    caption: p.caption,
    externalPostId: p.externalPostId ?? "",
    channel: p.channel,
    sentAt: p.sentAt,
  };
}

export default async function NewAdPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  // getSentPostsToCheck already filters: status=sent, has external_post_id,
  // not a stub:* id, not marked removed from FB. Exactly the eligibility
  // criteria for promoting via the Marketing API.
  const sent = await getSentPostsToCheck();
  // FB-only — IG posts can't be boosted via the same Marketing-API
  // post-based flow (separate Instagram-ad path required).
  const eligible = sent
    .filter((p) => p.channel === "facebook")
    .map(toPromotable);

  const audienceResult = await listCustomAudiences();
  const audiences = (audienceResult.audiences ?? []).map((a) => ({
    id: a.id,
    name: a.name,
  }));

  const cfg = isBoostConfigured();
  const stubMode = !cfg.ok;

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
          { label: "🎯 Ads", href: "/wheelhouse/ads" },
        ]}
        current="✨ New ad"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-sand-50 rounded-3xl px-6 py-6 shadow-lg">
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            New ad
          </h1>
          <p className="text-coral-200 text-sm leading-relaxed">
            Promote an existing sent post as a dedicated campaign — pick
            your objective, budget, and duration.
          </p>
        </section>

        {stubMode && (
          <section className="bg-white border border-sand-300 rounded-2xl p-5 text-sm text-navy-700">
            <p className="font-semibold mb-1">Stub mode</p>
            <p className="text-navy-600 leading-relaxed">
              <code className="font-mono text-xs bg-sand-100 px-1 rounded">
                META_AD_ACCOUNT_ID
              </code>{" "}
              isn&apos;t set. Submits will create stubbed records and return
              fake IDs until Marketing API env is wired.
            </p>
          </section>
        )}

        {eligible.length === 0 ? (
          <section className="bg-white border border-sand-300 rounded-2xl p-10 text-center">
            <p className="text-navy-700 font-semibold mb-2">
              No promotable posts yet
            </p>
            <p className="text-sm text-navy-500 max-w-md mx-auto leading-relaxed">
              Send a Facebook post from{" "}
              <code className="font-mono text-xs bg-sand-100 px-1 rounded">
                /wheelhouse/social
              </code>{" "}
              first — ads must point at an existing live FB post.
            </p>
          </section>
        ) : (
          <CreateAdForm posts={eligible} audiences={audiences} />
        )}
      </div>
    </main>
  );
}
