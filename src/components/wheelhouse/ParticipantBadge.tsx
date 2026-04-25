import type { Participant, ParticipantId } from "@/data/wheelhouse-types";
import { getParticipant } from "@/data/wheelhouse-types";

const ACCENT_CLASSES: Record<Participant["accent"], string> = {
  navy: "bg-navy-900 text-sand-50 border-navy-700",
  coral: "bg-coral-500 text-white border-coral-600",
  teal: "bg-teal-600 text-white border-teal-700",
  purple: "bg-purple-700 text-white border-purple-800",
  gold: "bg-amber-600 text-white border-amber-700",
  indigo: "bg-indigo-700 text-white border-indigo-800",
};

export default function ParticipantBadge({
  id,
  size = "md",
  showName = false,
}: {
  id: ParticipantId;
  size?: "sm" | "md";
  showName?: boolean;
}) {
  const p = getParticipant(id);
  const sizeClass =
    size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${sizeClass} ${ACCENT_CLASSES[p.accent]} inline-flex items-center justify-center rounded-full border-2 font-bold tracking-tighter`}
        title={`${p.name}${p.kind === "agent" ? " (agent)" : ""}`}
      >
        {p.short}
      </span>
      {showName && (
        <span className="text-sm text-navy-700">
          {p.name}
          {p.kind === "agent" && (
            <span className="text-navy-400 text-xs ml-1">(agent)</span>
          )}
        </span>
      )}
    </span>
  );
}
