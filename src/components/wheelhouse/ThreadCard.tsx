import Link from "next/link";
import type { Thread } from "@/data/wheelhouse-types";
import StatePill from "./StatePill";
import ParticipantBadge from "./ParticipantBadge";

export default function ThreadCard({ thread }: { thread: Thread }) {
  const updated = new Date(thread.updatedAt);
  const updatedLabel = updated.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <Link
      href={`/wheelhouse/${thread.id}`}
      className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-coral-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-navy-900 text-base leading-tight">
          {thread.title}
        </h3>
        <div className="flex-shrink-0">
          <StatePill state={thread.state} />
        </div>
      </div>

      {thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {thread.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sand-100 text-navy-500 border border-sand-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {thread.participants.map((p) => (
            <ParticipantBadge key={p} id={p} size="sm" />
          ))}
        </div>
        <span className="text-xs text-navy-400 font-mono tabular-nums">
          {updatedLabel}
        </span>
      </div>
    </Link>
  );
}
