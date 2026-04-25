import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import LighthouseMark from "@/components/brand/LighthouseMark";
import StatePill from "@/components/wheelhouse/StatePill";
import ParticipantBadge from "@/components/wheelhouse/ParticipantBadge";
import MessageCard from "@/components/wheelhouse/MessageCard";
import MessageComposer from "@/components/wheelhouse/MessageComposer";
import StateTransitions from "@/components/wheelhouse/StateTransitions";
import { getThreadWithMessages } from "@/data/wheelhouse-store";
import {
  getParticipant,
  type ParticipantId,
} from "@/data/wheelhouse-types";

export const dynamic = "force-dynamic";

export default async function WheelhouseThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");
  const me = getParticipant(who as ParticipantId);

  const { id } = await params;
  const thread = getThreadWithMessages(id);
  if (!thread) notFound();

  return (
    <main className="min-h-screen bg-sand-50">
      {/* Top bar */}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <LighthouseMark size={28} variant="light" detail="icon" />
            <div>
              <p className="font-display text-base font-bold text-sand-50 leading-none">
                The Wheelhouse
              </p>
              <p className="text-[10px] tracking-widest uppercase text-coral-300 mt-0.5">
                Port A Local · Internal
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/wheelhouse/welcome"
              className="text-xs text-navy-300 hover:text-coral-300 underline decoration-navy-500 hover:decoration-coral-400"
            >
              Help
            </Link>
            <Link
              href="/wheelhouse"
              className="text-xs text-navy-300 hover:text-coral-300"
            >
              ← All threads
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Thread header */}
        <section className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 leading-tight">
              {thread.title}
            </h1>
            <StatePill state={thread.state} />
          </div>

          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
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

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-navy-400">
              Participants
            </span>
            <div className="flex items-center gap-1.5">
              {thread.participants.map((p) => (
                <ParticipantBadge key={p} id={p} size="sm" />
              ))}
            </div>
          </div>

          {thread.context && thread.context.length > 0 && (
            <div className="bg-white border border-sand-200 rounded-lg p-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-1.5">
                Context
              </p>
              <ul className="space-y-1">
                {thread.context.map((c) => (
                  <li key={c.url}>
                    <a
                      href={c.url}
                      target={c.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-coral-600 hover:text-coral-700 text-xs font-medium underline decoration-coral-200 hover:decoration-coral-500"
                    >
                      {c.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Messages */}
        <section className="space-y-3 mb-6">
          {thread.messages.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </section>

        {/* Composer */}
        <section className="mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-2">
            New post
          </p>
          <MessageComposer threadId={thread.id} authorId={me.id} />
        </section>

        {/* State transitions */}
        <section>
          <StateTransitions threadId={thread.id} current={thread.state} />
        </section>
      </div>
    </main>
  );
}
