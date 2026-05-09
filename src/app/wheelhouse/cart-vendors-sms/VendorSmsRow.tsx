"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface PhoneEntry {
  number: string;
  label: string | null;
  contactName: string | null;
  smsCapable: boolean;
}

interface EmailEntry {
  address: string;
  label: string | null;
  contactName: string | null;
}

interface RowData {
  slug: string;
  name: string;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  firstLookMinutes: number | null;
  primaryPhone: string;
  active: boolean;
  smsCapable: boolean;
  status: "pending" | "opted_in" | "opted_out";
  invitedAt: string | null;
  optedInAt: string | null;
  optedOutAt: string | null;
  lastInboundBody: string | null;
  manualOverride: boolean;
}

const STATUS_PILL: Record<RowData["status"], { label: string; cls: string }> = {
  pending: {
    label: "Pending",
    cls: "bg-sand-200 text-navy-700",
  },
  opted_in: {
    label: "Opted in",
    cls: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  },
  opted_out: {
    label: "Opted out",
    cls: "bg-amber-100 text-amber-800 border border-amber-300",
  },
};

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VendorSmsRow({ row }: { row: RowData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function fire(action: "invite" | "opt-in" | "opt-out") {
    setError(null);
    const confirmMsg =
      action === "invite"
        ? `Send opt-in SMS to ${row.name} (${row.primaryPhone})?`
        : action === "opt-in"
          ? `Manually mark ${row.name} as OPTED IN (verbal consent)?`
          : `Manually mark ${row.name} as OPTED OUT?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/wheelhouse/cart-vendor-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slug: row.slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "request_failed");
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(String(err));
    }
  }

  const pill = STATUS_PILL[row.status];
  const smsCapableCount = row.phones.filter((p) => p.smsCapable).length;
  const emailCount = row.emails.length;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-display font-bold text-navy-900">{row.name}</p>
            <span
              className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${pill.cls}`}
            >
              {pill.label}
            </span>
            {row.firstLookMinutes && row.firstLookMinutes > 0 && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ⏱ {row.firstLookMinutes}m first-look
              </span>
            )}
            {row.manualOverride && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-navy-100 text-navy-700">
                Manual
              </span>
            )}
            {!row.active && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-sand-200 text-navy-500">
                Inactive
              </span>
            )}
            {!row.smsCapable && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-coral-100 text-coral-700 border border-coral-300">
                Landline only
              </span>
            )}
          </div>

          {/* Phones — list all, label per-row */}
          {row.phones.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {row.phones.map((p, idx) => (
                <li
                  key={`${p.number}-${idx}`}
                  className="text-xs text-navy-600 font-mono flex items-center gap-2 flex-wrap"
                >
                  <span>{p.number}</span>
                  {p.label && (
                    <span className="text-[10px] uppercase tracking-wider text-navy-400">
                      {p.label}
                    </span>
                  )}
                  {p.contactName && (
                    <span className="text-[10px] text-navy-400 italic">
                      {p.contactName}
                    </span>
                  )}
                  {!p.smsCapable && (
                    <span className="text-[10px] text-coral-500">(landline)</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Emails — list all */}
          {row.emails.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {row.emails.map((e, idx) => (
                <li
                  key={`${e.address}-${idx}`}
                  className="text-xs text-navy-500 flex items-center gap-2 flex-wrap"
                >
                  <span className="font-mono">{e.address}</span>
                  {e.label && (
                    <span className="text-[10px] uppercase tracking-wider text-navy-400">
                      {e.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Channel summary + invite history */}
          <div className="text-[11px] text-navy-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              SMS-capable: {smsCapableCount}/{row.phones.length}
            </span>
            <span>Emails: {emailCount}</span>
            <span>Invited: {fmtTime(row.invitedAt)}</span>
            {row.status === "opted_in" && (
              <span>Opted in: {fmtTime(row.optedInAt)}</span>
            )}
            {row.status === "opted_out" && (
              <span>Opted out: {fmtTime(row.optedOutAt)}</span>
            )}
          </div>
          {row.lastInboundBody && (
            <p className="text-[11px] text-navy-400 italic mt-1 truncate">
              Last reply: &ldquo;{row.lastInboundBody}&rdquo;
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {row.status === "opted_in" ? (
            <button
              onClick={() => fire("opt-out")}
              disabled={pending}
              className="px-3 py-1.5 text-xs font-bold rounded border border-sand-300 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50"
            >
              Opt out
            </button>
          ) : (
            <>
              <button
                onClick={() => fire("invite")}
                disabled={pending || !row.smsCapable}
                title={!row.smsCapable ? "No SMS-capable phone — invite would fail" : undefined}
                className="px-3 py-1.5 text-xs font-bold rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {row.invitedAt ? "Re-invite" : "Send invite"}
              </button>
              <button
                onClick={() => fire("opt-in")}
                disabled={pending}
                className="px-3 py-1.5 text-[11px] rounded border border-sand-300 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
              >
                Manual opt-in
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-coral-600 mt-2">Error: {error}</p>
      )}
    </div>
  );
}
