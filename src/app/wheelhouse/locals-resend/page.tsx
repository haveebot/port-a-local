import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LocalsResendForm from "./LocalsResendForm";

export const dynamic = "force-dynamic";

/**
 * Wheelhouse admin tool — re-fire the /locals/offer admin email
 * for an applicant who submitted before the magic-link buttons
 * existed (or any case where Winston needs a fresh email with
 * the new approve/reject/verify-photos buttons).
 */
export default async function LocalsResendPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">
            Locals · Re-fire admin email
          </p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">
            Re-fire admin email for an offer
          </h1>
          <p className="text-sm text-navy-600 mb-5 leading-relaxed">
            Use this when an offer landed before the magic-link approve /
            reject / verify-photos buttons existed (or any case where you
            need a fresh admin email with the new buttons). Creates a DB
            row for the offer + sends a fresh admin email to admin@/hello@
            — does NOT email the applicant (they got their confirmation
            originally).
          </p>
          <LocalsResendForm />
        </section>
      </div>
    </main>
  );
}
