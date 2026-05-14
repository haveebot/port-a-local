"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EVENTS: { value: string; label: string; helper: string }[] = [
  {
    value: "PageView",
    label: "All site visitors (PageView)",
    helper: "Anyone who loaded any page on theportalocal.com",
  },
  {
    value: "ViewContent",
    label: "Category browsers (ViewContent)",
    helper: "Viewed /rent, /beach, /deliver, /events, /live, /guides",
  },
  {
    value: "InitiateCheckout",
    label: "Started a booking (InitiateCheckout)",
    helper: "Submitted a rent or beach booking form (pre-Stripe)",
  },
  {
    value: "Purchase",
    label: "Paid customers (Purchase)",
    helper: "Completed a paid booking — the high-intent retargeting seed",
  },
  {
    value: "Lead",
    label: "Inquiry leads (Lead)",
    helper: "Submitted a /locals inquiry form",
  },
];

const RETENTION_OPTIONS = [7, 14, 30, 60, 90, 180];

function defaultName(event: string, retentionDays: number): string {
  return `Pixel · ${event} · ${retentionDays}d`;
}

export default function CreateAudienceForm() {
  const router = useRouter();
  const [event, setEvent] = useState("Purchase");
  const [retentionDays, setRetentionDays] = useState(90);
  const [nameOverride, setNameOverride] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoName = useMemo(
    () => defaultName(event, retentionDays),
    [event, retentionDays],
  );
  const finalName = nameOverride.trim() || autoName;

  const eventHelper =
    EVENTS.find((e) => e.value === event)?.helper ?? "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/wheelhouse/audiences/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          event,
          retentionDays,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "create failed");
        setSubmitting(false);
        return;
      }
      router.push("/wheelhouse/ads/audiences");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      <div>
        <label
          htmlFor="event"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Pixel event
        </label>
        <select
          id="event"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          required
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        >
          {EVENTS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-navy-500 mt-1">{eventHelper}</p>
      </div>

      <div>
        <label
          htmlFor="retention"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Lookback window
        </label>
        <select
          id="retention"
          value={retentionDays}
          onChange={(e) => setRetentionDays(Number(e.target.value))}
          required
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        >
          {RETENTION_OPTIONS.map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
        <p className="text-[11px] text-navy-500 mt-1">
          How long users stay in the audience after firing the event. Meta
          allows 1–180 days.
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Name{" "}
          <span className="text-navy-400 font-normal lowercase">
            (optional)
          </span>
        </label>
        <input
          id="name"
          value={nameOverride}
          onChange={(e) => setNameOverride(e.target.value)}
          placeholder={autoName}
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
        <p className="text-[11px] text-navy-500 mt-1">
          Leave blank for{" "}
          <code className="font-mono text-[10px] bg-sand-100 px-1 rounded">
            {autoName}
          </code>
          .
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-1.5"
        >
          Description{" "}
          <span className="text-navy-400 font-normal lowercase">
            (optional)
          </span>
        </label>
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. retargeting pool for Tarpon Tournament push"
          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
      </div>

      {error && (
        <div className="bg-coral-50 border border-coral-300 rounded-lg px-4 py-3 text-sm text-coral-900">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-coral-500 text-sand-50 hover:bg-coral-400 disabled:bg-coral-500/50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Creating…" : "Create audience"}
      </button>
      <p className="text-[11px] text-navy-500 text-center">
        Meta populates the audience over ~24 hours. Size estimate appears
        on the list page once it&apos;s ready.
      </p>
    </form>
  );
}
