import { NextResponse } from "next/server";
import {
  createMessage,
  findOrCreatePulseThread,
  getPalStats,
  getRecentActivity,
  getThreadsAwaiting,
} from "@/data/wheelhouse-store";
import {
  getParticipant,
  type ParticipantId,
} from "@/data/wheelhouse-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron: PAL Pulse — daily digest
 * Schedule: 0 13 * * *  (8am CT, configured in vercel.json)
 *
 * Generates a Markdown digest combining the past 24h of internal activity,
 * external traffic from the analytics drain, and per-human "awaiting you"
 * counts. Posts the digest as a `update`-typed message into the pinned
 * "PAL Pulse" thread (created on first run).
 *
 * Auth: Vercel sends Authorization: Bearer <CRON_SECRET>. We require the
 * env var to be set and the header to match.
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured on the project." },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [thread, activity, stats] = await Promise.all([
    findOrCreatePulseThread(),
    getRecentActivity(24),
    getPalStats(),
  ]);

  const humans: ParticipantId[] = ["winston", "collie", "nick"];
  const awaitingByHuman = await Promise.all(
    humans.map(async (h) => ({
      who: h,
      count: (await getThreadsAwaiting(h)).length,
    })),
  );

  const body = renderPulseDigest({
    activity,
    stats,
    awaitingByHuman,
  });

  const msg = await createMessage({
    threadId: thread.id,
    authorId: "winston-claude",
    type: "update",
    body,
  });

  return NextResponse.json({
    ok: true,
    threadId: thread.id,
    messageId: msg?.id ?? null,
    bytes: body.length,
  });
}

function renderPulseDigest({
  activity,
  stats,
  awaitingByHuman,
}: {
  activity: Awaited<ReturnType<typeof getRecentActivity>>;
  stats: Awaited<ReturnType<typeof getPalStats>>;
  awaitingByHuman: { who: ParticipantId; count: number }[];
}): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  const lines: string[] = [];
  lines.push(`# PAL Pulse · ${today}`);
  lines.push("");
  lines.push("## Internal");
  if (activity.newMessages === 0 && activity.newThreads === 0) {
    lines.push("Quiet last 24h — no new messages or threads.");
  } else {
    lines.push(
      `**${activity.newMessages}** ${activity.newMessages === 1 ? "message" : "messages"} across **${activity.activeThreads}** ${activity.activeThreads === 1 ? "thread" : "threads"}` +
        (activity.newThreads > 0
          ? ` · **${activity.newThreads}** new ${activity.newThreads === 1 ? "thread" : "threads"}`
          : ""),
    );
  }
  const awaitingRows = awaitingByHuman.filter((a) => a.count > 0);
  if (awaitingRows.length > 0) {
    lines.push("");
    lines.push("**Awaiting:**");
    for (const a of awaitingRows) {
      const p = getParticipant(a.who);
      lines.push(
        `- ${p.name}: **${a.count}** ${a.count === 1 ? "thread" : "threads"}`,
      );
    }
  } else {
    lines.push("");
    lines.push("**Awaiting:** nobody owes anybody anything right now. ⚓");
  }

  lines.push("");
  lines.push("## External");
  if (!stats.hasData) {
    lines.push(
      "Traffic data not flowing yet — drain may still be warming up.",
    );
  } else {
    const delta = renderDelta(stats.totalToday, stats.totalYesterday);
    lines.push(
      `**${stats.totalToday.toLocaleString("en-US")}** pageviews${delta ? ` (${delta} vs yesterday)` : ""} · **${stats.totalLast7d.toLocaleString("en-US")}** over 7d`,
    );
    if (stats.topPaths.length > 0) {
      lines.push("");
      lines.push("**Top pages:**");
      for (const p of stats.topPaths) {
        lines.push(`- \`${p.path}\` — ${p.views.toLocaleString("en-US")}`);
      }
    }
    if (stats.topEvents.length > 0) {
      lines.push("");
      lines.push("**Top events:**");
      for (const e of stats.topEvents) {
        lines.push(
          `- \`${e.eventName}\` — ${e.count.toLocaleString("en-US")}`,
        );
      }
    }
  }

  if (activity.events.length > 0) {
    lines.push("");
    lines.push("## Latest activity");
    for (const e of activity.events.slice(0, 5)) {
      const author = getParticipant(e.authorId);
      const when = relativeTime(e.createdAt);
      lines.push(
        `- ${author.name} → **${e.threadTitle}** (${e.type}) · ${when}`,
      );
    }
  }

  return lines.join("\n");
}

function renderDelta(today: number, yesterday: number): string | null {
  if (yesterday === 0) {
    return today === 0 ? null : "new";
  }
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
