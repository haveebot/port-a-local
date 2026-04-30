"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BeachVendorStatus } from "@/data/beach-vendor-status";

interface VendorData {
  slug: string;
  name: string;
  role?: string;
  phone: string;
  status: BeachVendorStatus;
}

export default function VendorRow({ vendor }: { vendor: VendorData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onboarded = vendor.status.payoutsEnabled;
  const accountStarted = !!vendor.status.stripeAccountId;

  async function fire(action: "send-onboarding-sms" | "dashboard-link") {
    setError(null);
    setInfo(null);
    if (action === "send-onboarding-sms") {
      if (!confirm(`Text ${vendor.name} the onboarding link to ${vendor.phone}?`)) {
        return;
      }
    }
    setBusy(action);
    try {
      const res = await fetch("/api/wheelhouse/beach-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slug: vendor.slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "request_failed");
        setBusy(null);
        return;
      }
      if (action === "dashboard-link" && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        setInfo("Dashboard opened in new tab");
      }
      if (action === "send-onboarding-sms") {
        setInfo(`Onboarding SMS sent to ${vendor.phone}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-display font-bold text-navy-900">{vendor.name}</p>
            {onboarded ? (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Payouts enabled
              </span>
            ) : accountStarted ? (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Onboarding in flight
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-sand-200 text-navy-700">
                Not onboarded
              </span>
            )}
          </div>
          {vendor.role && (
            <p className="text-xs text-navy-500 mt-0.5">{vendor.role}</p>
          )}
          <p className="text-xs text-navy-500 font-mono mt-1">{vendor.phone}</p>
          {vendor.status.stripeAccountId && (
            <p className="text-[10px] text-navy-400 font-mono mt-1">
              {vendor.status.stripeAccountId}
            </p>
          )}
          {vendor.status.onboardedAt && (
            <p className="text-[10px] text-navy-400 mt-1">
              Onboarded:{" "}
              {new Date(vendor.status.onboardedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {!onboarded && (
            <button
              onClick={() => fire("send-onboarding-sms")}
              disabled={!!busy || pending}
              className="px-3 py-1.5 text-xs font-bold rounded bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50"
            >
              {busy === "send-onboarding-sms" ? "Sending…" : "Text onboarding link"}
            </button>
          )}
          {accountStarted && (
            <button
              onClick={() => fire("dashboard-link")}
              disabled={!!busy || pending}
              className="px-3 py-1.5 text-[11px] rounded border border-sand-300 hover:border-navy-400 hover:bg-navy-50 disabled:opacity-50"
            >
              {busy === "dashboard-link" ? "Loading…" : "Open Stripe dashboard"}
            </button>
          )}
        </div>
      </div>
      {info && <p className="text-[11px] text-emerald-700 mt-2">{info}</p>}
      {error && <p className="text-[11px] text-coral-600 mt-2">Error: {error}</p>}
    </div>
  );
}
