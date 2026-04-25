import {
  MESSAGE_TYPE_META,
  type MessageType,
} from "@/data/wheelhouse-types";

const TONE_CLASSES: Record<string, string> = {
  coral: "bg-coral-500/15 text-coral-700 border-coral-500/30",
  navy: "bg-navy-100 text-navy-800 border-navy-200",
  amber: "bg-amber-500/15 text-amber-800 border-amber-500/40",
  red: "bg-red-500/15 text-red-800 border-red-500/40",
  purple: "bg-purple-500/15 text-purple-800 border-purple-500/40",
  sand: "bg-sand-100 text-navy-600 border-sand-300",
};

export default function MessageTypePill({ type }: { type: MessageType }) {
  const meta = MESSAGE_TYPE_META[type];
  const cls = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.sand;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${cls}`}
      title={meta.hint}
    >
      {meta.label}
    </span>
  );
}
