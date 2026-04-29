import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cartVendors } from "@/data/cart-vendors";
import { getAllConsents } from "@/data/cart-vendor-sms-store";
import VendorSmsRow from "./VendorSmsRow";
import BulkInviteButton from "./BulkInviteButton";

export const dynamic = "force-dynamic";

export default async function CartVendorsSmsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const consents = await getAllConsents();
  const consentBySlug = new Map(consents.map((c) => [c.vendorSlug, c]));

  const rows = cartVendors.map((v) => {
    const c = consentBySlug.get(v.slug);
    return {
      slug: v.slug,
      name: v.name,
      phone: v.phone,
      active: v.active,
      status: c?.status ?? "pending",
      invitedAt: c?.invitedAt ?? null,
      optedInAt: c?.optedInAt ?? null,
      optedOutAt: c?.optedOutAt ?? null,
      lastInboundBody: c?.lastInboundBody ?? null,
      manualOverride: c?.manualOverride ?? false,
    };
  });

  const counts = {
    total: rows.length,
    active: rows.filter((r) => r.active).length,
    invited: rows.filter((r) => r.invitedAt).length,
    optedIn: rows.filter((r) => r.status === "opted_in").length,
    optedOut: rows.filter((r) => r.status === "opted_out").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };

  // Eligible-for-bulk = active + has phone + not yet opted-in or opted-out.
  // Re-running bulk on already-invited vendors re-fires the SMS (idempotent on
  // the DB side); skip the ones who've already responded to avoid noise.
  const bulkEligible = rows.filter(
    (r) => r.active && r.phone && r.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">
            Cart Vendor SMS Opt-In
          </p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">
            SMS opt-in for cart vendors
          </h1>
          <p className="text-sm text-navy-600 mb-4 leading-relaxed">
            A2P 10DLC clearance (campaign C2KO2MB) means PAL can send vendors
            SMS reliably. This page lets you invite each cart vendor to opt in.
            Vendors who reply YES via SMS get added to the lead-blast SMS in
            addition to email. Vendors who reply NO/STOP stay email-only.
            Manual override is available for vendors who consent verbally.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center mb-2">
            <Stat label="Total" value={counts.total} />
            <Stat label="Active" value={counts.active} tone="navy" />
            <Stat label="Invited" value={counts.invited} tone="navy" />
            <Stat label="Opted in" value={counts.optedIn} tone="emerald" />
            <Stat label="Opted out" value={counts.optedOut} tone="navy" />
          </div>
          <p className="text-[11px] text-navy-500">
            Pending = not yet invited or no reply. Re-invite is safe (idempotent).
          </p>

          {bulkEligible > 0 && (
            <div className="mt-5 pt-5 border-t border-sand-200 flex items-center justify-between gap-4">
              <p className="text-sm text-navy-700">
                <strong>{bulkEligible}</strong> vendor{bulkEligible === 1 ? "" : "s"} eligible
                for bulk invite (active + phone + still pending).
              </p>
              <BulkInviteButton eligibleCount={bulkEligible} />
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-4">
            Vendor roster
          </h2>
          <div className="divide-y divide-sand-200">
            {rows.map((r) => (
              <VendorSmsRow key={r.slug} row={r} />
            ))}
          </div>
        </section>

        <p className="text-[11px] text-navy-400 text-center">
          Inbound replies land at <code>/api/twilio/sms/inbound</code>. Configure
          in Twilio Console → Messaging → Services → Inbound Settings.
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
  const valueClass =
    tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-3">
      <p className={`font-display text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-navy-500 mt-1">
        {label}
      </p>
    </div>
  );
}
