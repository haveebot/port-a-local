import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AgreementGenerator from "./AgreementGenerator";

export const dynamic = "force-dynamic";

/**
 * Bron's rental agreement generator — operator-tier surface.
 *
 * Wheelhouse-gated. The crew fills in customer + booking info, and the
 * tool renders a printable rental agreement merging Bron's liability
 * framework (verified verbatim from bronsbeachcarts.com/policies-%26-
 * regulations) with the per-booking data.
 *
 * Designed for live demo at the walk-in: Winston fills the form → the
 * agreement renders inline on screen → Print/Save-as-PDF and Bron has
 * a customer-ready document in 30 seconds.
 *
 * Sage-pattern verify-on-render — the liability framework is sourced
 * from a single canonical const, not duplicated. Update once, every
 * future agreement reflects it.
 */
export default async function BronsAgreementPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse/brons"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Bron's dashboard
          </Link>
          <p className="font-display font-bold text-sand-50">
            Rental Agreement Generator
          </p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AgreementGenerator />
      </div>
    </main>
  );
}
