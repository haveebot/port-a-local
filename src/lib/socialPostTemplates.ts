/**
 * Caption templates per trigger type. Generates draft captions for
 * each (channel × trigger) combo. Operators in the Wheelhouse review
 * queue see the draft + can edit before send.
 *
 * VOICE (per feedback_pal_brand_system.md, Collie-authored):
 *   - Knowledgeable local giving recs · curated guide · clean tool
 *   - NOT: tourism board, travel blog, corporate directory
 *   - Short, clear, minimal fluff, no hype
 *   - No ALL CAPS (except wordmarks). No exclamation spam.
 *   - No "amazing / must-see / incredible / MUST-TRY"
 *   - Specific over generic
 *
 * Emoji policy:
 *   - Seasonal one-offs (🎃🎄🎭🪁) on /events stay emoji per Collie
 *     2026-04-24 (LOCKED). So an event's icon emoji can land in the
 *     caption naturally.
 *
 * Channel rules:
 *   - FB: clickable links embed as preview card. Lead with the hook,
 *     close with the link.
 *   - IG: captions don't carry clickable links — close with
 *     "Link in bio · /events/[slug]" so it's at least readable.
 *
 * The draft is just a starting point. Operator's edit always wins —
 * captions are the brand voice surface and cannot be vibe-coded.
 */

import type { EventDetails } from "@/data/events";
import type { GlossaryEntry } from "@/data/glossary-store";

type Event = EventDetails;
import type { Story } from "@/data/stories";
import type { Dispatch } from "@/data/dispatches";

const SITE = "https://theportalocal.com";

export type SupportedChannel = "facebook" | "instagram";

interface DraftPair {
  facebook: string;
  instagram: string;
}

/**
 * Helper: trim caption to a target length without cutting mid-word.
 * IG hard caps at 2200 chars; FB has no hard cap but keep it tight.
 */
function fitTo(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > maxLen - 30 ? lastSpace : maxLen) + "…";
}

// ─────────────────────────────────────────────────────────────────────
// EVENT TRIGGERS
// ─────────────────────────────────────────────────────────────────────

