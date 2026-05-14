"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type CampaignStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED" | string;

interface Props {
  campaignId: string;
  campaignName: string;
  initialStatus: CampaignStatus;
}

/**
 * Pause / Resume control next to a campaign row. POSTs to
 * /api/wheelhouse/ads/[id]/pause | /resume and refreshes the page on
 * success so the new status reflects in the list.
 *
 * Only renders an action when the current status is ACTIVE (→ Pause)
 * or PAUSED (→ Resume). Other statuses (DELETED / ARCHIVED / WITH_ISSUES)
 * render as static text — operator goes to Ads Manager for those.
 */
export default function CampaignStatusToggle({
  campaignId,
  campaignName,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState<CampaignStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  if (status !== "ACTIVE" && status !== "PAUSED") {
    return null;
  }

  const isPause = status === "ACTIVE";
  const label = isPause ? "Pause" : "Resume";
  const verb = isPause ? "pause" : "resume";

  async function handle() {
    setError(null);
    if (
      isPause &&
      !window.confirm(
        `Pause "${campaignName}"? Meta will stop spending on this campaign immediately. You can resume it later.`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/wheelhouse/ads/${campaignId}/${verb}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? `${verb} failed`);
        setSubmitting(false);
        return;
      }
      setStatus(data.newStatus ?? (isPause ? "PAUSED" : "ACTIVE"));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handle}
        disabled={submitting || pending}
        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isPause
            ? "bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-50"
            : "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50"
        }`}
      >
        {submitting || pending ? "…" : label}
      </button>
      {error && (
        <span className="text-[10px] text-coral-700 font-mono max-w-[200px] truncate">
          {error}
        </span>
      )}
    </div>
  );
}
