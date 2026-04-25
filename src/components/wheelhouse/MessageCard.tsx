import type { Message } from "@/data/wheelhouse-types";
import { getParticipant } from "@/data/wheelhouse-types";
import ParticipantBadge from "./ParticipantBadge";
import MessageTypePill from "./MessageTypePill";

export default function MessageCard({ message }: { message: Message }) {
  const author = getParticipant(message.authorId);
  const created = new Date(message.createdAt);
  const timeLabel = created.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="bg-white border border-sand-200 rounded-xl p-5">
      <header className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <ParticipantBadge id={message.authorId} size="md" />
          <div>
            <p className="font-semibold text-navy-900 text-sm leading-tight">
              {author.name}
            </p>
            <p className="text-xs text-navy-400 font-mono tabular-nums">
              {timeLabel}
            </p>
          </div>
        </div>
        <MessageTypePill type={message.type} />
      </header>

      <div className="text-sm text-navy-700 font-light leading-relaxed whitespace-pre-wrap">
        {message.body}
      </div>

      {message.payload?.links && message.payload.links.length > 0 && (
        <ul className="mt-4 space-y-1.5 pt-3 border-t border-sand-200">
          {message.payload.links.map((l, i) => (
            <li key={i}>
              <a
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-coral-600 hover:text-coral-700 text-xs font-medium underline decoration-coral-200 hover:decoration-coral-500"
              >
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
