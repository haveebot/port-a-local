import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBoostConfigured } from "@/lib/metaAds";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";
import CreateAudienceForm from "./CreateAudienceForm";

export const dynamic = "force-dynamic";

export default async function NewAudiencePage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const cfg = isBoostConfigured();
  const stubMode = !cfg.ok;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null;

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
          { label: "🎯 Ads", href: "/wheelhouse/ads" },
          { label: "👥 Audiences", href: "/wheelhouse/ads/audiences" },
        ]}
        current="✨ New audience"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-sand-50 rounded-3xl px-6 py-6 shadow-lg">
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            New audience
          </h1>
          <p className="text-coral-200 text-sm leading-relaxed">
            Pick a Pixel event and a lookback window. Meta builds the
            audience from people who fired that event on the site within
            the window. Populates ~24h after creation.
          </p>
        </section>

        {stubMode && (
          <section className="bg-white border border-sand-300 rounded-2xl p-5 text-sm text-navy-700">
            <p className="font-semibold mb-1">Stub mode</p>
            <p className="text-navy-600 leading-relaxed">
              Marketing API creds missing. Submits return fake audience IDs
              until env is wired.
            </p>
          </section>
        )}

        {!pixelId && !stubMode && (
          <section className="bg-coral-50 border border-coral-300 rounded-2xl p-5 text-sm text-coral-900">
            <p className="font-semibold mb-1">Pixel not configured</p>
            <p className="text-coral-800 leading-relaxed">
              <code className="font-mono text-xs bg-coral-100 px-1 rounded">
                NEXT_PUBLIC_META_PIXEL_ID
              </code>{" "}
              isn&apos;t set. Add it in Vercel env before creating audiences.
            </p>
          </section>
        )}

        <CreateAudienceForm />
      </div>
    </main>
  );
}
