/**
 * Bron's setup digest — a consolidated day-before / day-of reminder of the
 * day's beach setups, sent to Bron's via email (sales@bronsbeachcarts.com) and
 * SMS (all three team lines). Fired by /api/cron/brons-digest.
 *
 * Independent of the per-booking beach-day-before flow (which marks
 * day_before_sent_at) — this is a separate operational digest, so it queries
 * claims directly and doesn't touch that flag.
 *
 * Contact: these fire within ~24h of setup, so per operator direction they
 * carry FULL customer contact (name + phone + location) — the crew needs it to
 * fulfill. Matches the dashboard's 24h contact reveal.
 */

import { sql } from "@vercel/postgres";
import { beachVendors } from "@/data/beach-vendors";
import { getBeachProductLabel } from "@/data/beach-products";
import { sendPalEmail } from "./palEmail";
import { sendSms } from "./twilioSms";

const DIGEST_EMAIL = "sales@bronsbeachcarts.com";
const BRONS_SLUGS = beachVendors.filter((v) => v.team === "brons").map((v) => v.slug);
/** Bron's SMS lines (all three), normalized to E.164. */
const BRONS_SMS = beachVendors
  .filter((v) => v.team === "brons" && v.smsCapable !== false)
  .map((v) => "+1" + (v.phone || "").replace(/\D/g, ""))
  .filter((p) => p.length === 12);

interface DigestJob {
  product: string | null;
  qty: number | null;
  numDays: number | null;
  customerName: string | null;
  customerPhone: string | null;
  setupLocation: string | null;
}

/** Bron's setups for a given date (excludes Beach Rig — Tyler's, not theirs). */
async function bronsClaimsForDate(date: string): Promise<DigestJob[]> {
  const { rows } = await sql`
    SELECT product, qty, num_days, customer_name, customer_phone, setup_location
    FROM beach_booking_claims
    WHERE setup_date = ${date}
      AND claimed_by_slug = ANY(${BRONS_SLUGS as unknown as string})
      AND product IS DISTINCT FROM 'beach-rig'
    ORDER BY setup_location NULLS LAST
  `;
  return rows.map((r) => ({
    product: (r.product as string) ?? null,
    qty: (r.qty as number) ?? null,
    numDays: (r.num_days as number) ?? null,
    customerName: (r.customer_name as string) ?? null,
    customerPhone: (r.customer_phone as string) ?? null,
    setupLocation: (r.setup_location as string) ?? null,
  }));
}

function prettyDate(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function jobLine(j: DigestJob): string {
  const setup = getBeachProductLabel(j.product ?? "") + (j.qty && j.qty > 1 ? ` ×${j.qty}` : "");
  const days = j.numDays && j.numDays > 1 ? ` (${j.numDays} days)` : "";
  const where = j.setupLocation || "location TBD";
  const who = [j.customerName, j.customerPhone].filter(Boolean).join(" · ") || "contact TBD";
  return `${setup}${days} — ${where} — ${who}`;
}

/**
 * Send the digest for `mode`. Returns a summary; skips send if no setups.
 */
export async function sendBronsDigest(
  mode: "day-before" | "day-of",
): Promise<{ mode: string; date: string; count: number; sent: boolean }> {
  // Setup dates are Chicago-local (YYYY-MM-DD).
  const offsetMs = mode === "day-before" ? 24 * 60 * 60 * 1000 : 0;
  const date = new Date(Date.now() + offsetMs).toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
  });

  const jobs = await bronsClaimsForDate(date);
  if (jobs.length === 0) {
    return { mode, date, count: 0, sent: false };
  }

  const when = mode === "day-before" ? "Tomorrow" : "Today";
  const heading = `Bron's Beach setups — ${when}, ${prettyDate(date)}`;
  const lines = jobs.map((j, i) => `${i + 1}. ${jobLine(j)}`);

  // SMS — concise
  const smsBody = `${heading} (${jobs.length}):\n${lines.join("\n")}`;
  // Email — a touch fuller
  const html = `
    <h2 style="font-family:sans-serif">${heading}</h2>
    <p style="font-family:sans-serif;color:#555">${jobs.length} setup${jobs.length !== 1 ? "s" : ""} for ${when.toLowerCase()}.</p>
    <ol style="font-family:sans-serif;line-height:1.6">
      ${jobs.map((j) => `<li>${jobLine(j)}</li>`).join("")}
    </ol>`;

  await sendPalEmail({ to: DIGEST_EMAIL, subject: heading, html });
  await Promise.all(BRONS_SMS.map((to) => sendSms(to, smsBody)));

  return { mode, date, count: jobs.length, sent: true };
}
