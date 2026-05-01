import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  type GlossaryEntry,
  type MarketingStatus,
  getAllGlossaryEntries,
  seedGlossaryIfEmpty,
} from "@/data/glossary-store";
import { INITIAL_GLOSSARY_ENTRIES } from "@/data/glossary-seed";
import EntryRow from "./EntryRow";
import MarketingBreadcrumb from "@/components/wheelhouse/MarketingBreadcrumb";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  transact: { label: "Transact (paid surfaces)", emoji: "💰" },
  editorial: { label: "Editorial (long-form)", emoji: "📝" },
  browse: { label: "Browse (discovery)", emoji: "🔍" },
  civic: { label: "Civic (community)", emoji: "🏛️" },
  internal: { label: "Internal (ops)", emoji: "⚙️" },
};

const STATUS_COUNT_LABELS: Record<MarketingStatus, string> = {
  active: "In the post stack",
  queued: "Queued",
  parked: "Parked",
  "do-not-surface": "Don't surface",
};

export default async function GlossaryPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  // Seed on first load if table is empty (idempotent — won't overwrite
  // anything Collie has already touched).
  await seedGlossaryIfEmpty(INITIAL_GLOSSARY_ENTRIES);

  const entries = await getAllGlossaryEntries();

  // Group by category, preserve display_order
  const byCategory = new Map<string, GlossaryEntry[]>();
  for (const e of entries) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, []);
    byCategory.get(e.category)!.push(e);
  }

  const statusCounts = entries.reduce<Record<MarketingStatus, number>>(
    (acc, e) => {
      acc[e.marketingStatus] = (acc[e.marketingStatus] ?? 0) + 1;
      return acc;
    },
    { active: 0, queued: 0, parked: 0, "do-not-surface": 0 },
  );

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <MarketingBreadcrumb
        crumbs={[
          { label: "🏠 Wheelhouse", href: "/wheelhouse" },
          { label: "📊 Marketing", href: "/wheelhouse/marketing" },
        ]}
        current="📖 Glossary"
        right={
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">
            PAL feature glossary
          </h1>
          <p className="text-sm text-navy-600 leading-relaxed mb-4">
            Live inventory of every PAL feature, grouped by category. Mark each
            one for the marketing pipeline: <strong>active</strong>{" "}
            (in the post stack), <strong>queued</strong> (next up),{" "}
            <strong>parked</strong> (revisit later), or{" "}
            <strong>don&apos;t surface</strong> (internal-only).
            Click any feature to add notes or update its status.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Stat
              label={STATUS_COUNT_LABELS.active}
              value={statusCounts.active}
              tone="emerald"
            />
            <Stat label={STATUS_COUNT_LABELS.queued} value={statusCounts.queued} />
            <Stat label={STATUS_COUNT_LABELS.parked} value={statusCounts.parked} />
            <Stat
              label={STATUS_COUNT_LABELS["do-not-surface"]}
              value={statusCounts["do-not-surface"]}
            />
          </div>
        </section>

        {Array.from(byCategory.entries()).map(([cat, group]) => {
          const meta = CATEGORY_META[cat] ?? { label: cat, emoji: "•" };
          return (
            <section
              key={cat}
              className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm"
            >
              <h2 className="font-display text-xl font-bold mb-1">
                {meta.emoji} {meta.label}
              </h2>
              <p className="text-[11px] text-navy-500 mb-4">
                {group.length} feature{group.length === 1 ? "" : "s"}
              </p>
              <div className="divide-y divide-sand-200">
                {group.map((e, i) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    isFirst={i === 0}
                    isLast={i === group.length - 1}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-[11px] text-navy-400 text-center">
          Glossary auto-seeded on first visit · {entries.length} entries ·
          Collaborator fields (status, notes, order) are{" "}
          <strong>yours</strong> — Claude won&apos;t overwrite. Codebase-side
          fields (name, one-liner, lives-at, bullets) sync from the data files
          (manual for v1).
        </p>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: number;
  tone?: "navy" | "emerald";
}) {
  const valueClass = tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-3">
      <p className={`font-display text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-navy-500 mt-1">
        {label}
      </p>
    </div>
  );
}
