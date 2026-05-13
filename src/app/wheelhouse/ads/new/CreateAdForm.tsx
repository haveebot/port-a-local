"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Client-side form for POST /api/wheelhouse/ads/create. Server-side
 * page resolves the eligible-post list + stub-mode flag and passes them
 * in as props; this component only owns the interactive state.
 */

interface PromotablePost {
  id: number;
  caption: string;
  externalPostId: string;
  channel: string;
  sentAt: string | null;
}

const OBJECTIVES: { value: string; label: string; helper: string }[] = [
  {
    value: "OUTCOME_TRAFFIC",
    label: "Traffic",
    helper: "Drive clicks to a link. Default for most posts.",
  },
  {
    value: "OUTCOME_AWARENESS",
    label: "Awareness",
    helper: "Maximize reach across a wider audience.",
  },
  {
    value: "OUTCOME_ENGAGEMENT",
    label: "Engagement",
    helper: "Optimize for likes, comments, shares on the post.",
  },
  {
    value: "OUTCOME_LEADS",
    label: "Leads",
    helper: "Generate signups / form fills (requires lead form).",
  },
];

const MIN_BUDGET_DOLLARS = 1;
const MAX_BUDGET_DOLLARS = 50;
const MIN_DURATION_DAYS = 1;
const MAX_DURATION_DAYS = 30;

function previewCaption(p: PromotablePost): string {
  const clean = p.caption.replace(/\s+/g, " ").trim();
  return clean.length > 70 ? `${clean.slice(0, 70)}…` : clean;
}

function formatSent(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function CreateAdForm({ posts }: { posts: PromotablePost[] }) {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [postId, setPostId] = useState<number | "">(
    posts[0]?.id ?? "",
  );
  const [budgetDollars, setBudgetDollars] = useState<string>("5");
  const [durationDays, setDurationDays] = useState<string>("7");
  const [audienceId, setAudienceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === postId) ?? null;
  const objectiveHelper =
    OBJECTIVES.find((o) => o.value === objective)?.helper ?? "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = campaignName.trim();
    if (name.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (!selectedPost) {
      setError("Pick a post to promote.");
      return;
    }
    const budgetNum = Number(budgetDollars);
    if (
      !Number.isFinite(budgetNum) ||
      budgetNum < MIN_BUDGET_DOLLARS ||
      budgetNum > MAX_BUDGET_DOLLARS
    ) {
      setError(
        `Daily budget must be $${MIN_BUDGET_DOLLARS}–$${MAX_BUDGET_DOLLARS}.`,
      );
      return;
    }
    const durationNum = Number(durationDays);
    if (
      !Number.isFinite(durationNum) ||
      !Number.isInteger(durationNum) ||
      durationNum < MIN_DURATION_DAYS ||
      durationNum > MAX_DURATION_DAYS
    ) {
      setError(
        `Duration must be a whole number ${MIN_DURATION_DAYS}–${MAX_DURATION_DAYS}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wheelhouse/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          campaignName: name,
          externalPostId: selectedPost.externalPostId,
          sourcePostId: selectedPost.id,
          dailyBudgetCents: Math.round(budgetNum * 100),
          durationDays: durationNum,
          audienceId: audienceId.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.ok) {
        setError(
          data.detail ??
            data.error ??
            `Create failed (HTTP ${res.status}).`,
        );
        setSubmitting(false);
        return;
      }
      router.replace("/wheelhouse/ads");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-sand-300 rounded-2xl p-6 space-y-5 shadow-sm"
    >
      {/* NAME */}
      <div>
        <label
          htmlFor="campaign-name"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Name
        </label>
        <input
          id="campaign-name"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. June Tarpon Tournament push"
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
        <p className="text-[11px] text-navy-400 mt-1">
          Shows up in Ads Manager prefixed with{" "}
          <code className="font-mono text-[10px] bg-sand-100 px-1 rounded">
            Ad ·
          </code>
        </p>
      </div>

      {/* OBJECTIVE */}
      <div>
        <label
          htmlFor="objective"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Objective
        </label>
        <select
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        >
          {OBJECTIVES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-navy-500 italic mt-1">
          {objectiveHelper}
        </p>
      </div>

      {/* PROMOTED POST */}
      <div>
        <label
          htmlFor="post"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Promoted post
        </label>
        <select
          id="post"
          value={postId}
          onChange={(e) =>
            setPostId(e.target.value ? Number(e.target.value) : "")
          }
          required
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        >
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {formatSent(p.sentAt) ? `${formatSent(p.sentAt)} — ` : ""}
              {previewCaption(p)}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-navy-400 mt-1">
          Only sent FB posts with a live{" "}
          <code className="font-mono text-[10px] bg-sand-100 px-1 rounded">
            external_post_id
          </code>{" "}
          are listed.
        </p>
      </div>

      {/* BUDGET + DURATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="budget"
            className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
          >
            Daily budget (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
              $
            </span>
            <input
              id="budget"
              type="number"
              step="1"
              min={MIN_BUDGET_DOLLARS}
              max={MAX_BUDGET_DOLLARS}
              value={budgetDollars}
              onChange={(e) => setBudgetDollars(e.target.value)}
              required
              className="w-full bg-white border border-sand-300 rounded-lg pl-7 pr-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
          </div>
          <p className="text-[11px] text-navy-400 mt-1">
            ${MIN_BUDGET_DOLLARS}–${MAX_BUDGET_DOLLARS}/day.
          </p>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
          >
            Duration (days)
          </label>
          <input
            id="duration"
            type="number"
            step="1"
            min={MIN_DURATION_DAYS}
            max={MAX_DURATION_DAYS}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
            className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
          <p className="text-[11px] text-navy-400 mt-1">
            {MIN_DURATION_DAYS}–{MAX_DURATION_DAYS} days.
          </p>
        </div>
      </div>

      {/* AUDIENCE */}
      <div>
        <label
          htmlFor="audience"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Audience{" "}
          <span className="text-navy-400 font-normal lowercase">
            (optional)
          </span>
        </label>
        <input
          id="audience"
          value={audienceId}
          onChange={(e) => setAudienceId(e.target.value)}
          placeholder="Saved-audience ID"
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
        <p className="text-[11px] text-navy-400 mt-1">
          Leave blank for default geo+demo targeting (Port Aransas
          50mi radius, 25–65).
        </p>
      </div>

      {error && (
        <p className="text-sm text-coral-600 font-medium">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <Link
          href="/wheelhouse/ads"
          className="text-sm font-medium text-navy-500 hover:text-coral-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || !selectedPost}
          className="px-5 py-2 rounded-lg text-sm font-semibold btn-coral disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create ad"}
        </button>
      </div>
    </form>
  );
}