export function eventPublishedDraft(event: Event): DraftPair {
  const url = `${SITE}/events/${event.slug}`;
  const headline =
    event.headlineTime ?? event.dateLabel;
  const fb = [
    `New on the calendar: ${event.name}.`,
    "",
    event.tagline,
    "",
    `${headline} · ${event.venueName}`,
    `${event.cost === "Free" ? "Free." : event.cost + "."} Full details + countdown ↓`,
    url,
  ].join("\n");
  const ig = [
    `New on the calendar: ${event.name}.`,
    "",
    event.tagline,
    "",
    `${headline} · ${event.venueName}`,
    "",
    `Link in bio · /events/${event.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

export function eventMilestoneDraft(
  event: Event,
  daysOut: 30 | 14 | 7 | 1,
): DraftPair {
  const url = `${SITE}/events/${event.slug}`;
  const lead =
    daysOut === 30
      ? "Save the date —"
      : daysOut === 14
        ? "Two weeks out —"
        : daysOut === 7
          ? "One week from today —"
          : "Tomorrow:";
  const detail = (() => {
    if (daysOut === 1) return event.headlineTime ?? event.dateLabel;
    return `${event.dateLabel} · ${event.venueName}`;
  })();
  const fb = [
    `${lead} ${event.name}.`,
    "",
    event.tagline,
    "",
    detail,
    url,
  ].join("\n");
  const ig = [
    `${lead} ${event.name}.`,
    "",
    event.tagline,
    "",
    detail,
    "",
    `Link in bio · /events/${event.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

export function eventTodayDraft(event: Event): DraftPair {
  const url = `${SITE}/events/${event.slug}`;
  const fb = [
    `${event.name} starts today.`,
    "",
    event.headlineTime ?? event.dateLabel,
    `${event.venueName}.`,
    "",
    event.tagline,
    url,
  ].join("\n");
  const ig = [
    `${event.name} starts today.`,
    "",
    event.headlineTime ?? event.dateLabel,
    `${event.venueName}.`,
    "",
    `Link in bio · /events/${event.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

export function eventWrapDraft(event: Event): DraftPair {
  const url = `${SITE}/events/${event.slug}`;
  const fb = [
    `That's a wrap on ${event.name}.`,
    "",
    "Thanks to everyone who showed up. See you at the next one.",
    "",
    `Recap + photos: ${url}`,
  ].join("\n");
  const ig = [
    `That's a wrap on ${event.name}.`,
    "",
    "Thanks to everyone who showed up. See you at the next one.",
    "",
    `Link in bio · /events/${event.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

// ─────────────────────────────────────────────────────────────────────
// EDITORIAL TRIGGERS — Heritage + Dispatch
// ─────────────────────────────────────────────────────────────────────

export function heritagePublishedDraft(story: Story): DraftPair {
  const url = `${SITE}/history/${story.slug}`;
  const fb = [
    `New Heritage piece — ${story.title}.`,
    "",
    story.subtitle,
    "",
    `${story.readTime} read · ${url}`,
  ].join("\n");
  const ig = [
    `New Heritage piece — ${story.title}.`,
    "",
    fitTo(story.subtitle, 200),
    "",
    `Link in bio · /history/${story.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

// ─────────────────────────────────────────────────────────────────────
// GLOSSARY TRIGGER — Collie flips status to "active"
// ─────────────────────────────────────────────────────────────────────

/**
 * Generate a feature-spotlight caption when a glossary entry's
 * marketingStatus flips to "active." Draws on featureName, oneLiner,
 * notableBullets, and livesAt to draft a launch-style announcement.
 *
 * Caption shape — feature spotlight:
 *   PAL — {featureName}.
 *   {oneLiner}
 *   • {first notable bullet}
 *   {livesAt link}
 */
export function glossaryActiveDraft(entry: GlossaryEntry): DraftPair {
  const url = entry.livesAt
    ? entry.livesAt.startsWith("http")
      ? entry.livesAt
      : `${SITE}${entry.livesAt.startsWith("/") ? "" : "/"}${entry.livesAt}`
    : SITE;
  const lines: string[] = [
    `PAL — ${entry.featureName}.`,
    "",
  ];
  if (entry.oneLiner) {
    lines.push(entry.oneLiner);
    lines.push("");
  }
  if (entry.notableBullets.length > 0) {
    // Lead with the strongest bullet — operator can rewrite in queue if
    // a different one fits better.
    lines.push(entry.notableBullets[0]);
    lines.push("");
  }
  const fbLines = [...lines, url];
  const igLines = [
    `PAL — ${entry.featureName}.`,
    "",
    entry.oneLiner ?? "",
    "",
    entry.notableBullets[0] ?? "",
    "",
    `Link in bio · ${entry.livesAt ?? "/"}`,
  ].filter((l) => l !== "" || true); // preserve blank lines for paragraphing
  return {
    facebook: fbLines.join("\n").replace(/\n{3,}/g, "\n\n"),
    instagram: igLines.join("\n").replace(/\n{3,}/g, "\n\n"),
  };
}

export function dispatchPublishedDraft(d: Dispatch): DraftPair {
  const url = `${SITE}/dispatch/${d.slug}`;
  const fb = [
    `Dispatch — ${d.title}.`,
    "",
    d.subtitle,
    "",
    `${d.readTime} read · ${url}`,
  ].join("\n");
  const ig = [
    `Dispatch — ${d.title}.`,
    "",
    fitTo(d.subtitle, 200),
    "",
    `Link in bio · /dispatch/${d.slug}`,
  ].join("\n");
  return { facebook: fb, instagram: ig };
}

// ─────────────────────────────────────────────────────────────────────
// PUBLIC OG IMAGE URLS — used for IG (which needs explicit image_url)
// ─────────────────────────────────────────────────────────────────────

export function eventOgImageUrl(slug: string): string {
  return `${SITE}/events/${slug}/opengraph-image`;
}

export function heritageOgImageUrl(slug: string): string {
  return `${SITE}/history/${slug}/opengraph-image`;
}

export function dispatchOgImageUrl(slug: string): string {
  return `${SITE}/dispatch/${slug}/opengraph-image`;
}
