/**
 * BirdCast live migration data — Cornell Lab of Ornithology.
 *
 * BirdCast operates an undocumented but openly-readable S3 bucket
 * containing nightly weather-radar migration counts at the county
 * level. They publish a new CSV every ~10 minutes during migration
 * season (Mar 1 – Jun 15 spring; Aug 1 – Nov 15 fall). No auth, no
 * key, no commercial restriction posted — but we attribute prominently.
 *
 * Source bucket:
 *   https://is-birdcast-observed-prod.s3.us-east-1.amazonaws.com/
 *   prefix: dashboard/YYYY/MM/DD/livemig_gen-YYYYMMDD-HHMM.csv.gz.processed
 *
 * CSV schema (head row from a 2026-05-02 file):
 *   location,datetime,datetime_local,noy,part_of_day,enabled,
 *   mtr,vid,ff,dd,height_mean,height_max,birds_aloft,birds_passed
 *
 * Field meanings:
 *   location       — county FIPS-style ID, e.g. US-TX-007 (Aransas), US-TX-355 (Nueces)
 *   datetime       — UTC timestamp of the 10-min interval end
 *   mtr            — migration traffic rate (birds/km/hr)
 *   vid            — vertically-integrated density (birds/km²)
 *   ff             — flight speed (m/s)
 *   dd             — flight direction (degrees, compass)
 *   height_mean    — mean altitude AGL (m)
 *   height_max     — max altitude AGL (m)
 *   birds_aloft    — instantaneous count over the county
 *   birds_passed   — count that crossed county during the prior interval
 *
 * For PAL we pull both Aransas (US-TX-007 — Port A is here) AND Nueces
 * (US-TX-355 — Corpus, immediately south, same flyway corridor) so the
 * page tells the regional story.
 *
 * Caching: page render uses ISR with revalidate=600 (10 min) — matches
 * BirdCast's own publish cadence; no point fetching faster than they
 * write. Defensive: any S3 / parse failure returns null and the page
 * gracefully degrades to no live tile.
 */

import { gunzipSync } from "node:zlib";

const BUCKET = "https://is-birdcast-observed-prod.s3.us-east-1.amazonaws.com";

const ARANSAS = "US-TX-007";
const NUECES = "US-TX-355";

export interface BirdCastReading {
  /** UTC timestamp of the 10-min interval end */
  datetimeUtc: string;
  /** Localized datetime string (BirdCast's own field) */
  datetimeLocal: string;
  /** County code, e.g. US-TX-007 */
  location: string;
  /** Whether BirdCast considers this reading data-quality-good */
  enabled: boolean;
  /** Time-of-day classification: 'night' | 'day' | 'dawn' | 'dusk' (or empty) */
  partOfDay: string;
  /** Migration traffic rate, birds/km/hr */
  mtr: number;
  /** Vertically-integrated density, birds/km² */
  vid: number;
  /** Flight speed, m/s */
  flightSpeedMs: number;
  /** Flight direction, degrees compass */
  flightDirectionDeg: number;
  /** Mean altitude above ground, meters */
  heightMeanM: number;
  /** Max altitude above ground, meters */
  heightMaxM: number;
  /** Instantaneous birds aloft over the county */
  birdsAloft: number;
  /** Birds that crossed the county boundary during this interval */
  birdsPassed: number;
}

export interface BirdCastSnapshot {
  /** When we fetched + parsed this snapshot (server time) */
  fetchedAt: string;
  /** datetime field of the chosen reading (the most-recent night with active data) */
  asOf: string;
  /** Aransas County reading (Port A) */
  aransas: BirdCastReading | null;
  /** Nueces County reading (Corpus) */
  nueces: BirdCastReading | null;
  /** Sum of birds_passed across both counties for this reading window */
  combinedPassed: number;
  /** Sum of birds_aloft across both counties at this snapshot */
  combinedAloft: number;
  /** True if the chosen reading was during night (active migration) */
  isNight: boolean;
  /** Source URL — used in the UI's attribution link */
  sourceKey: string;
}

interface ListedFile {
  key: string;
  lastModifiedIso: string;
}

/**
 * List BirdCast S3 files for a given UTC date prefix. Paginates up to
 * `maxPages` to find all keys in that day. Returns chronologically
 * sorted (latest last).
 */
