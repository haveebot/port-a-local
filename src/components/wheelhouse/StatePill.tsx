import {
  THREAD_STATE_META,
  type ThreadState,
} from "@/data/wheelhouse-types";

const TONE_CLASSES: Record<string, string> = {
  navy: "bg-navy-900 text-sand-100",
  coral: "bg-coral-500 text-white",
  amber: "bg-amber-500 text-white",
  red: "bg-red-600 text-white",
  purple: "bg-purple-700 text-white",
  green: "bg-emerald-700 text-white",
  sand: "bg-sand-200 text-navy-700",
};

export default function StatePill({ state }: { state: ThreadState }) {
  const meta = THREAD_STATE_META[state];
  const cls = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.navy;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${cls}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {state.startsWith("awaiting:") && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-50" />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      {meta.label}
    </span>
  );
}
