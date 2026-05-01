/**
 * Event milestone preview — computes upcoming social-post triggers
 * from events.ts without queueing anything. Used by the Marketing
 * hub to preview "what the system is about to do."
 *
 * Same logic the milestone cron will use when it's wired up later;
 * keeping it as a pure helper so cron + hub stay in sync.
 *
 * Milestones (per published event):
 *   30d / 14d / 7d / 1d before startISO  → milestone post
 *   day-of (today between startISO and endISO) → "happening today"
 *   day-after (endISO + 1 day) → wrap post
 */

import { events, type EventDetails } from "@/data/events";

export type MilestoneKind =
  | "milestone_30d"
  | "milestone_14d"
  | "milestone_7d"
  | "milestone_1d"
  | "today"
  | "wrap";

export interface UpcomingMilestone {
  event: EventDetails;
  kind: MilestoneKind;
  /** ISO date when this milestone post should fire */
  fireDate: string;
  /** Days from now until fire (negative = past) */
  daysUntil: number;
  /** Human label for the operator preview */
  label: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysFromNow(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.round(ms / MS_PER_DAY);
}

function labelFor(kind: MilestoneKind): string {
  switch (kind) {
    case "milestone_30d":
      return "Save the date";
    case "milestone_14d":
      return "Two weeks out";
    case "milestone_7d":
      return "One week out";
    case "milestone_1d":
      return "Tomorrow";
    case "today":
      return "Happening today";
    case "wrap":
      return "Wrap post";
  }
}

/**
 * Returns all upcoming milestones across all published events,
 * sorted ascending by fire date. Skips milestones already in the past.
 *
 * Look-ahead window defaults to 90 days — enough to surface "save
 * the date" announcements for the next quarter without flooding the
 * hub with year-out events.
 */
export function getUpcomingMilestones(
  lookAheadDays = 90,
): UpcomingMilestone[] {
  const now = Date.now();
  const cutoff = now + lookAheadDays * MS_PER_DAY;
  const out: UpcomingMilestone[] = [];

  for (const event of events) {
    if (!event.published) continue;
    const start = new Date(event.startISO).getTime();
    const end = new Date(event.endISO).getTime();

    // Pre-event milestones — fire 30/14/7/1 days before startISO
    const preDays: Array<[MilestoneKind, number]> = [
      ["milestone_30d", 30],
      ["milestone_14d", 14],
      ["milestone_7d", 7],
      ["milestone_1d", 1],
    ];
    for (const [kind, daysBefore] of preDays) {
      const fire = start - daysBefore * MS_PER_DAY;
      if (fire <= now) continue; // already passed
      if (fire > cutoff) continue; // beyond look-ahead
      out.push({
        event,
        kind,
        fireDate: new Date(fire).toISOString(),
        daysUntil: Math.round((fire - now) / MS_PER_DAY),
        label: labelFor(kind),
      });
    }

    // Day-of — fire on startISO morning if event is upcoming
    if (start > now && start <= cutoff) {
      out.push({
        event,
        kind: "today",
        fireDate: new Date(start).toISOString(),
        daysUntil: Math.round((start - now) / MS_PER_DAY),
        label: labelFor("today"),
      });
    }

    // Wrap — fire day after endISO
    const wrapFire = end + MS_PER_DAY;
    if (wrapFire > now && wrapFire <= cutoff) {
      out.push({
        event,
        kind: "wrap",
        fireDate: new Date(wrapFire).toISOString(),
        daysUntil: Math.round((wrapFire - now) / MS_PER_DAY),
        label: labelFor("wrap"),
      });
    }
  }

  return out.sort(
    (a, b) =>
      new Date(a.fireDate).getTime() - new Date(b.fireDate).getTime(),
  );
}