async function listFiles(
  yyyy: number,
  mm: number,
  dd: number,
  maxPages: number = 30,
): Promise<ListedFile[]> {
  const prefix = `dashboard/${yyyy}/${String(mm).padStart(2, "0")}/${String(
    dd,
  ).padStart(2, "0")}/livemig_gen-`;

  const files: ListedFile[] = [];
  let token: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      "list-type": "2",
      prefix,
      "max-keys": "100",
    });
    if (token) params.set("continuation-token", token);
    const res = await fetch(`${BUCKET}/?${params.toString()}`);
    if (!res.ok) break;
    const text = await res.text();

    // Quick XML parse — we only need <Key> + <LastModified> + <NextContinuationToken>
    const contents = [...text.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)];
    for (const m of contents) {
      const block = m[1];
      const key = block.match(/<Key>([^<]+)<\/Key>/)?.[1];
      const lastModified = block.match(
        /<LastModified>([^<]+)<\/LastModified>/,
      )?.[1];
      if (key) files.push({ key, lastModifiedIso: lastModified ?? "" });
    }

    const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(text);
    if (!isTruncated) break;
    const tokenMatch = text.match(
      /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/,
    );
    if (!tokenMatch) break;
    token = tokenMatch[1];
  }

  // Sort chronologically by filename (filename embeds HHMM)
  files.sort((a, b) => a.key.localeCompare(b.key));
  return files;
}

/**
 * Find the most-recent file with active night migration data. BirdCast
 * publishes during day too but with mostly-zero readings; the most
 * meaningful "what's flying right now / last night" data lives in the
 * latest night-active file. Walk back through today + yesterday (UTC)
 * until we find one with non-zero aloft for either target county.
 */
async function findLatestNightFile(): Promise<string | null> {
  const now = new Date();
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const files = await listFiles(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
    if (files.length === 0) continue;
    // Walk newest-to-oldest; first file with non-zero aloft for our targets wins.
    for (let i = files.length - 1; i >= 0; i--) {
      const sample = await fetchAndParse(files[i].key, [ARANSAS, NUECES]);
      const totalAloft =
        (sample.find((r) => r.location === ARANSAS)?.birdsAloft ?? 0) +
        (sample.find((r) => r.location === NUECES)?.birdsAloft ?? 0);
      if (totalAloft > 0) return files[i].key;
    }
  }
  return null;
}

async function fetchAndParse(
  key: string,
  locations: string[],
): Promise<BirdCastReading[]> {
  const res = await fetch(`${BUCKET}/${key}`);
  if (!res.ok) throw new Error(`BirdCast fetch ${key}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const csvText = gunzipSync(buf).toString("utf-8");

  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const idx = (col: string) => header.indexOf(col);

  const out: BirdCastReading[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const location = cols[idx("location")];
    if (!locations.includes(location)) continue;
    out.push({
      datetimeUtc: cols[idx("datetime")] ?? "",
      datetimeLocal: cols[idx("datetime_local")] ?? "",
      location,
      enabled: (cols[idx("enabled")] ?? "").trim().toUpperCase() === "TRUE",
      partOfDay: (cols[idx("part_of_day")] ?? "").trim(),
      mtr: Number(cols[idx("mtr")]) || 0,
      vid: Number(cols[idx("vid")]) || 0,
      flightSpeedMs: Number(cols[idx("ff")]) || 0,
      flightDirectionDeg: Number(cols[idx("dd")]) || 0,
      heightMeanM: Number(cols[idx("height_mean")]) || 0,
      heightMaxM: Number(cols[idx("height_max")]) || 0,
      birdsAloft: Number(cols[idx("birds_aloft")]) || 0,
      birdsPassed: Number(cols[idx("birds_passed")]) || 0,
    });
  }
  return out;
}

export async function fetchBirdCastSnapshot(): Promise<BirdCastSnapshot | null> {
  try {
    const key = await findLatestNightFile();
    if (!key) return null;
    const readings = await fetchAndParse(key, [ARANSAS, NUECES]);
    const aransas = readings.find((r) => r.location === ARANSAS) ?? null;
    const nueces = readings.find((r) => r.location === NUECES) ?? null;
    if (!aransas && !nueces) return null;

    const isNight =
      (aransas?.partOfDay ?? "") === "night" ||
      (nueces?.partOfDay ?? "") === "night";

    return {
      fetchedAt: new Date().toISOString(),
      asOf: aransas?.datetimeUtc ?? nueces?.datetimeUtc ?? "",
      aransas,
      nueces,
      combinedPassed:
        (aransas?.birdsPassed ?? 0) + (nueces?.birdsPassed ?? 0),
      combinedAloft: (aransas?.birdsAloft ?? 0) + (nueces?.birdsAloft ?? 0),
      isNight,
      sourceKey: key,
    };
  } catch (err) {
    console.warn("[birdcast] fetchBirdCastSnapshot failed:", err);
    return null;
  }
}

/** Convert flight direction degrees to a compass label */
export function compassLabel(deg: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const i = Math.round(((deg % 360) + 360) / 22.5) % 16;
  return dirs[i];
}

/** Convert m/s to mph */
export function msToMph(ms: number): number {
  return ms * 2.23694;
}

/** Convert m AGL to ft AGL */
export function mToFt(m: number): number {
  return m * 3.28084;
}
