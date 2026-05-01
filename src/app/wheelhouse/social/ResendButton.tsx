"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  postId: number;
}

/**
 * Tiny button on a Recent (sent/skipped/failed) post that re-queues
 * a fresh pending row with the same caption + link + image. Used when
 * a sent post needs to be redone — e.g. broken FB OG cache before
 * delete+repost, caption typo caught after Send, etc.
 */
export default function ResendButton({ postId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onResend() {
    if (!confirm("Re-queue a fresh pending copy of this post?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/wheelhouse/social/${postId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "resend" }),
      });
      const data = (await res.json()) as { error?: string; post?: { id: number } };
      if (!res.ok || !data.post) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <span className="text-[10px] text-coral-700" title={error}>
        ↻ failed
      </span>
    );
  }
  return (
    <button
      onClick={onResend}
      disabled={busy}
      className="text-[11px] font-semibold text-navy-500 hover:text-emerald-700 disabled:opacity-50 whitespace-nowrap"
      title="Re-queue a fresh pending copy of this post"
    >
      {busy ? "…" : "↻ Resend"}
    </button>
  );
}
