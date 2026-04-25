import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LighthouseMark from "@/components/brand/LighthouseMark";
import ThreadCard from "@/components/wheelhouse/ThreadCard";
import {
  getThreads,
  getThreadsAwaiting,
} from "@/data/wheelhouse-store";
import {
  getParticipant,
  type ParticipantId,
  type Thread,
} from "@/data/wheelhouse-types";

export const dynamic = "force-dynamic";

export default async function WheelhousePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");
  const me = getParticipant(who as ParticipantId);

  const { filter } = await searchParams;
  const allThreads = getThreads();
  const awaitingMe = getThreadsAwaiting(me.id);

  let visible: Thread[] = allThreads;
  let title = "All threads";
  if (filter === "awaiting-me") {
    visible = awaitingMe;
    title = `Awaiting ${me.name}`;
  } else if (filter === "open") {
    visible = allThreads.filter((t) => t.state === "open");
    title = "Open";
  } else if (filter === "blocked") {
    visible = allThreads.filter((t) => t.state === "blocked");
    title = "Blocked";
  } else if (filter === "done") {
    visible = allThreads.filter((t) => t.state === "done");
    title = "Done";
  }

  return (
    <main className="min-h-screen bg-sand-50">
      {/* Top bar */}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <LighthouseMark size={32} variant="light" detail="icon" />
            <div>
              <p className="font-display text-lg font-bold text-sand-50 leading-none">
                The Wheelhouse
              </p>
              <p className="text-[10px] tracking-widest uppercase text-coral-300 mt-0.5">
                Port A Local · Internal
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-navy-300">
              Signed in as{" "}
              <span className="text-sand-50 font-semibold">{me.name}</span>
            </span>
            <form action="/api/wheelhouse/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-navy-300 hover:text-coral-300 underline decoration-navy-500 hover:decoration-coral-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar + new thread button */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip
              label={`All (${allThreads.length})`}
              href="/wheelhouse"
              active={!filter}
            />
            <FilterChip
              label={`Awaiting ${me.name} (${awaitingMe.length})`}
              href="/wheelhouse?filter=awaiting-me"
              active={filter === "awaiting-me"}
              accent="coral"
            />
            <FilterChip
              label="Open"
              href="/wheelhouse?filter=open"
              active={filter === "open"}
            />
            <FilterChip
              label="Blocked"
              href="/wheelhouse?filter=blocked"
              active={filter === "blocked"}
            />
            <FilterChip
              label="Done"
              href="/wheelhouse?filter=done"
              active={filter === "done"}
            />
          </div>
          <Link
            href="/wheelhouse/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold btn-coral inline-flex items-center gap-2"
          >
            New thread
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>
        </div>

        <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
          {title}
        </h2>

        {visible.length === 0 ? (
          <div className="bg-white border border-sand-200 rounded-xl p-10 text-center">
            <p className="text-navy-500 font-light">
              No threads in this view.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        )}

        <p className="text-[11px] text-navy-400 font-light mt-8 text-center max-w-md mx-auto">
          Push 1 — mock storage. Posts succeed but don&apos;t persist across
          deploys. Real persistence ships in Push 3 (Vercel Postgres).
        </p>
      </div>
    </main>
  );
}

function FilterChip({
  label,
  href,
  active,
  accent,
}: {
  label: string;
  href: string;
  active?: boolean;
  accent?: "coral";
}) {
  const base =
    "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors";
  const inactive = "bg-white border border-sand-300 text-navy-600 hover:border-navy-400";
  const activeCls =
    accent === "coral"
      ? "bg-coral-500 text-white"
      : "bg-navy-900 text-sand-50";
  return (
    <Link href={href} className={`${base} ${active ? activeCls : inactive}`}>
      {label}
    </Link>
  );
}
