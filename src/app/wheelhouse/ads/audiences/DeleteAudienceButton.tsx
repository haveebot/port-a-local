"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  audienceId: string;
  audienceName: string;
}

/**
 * Delete control on a saved-audience row. Confirms before firing, then
 * DELETEs /api/wheelhouse/audiences/[id] and refreshes the page.
 *
 * Meta soft-deletes — the row disappears from the listing immediately
 * but historical ad attribution stays in Insights.
 */
export default function DeleteAudienceButton({
  audienceId,
  audienceName,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handle() {
    setError(null);
    if (
      !window.confirm(
        `Delete "${audienceName}"? Any active ad using it will keep running but won't be retargetable to a fresh audience until you create a new one.`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/wheelhouse/audiences/${audienceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "delete failed");
        setSubmitting(false);
        return;
      }
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
        className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border bg-white border-coral-300 text-coral-700 hover:bg-coral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting || pending ? "…" : "Delete"}
      </button>
      {error && (
        <span className="text-[10px] text-coral-700 font-mono max-w-[200px] truncate">
          {error}
        </span>
      )}
    </div>
  );
}
