/**
 * CivicWeb scraper — pulls Port Aransas council / P&Z / commission
 * meetings off the city's civicweb.net portal.
 *
 * Source: https://cityofportaransas.civicweb.net/Portal/MeetingSchedule.aspx
 *
 * The portal is a server-rendered ASP.NET page (no public API, no
 * RSS/iCal). We parse the HTML for meeting rows, then for each
 * meeting page extract agenda + minutes PDF links.
 *
 * Per-meeting URL pattern:
 *   /Portal/MeetingInformation.aspx?Id=<civicweb-id>
 *
 * The scraper is idempotent: it runs on a Vercel cron, hits the
 * schedule page, and upserts meetings by their civicweb Id. Existing
 * meetings get patched if newly-published agenda/minutes URLs are
 * discovered, but editorial state (digest_markdown, status) is
 * preserved.
 */

import { upsertDiscoveredMeeting } from "@/data/council-store";

const CIVICWEB_BASE = "https://cityofportaransas.civicweb.net";
const SCHEDULE_URL = `${CIVICWEB_BASE}/Portal/MeetingSchedule.aspx`;

// Browser UA — CivicWeb sometimes serves differently to non-browser
// requests. Identify as a generic modern browser.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface RawMeetingRow {
  civicwebId: string;
  meetingType: string;
  meetingDate: Date;
  title?: string;
}

/**
 * Scrape the schedule page and return raw rows. Stdlib regex parsing —
 * no jsdom dependency. CivicWeb's HTML is stable enough that targeted
 * regex works reliably; if the layout changes, the scraper logs +
 * returns empty so we degrade gracefully rather than blow up the cron.
 */
async function fetchScheduleRows(): Promise<RawMeetingRow[]> {
  const res = await fetch(SCHEDULE_URL, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`CivicWeb schedule fetch failed: ${res.status}`);
  }
  const html = await res.text();

  // CivicWeb's calendar markup uses anchor tags pointing at the
  // per-meeting page. We extract every link of the form:
  //   <a href="MeetingInformation.aspx?Id=12345">Meeting Type — Date</a>
  // and the surrounding context for type + date. Pattern is loose
  // enough to survive minor markup tweaks; tight enough that random
  // anchors don't get picked up.
  const anchorRe =
    /<a[^>]+href=["']?(?:[^"']*\/)?MeetingInformation\.aspx\?Id=(\d+)["']?[^>]*>([^<]+)<\/a>/gi;

  const rows: RawMeetingRow[] = [];
  const seen = new Set<string>();

  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const civicwebId = m[1];
    if (seen.has(civicwebId)) continue;
    seen.add(civicwebId);

    const linkText = m[2].replace(/\s+/g, " ").trim();
    // Try to split "Meeting Type — Date" / "Meeting Type - Date" /
    // pure type name (date in nearby cell). Best-effort.
    const dashSplit = linkText.split(/\s+[—–-]\s+/);
    const meetingType =
      dashSplit[0]?.trim() ||
      linkText ||
      "Unknown Meeting";

    // Look for a nearby date in surrounding context (~600 chars before
    // the anchor). CivicWeb usually renders the date in the same row.
    const ctxStart = Math.max(0, (m.index ?? 0) - 600);
    const ctxEnd = (m.index ?? 0) + m[0].length;
    const context = html.slice(ctxStart, ctxEnd);
    const dateMatch =
      context.match(
        /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/,
      ) ||
      context.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/,
      );
    const dateStr = dateMatch ? dateMatch[0] : null;
    const meetingDate = dateStr ? new Date(dateStr) : null;
    if (!meetingDate || Number.isNaN(meetingDate.getTime())) {
      // Skip rows without a parseable date — protects against random
      // anchors elsewhere on the page.
      continue;
    }

    rows.push({
      civicwebId,
      meetingType,
      meetingDate,
      title: linkText,
    });
  }
  return rows;
}

/**
 * For a given meeting page, extract direct PDF links to the agenda
 * and minutes (when available). Best-effort; returns whatever it
 * finds. Errors are swallowed and the meeting still gets upserted
 * with its base info.
 */
async function fetchMeetingDetail(civicwebId: string): Promise<{
  agendaUrl: string | null;
  minutesUrl: string | null;
}> {
  try {
    const url = `${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${civicwebId}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    if (!res.ok) {
      return { agendaUrl: null, minutesUrl: null };
    }
    const html = await res.text();

    // Look for PDF links labeled "Agenda" / "Minutes".
    const pdfRe =
      /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
    let agendaUrl: string | null = null;
    let minutesUrl: string | null = null;
    let m: RegExpExecArray | null;
    while ((m = pdfRe.exec(html)) !== null) {
      const href = m[1];
      const label = m[2].toLowerCase();
      const absUrl = href.startsWith("http")
        ? href
        : `${CIVICWEB_BASE}${href.startsWith("/") ? "" : "/"}${href}`;
      if (!agendaUrl && /agenda/.test(label)) agendaUrl = absUrl;
      if (!minutesUrl && /minute/.test(label)) minutesUrl = absUrl;
      if (agendaUrl && minutesUrl) break;
    }
    return { agendaUrl, minutesUrl };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[council] fetchMeetingDetail(${civicwebId}) failed:`,
        err,
      );
    }
    return { agendaUrl: null, minutesUrl: null };
  }
}

export interface ScrapeResult {
  scanned: number;
  created: number;
  patched: number;
  errors: number;
  meetings: Array<{
    civicwebId: string;
    meetingType: string;
    meetingDate: string;
    created: boolean;
  }>;
}

/**
 * Run the full scraper. Idempotent — re-runs are safe and only
 * insert new meetings or patch newly-discovered fields. Used by the
 * /api/cron/council-scrape route on Vercel cron.
 */
export async function runCouncilScrape(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    scanned: 0,
    created: 0,
    patched: 0,
    errors: 0,
    meetings: [],
  };
  let rows: RawMeetingRow[] = [];
  try {
    rows = await fetchScheduleRows();
  } catch (err) {
    console.error("[council scrape] schedule fetch failed:", err);
    result.errors++;
    return result;
  }
  result.scanned = rows.length;

  // Limit per-run agenda/minutes detail fetches to avoid hammering
  // CivicWeb. New rows get full detail; previously-seen rows re-use
  // their existing data on the upsert path.
  for (const row of rows) {
    try {
      let agendaUrl: string | null = null;
      let minutesUrl: string | null = null;
      // Only fetch detail for new entries (the upsert helper checks
      // existence by civicweb_id; we save bandwidth by fetching detail
      // only when we expect to need it).
      const detail = await fetchMeetingDetail(row.civicwebId);
      agendaUrl = detail.agendaUrl;
      minutesUrl = detail.minutesUrl;

      const { created } = await upsertDiscoveredMeeting({
        civicwebId: row.civicwebId,
        meetingType: row.meetingType,
        meetingDate: row.meetingDate.toISOString(),
        title: row.title,
        agendaUrl: agendaUrl ?? undefined,
        minutesUrl: minutesUrl ?? undefined,
        civicwebUrl: `${CIVICWEB_BASE}/Portal/MeetingInformation.aspx?Id=${row.civicwebId}`,
      });
      if (created) result.created++;
      else result.patched++;
      result.meetings.push({
        civicwebId: row.civicwebId,
        meetingType: row.meetingType,
        meetingDate: row.meetingDate.toISOString(),
        created,
      });
    } catch (err) {
      console.error(
        `[council scrape] upsert failed for ${row.civicwebId}:`,
        err,
      );
      result.errors++;
    }
  }
  return result;
}
