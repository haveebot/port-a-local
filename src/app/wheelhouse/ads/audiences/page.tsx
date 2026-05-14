import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listCustomAudiences } from "@/lib/metaAds";
import { isMetaConfigured } from "@/lib/metaGraph";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";
import DeleteAudienceButton from "./DeleteAudienceButton";

export const dynamic = "force-dynamic";

function formatRange(
  lower: number | null,
  upper: number | null,
): string {
  if (lower == null && upper == null) return "—";
  if (lower != null && upper != null) {
    if (lower === 0 && upper === 0) return "still populating";
    if (lower === upper) return lower.toLocaleString();
    return `${lower.toLocaleString()}–${upper.toLocaleString()}`;
  }
  return (upper ?? lower ?? 0).toLocaleString();
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AudiencesPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const result = await listCustomAudiences();
  const meta = isMetaConfigured();
  const audiences = result.audiences ?? [];

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
          { label: "🎯 Ads", href: "/wheelhouse/ads" },
        ]}
        current="👥 Audiences"
        right={
          <Link
            href="/wheelhouse/ads/audiences/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-coral-500 text-sand-50 hover:bg-coral-400 transition-colors whitespace-nowrap"
          >
            <span className="text-sm leading-none">+</span> Create audience
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-sand-50 rounded-3xl px-6 py-7 shadow-lg">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Custom Audiences
          </h1>
          <p className="text-coral-200 text-sm leading-relaxed">
            Pixel-defined audiences the Create Ad form pulls from. Build one
            per intent slice — site visitors, cart viewers, paid customers,
            inquiry leads. Meta needs ~24h after creation to populate.
          </p>
          <div className="flex flex-wrap gap-2 text-xs mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${
                meta.fb
                  ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
                  : "bg-navy-500/30 text-navy-100 border-navy-400/40"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  meta.fb ? "bg-emerald-400" : "bg-navy-300"
                }`}
              />
              Marketing API · {result.stubbed ? "stub mode" : "live"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-navy-500/30 text-navy-100 border border-navy-400/40">
              👥 {audiences.length} saved
            </span>
          </div>
        </section>

        {result.error && (
          <section className="bg-coral-50 border border-coral-300 rounded-2xl p-5 text-sm text-coral-900">
            <p className="font-semibold mb-1">
              Couldn&apos;t reach the Marketing API
            </p>
            <p className="text-coral-800 font-mono text-xs">{result.error}</p>
          </section>
        )}

        {result.stubbed && (
          <section className="bg-white border border-sand-300 rounded-2xl p-5 text-sm text-navy-700">
            <p className="font-semibold mb-1">Stub mode</p>
            <p className="text-navy-600 leading-relaxed">
              Audience data goes live once Meta credentials land in Vercel env.
            </p>
          </section>
        )}

        {!result.stubbed && audiences.length === 0 && !result.error && (
          <section className="bg-white border border-sand-300 rounded-2xl p-10 text-center">
            <p className="text-navy-500 font-light">No audiences yet.</p>
            <p className="text-[11px] text-navy-400 mt-2">
              Create one from a Pixel event — e.g. &ldquo;Purchase, last 90
              days&rdquo; or &ldquo;ViewContent on /rent, last 30 days&rdquo;.
            </p>
            <Link
              href="/wheelhouse/ads/audiences/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-sm font-semibold bg-coral-500 text-sand-50 hover:bg-coral-400 transition-colors"
            >
              + Create your first audience
            </Link>
          </section>
        )}

        {audiences.length > 0 && (
          <section className="bg-white border border-sand-300 rounded-2xl overflow-hidden">
            <header className="px-5 py-3 border-b border-sand-200 bg-sand-100/50">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <span>👥</span> Saved audiences
              </h2>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Selectable on the Create Ad form.
              </p>
            </header>
            <ul className="divide-y divide-sand-200">
              {audiences.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 py-3 px-5 text-sm flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-800 font-semibold truncate">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-navy-500 mt-0.5">
                      {a.subtype === "WEBSITE" ? "Website" : a.subtype ?? "—"}
                      {a.retentionDays != null && ` · ${a.retentionDays}d`}
                      {a.timeCreated && ` · ${formatDate(a.timeCreated)}`}
                    </p>
                    {a.description && (
                      <p className="text-[11px] text-navy-400 mt-0.5 truncate">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <p className="text-[11px] text-navy-700 font-semibold">
                      {formatRange(a.countLower, a.countUpper)}
                    </p>
                    {a.deliveryStatus && (
                      <p className="text-[10px] text-navy-500">
                        {a.deliveryStatus}
                      </p>
                    )}
                  </div>
                  <DeleteAudienceButton
                    audienceId={a.id}
                    audienceName={a.name}
                  />
                  <code className="text-[9px] font-mono text-navy-400 w-full">
                    {a.id}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Operator-tier. Pixel-driven audiences populate ~24h after
          creation.
        </p>
      </div>
    </main>
  );
}
