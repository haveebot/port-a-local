import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  cartVendors,
  hasSmsCapablePhone,
  primaryPhoneFor,
} from "@/data/cart-vendors";
import { getAllConsents } from "@/data/cart-vendor-sms-store";
import { getRecentFirstLookActivity } from "@/data/cart-rental-first-look-store";
import VendorSmsRow from "./VendorSmsRow";
import BulkInviteButton from "./BulkInviteButton";
import FirstLookPanel from "./FirstLookPanel";

export const dynamic = "force-dynamic";

export default async function CartVendorsSmsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const [consents, firstLookActivity] = await Promise.all([
    getAllConsents(),
    getRecentFirstLookActivity(20),
  ]);
  const consentBySlug = new Map(consents.map((c) => [c.vendorSlug, c]));

  const rows = cartVendors.map((v) => {
    const c = consentBySlug.get(v.slug);
    return {
      slug: v.slug,
      name: v.name,
      phones: v.phones.map((p) => ({
        number: p.number,
        label: p.label ?? null,
        contactName: p.contactName ?? null,
        smsCapable: p.smsCapable !== false,
      })),
      emails: v.emails.map((e) => ({
        address: e.address,
        label: e.label ?? null,
        contactName: e.contactName ?? null,
      })),
      firstLookMinutes: v.firstLookMinutes ?? null,
      primaryPhone: primaryPhoneFor(v),
      active: v.active,
      smsCapable: hasSmsCapablePhone(v),
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

  // Blast roster = active + SMS-capable + NOT opted-out. This is the actual
  // group that receives lead-blast SMS under the default-opt-in policy.
  const blastRoster = rows.filter(
    (r) =>
      r.active &&
      r.primaryPhone &&
      r.smsCapable &&
      r.status !== "opted_out",
  ).length;

  // Courtesy-invite-eligible = active + SMS-capable + not yet invited.
  // Used for the optional bulk courtesy intro send.
  const bulkEligible = rows.filter(
    (r) => r.active && r.primaryPhone && r.smsCapable && !r.invitedAt,
  ).length;
  const landlineOnly = rows.filter((r) => r.active && !r.smsCapable).length;

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
        <FirstLookPanel activity={firstLookActivity} />

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">
            Cart vendor SMS roster
          </h1>
          <p className="text-sm text-navy-600 mb-4 leading-relaxed">
            <strong>Policy (2026-04-29):</strong> all cart vendors in the directory are
            treated as default opt-in for the lead-blast SMS. Manual opt-out (STOP /
            NO reply) is the only way they don&apos;t receive alerts. Manual opt-in
            via courtesy invite is optional — used to flag vendors who explicitly
            confirmed (audit / tracking only, no behavior change). A2P 10DLC clearance
            (campaign C2KO2MB) means SMS routes through the verified pipe.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center mb-2">
            <Stat label="Blast roster" value={blastRoster} tone="emerald" />
            <Stat label="Active" value={counts.active} tone="navy" />
            <Stat label="Confirmed opt-in" value={counts.optedIn} tone="navy" />
            <Stat label="Opted out" value={counts.optedOut} tone="navy" />
            <Stat label="Total" value={counts.total} tone="navy" />
          </div>
          <p className="text-[11px] text-navy-500">
            <strong>Blast roster</strong> = active + SMS-capable + not opted-out (the actual lead-blast targets).
            <strong> Confirmed opt-in</strong> = audit-only (vendor explicitly replied YES).
            {landlineOnly > 0 && (
              <>
                {" "}
                <strong>{landlineOnly}</strong> vendor{landlineOnly === 1 ? "" : "s"} marked
                landline-only (Twilio error 30006) — collect a mobile cell to add to the roster.
              </>
            )}
          </p>

          {bulkEligible > 0 ? (
            <div className="mt-5 pt-5 border-t border-sand-200 flex items-center justify-between gap-4">
              <p className="text-sm text-navy-700">
                <strong>{bulkEligible}</strong> vendor{bulkEligible === 1 ? "" : "s"} not yet sent the courtesy intro SMS.
                <span className="text-[11px] text-navy-500 block mt-1">Optional — they&apos;re already in the blast roster by default.</span>
              </p>
              <BulkInviteButton eligibleCount={bulkEligible} />
            </div>
          ) : counts.invited > 0 ? (
            <div className="mt-5 pt-5 border-t border-sand-200">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <span className="text-base">✓</span>
                All <strong>{counts.invited}</strong> SMS-capable vendor{counts.invited === 1 ? "" : "s"} have received the courtesy intro.
              </p>
              <p className="text-[11px] text-navy-500 mt-1">
                Use the per-row <strong>Re-invite</strong> button to re-send the intro to a specific vendor.
                The bulk action returns automatically when new SMS-capable vendors are added.
              </p>
            </div>
          ) : null}
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
