import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listImages } from "@/data/image-library-store";
import BankUploadZone from "./BankUploadZone";
import BankImageCard from "./BankImageCard";

export const dynamic = "force-dynamic";

/**
 * The Bank — Collie's social image collateral.
 *
 * One store, two entry points: upload here directly, or upload from a
 * social post card (which writes here too). Either way, every image
 * Collie has used or wants to use lives in this catalog.
 *
 * Soft delete only — hidden images keep their URL live since FB posts
 * that already shipped reference them.
 */
export default async function BankPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const images = await listImages({ limit: 200 });

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse/social"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Social
          </Link>
          <p className="font-display font-bold text-sand-50">Bank</p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            image collateral
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-1">The Bank</h1>
          <p className="text-xs text-navy-500 mb-4">
            Drop images here once → pick from any social post via the picker.
            Or upload directly from a post card and it lands here too.
          </p>
          <BankUploadZone />
        </section>

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display text-xl font-bold">
              Images · {images.length}
            </h2>
            <p className="text-[11px] text-navy-400">
              Newest first. Click to edit alt text or hide.
            </p>
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-navy-500 italic">
              The Bank is empty. Drop an image above or upload from any
              social post card to start stocking it.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <BankImageCard key={img.id} image={img} />
              ))}
            </div>
          )}
        </section>

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Soft delete only — hidden images keep working for FB posts that
          already shipped. Restore via the per-image edit panel.
        </p>
      </div>
    </main>
  );
}
