import Link from "next/link";
import type { ActivitySummary } from "@/data/wheelhouse-store";
import MessageTypePill from "./MessageTypePill";
import ParticipantBadge from "./ParticipantBadge";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.floor((now - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({
  activity,
}: {
  activity: ActivitySummary;
}) {
  const { newMessages, newThreads, activeThreads, events, windowHours } =
    activity;
  const hasActivity = newMessages > 0 || newThreads > 0;

  return (
    <section className="mb-6 bg-white border border-sand-200 rounded-xl overflow-hidden">
      <details className="group" open={hasActivity}>
        <summary className="flex items-center justify-between gap-4 px-5 py-3 cursor-pointer list-none hover:bg-sand-50 transition-colors">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
              Last {windowHours}h
            </span>
            {hasActivity ? (
              <span className="text-sm text-navy-700">
                <span className="font-bold text-navy-900">{newMessages}</span>{" "}
                {newMessages === 1 ? "message" : "messages"} ·{" "}
                <span className="font-bold text-navy-900">{activeThreads}</span>{" "}
                {activeThreads === 1 ? "thread" : "threads"}
                {newThreads > 0 && (
                  <>
                    {" · "}
                    <span className="font-bold text-coral-600">
                      {newThreads} new
                    </span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-sm text-navy-500 font-light">
                Quiet on the boat — no new activity.
              </span>
            )}
          </div>
          <span className="text-navy-400 text-xs flex-shrink-0 group-open:rotate-180 transition-transform">
            ▾
          </span>
        </summary>

        {events.length > 0 && (
          <ul className="border-t border-sand-200 divide-y divide-sand-100">
            {events.map((e) => (
              <li key={e.messageId}>
                <Link
                  href={`/wheelhouse/${e.threadId}#${e.messageId}`}
                  className="block px-5 py-3 hover:bg-sand-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <ParticipantBadge id={e.authorId} size="sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-display font-bold text-sm text-navy-900 truncate">
                          {e.threadTitle}
                        </span>
                        {e.threadIsNew && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-coral-500 text-white">
                            new
                          </span>
                        )}
                        <MessageTypePill type={e.type} />
                      </div>
                      <p className="text-sm text-navy-600 font-light line-clamp-2">
                        {e.bodyPreview}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-navy-400 font-mono tabular-nums pt-1">
                      {relativeTime(e.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}
