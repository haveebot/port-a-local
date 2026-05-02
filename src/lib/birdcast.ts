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
  /** Cumulative birds_passed sum for Aransas County over the last ~12 hours (the "tonight" number) */
  recentTotalAransas: number;
  /** Cumulative birds_passed sum for Nueces County over the last ~12 hours */
  recentTotalNueces: number;
  /** Sum of recentTotalAransas + recentTotalNueces — the headline "X birds crossed overnight" number */
  recentTotalCombined: number;
  /** How many 10-min intervals were summed (sanity-check for partial-data nights) */
  recentIntervalsCounted: number;
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

/**
 * Sum birds_passed across recent intervals to produce the "X birds crossed
 * overnight" headline. Pulls files from the last ~12 hours, filters to
 * enabled rows, sums birds_passed per county.
 *
 * Why 12 hours: covers a full overnight migration window (sunset → sunrise
 * is ~10.5 hours in spring; 12 gives buffer for early-evening start). When
 * called during day, captures last night's totals; when called at night,
 * captures tonight-so-far PLUS late-yesterday tail — both impressive,
 * neither inflated.
 *
 * Parallel-fetched in chunks of 8 to stay under Vercel's connection
 * concurrency comfort + the 10s function-execution budget. ~72 files
 * worst-case (12hr × 6 per hr); ~9 batches = sub-3-second total in practice.
 */
async function fetchRecentTotals(hoursBack: number = 12): Promise<{
  aransas: number;
  nueces: number;
  intervalsCounted: number;
}> {
  const now = new Date();
  const since = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

  // Pull file lists for today + yesterday (UTC) — covers any 12hr window
  const allFiles: ListedFile[] = [];
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const files = await listFiles(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
    allFiles.push(...files);
  }

  // Filter to files within the lookback window — parse YYYYMMDD-HHMM out of filename
  const inWindow: ListedFile[] = [];
  for (const f of allFiles) {
    const m = f.key.match(/livemig_gen-(\d{8})-(\d{4})/);
    if (!m) continue;
    const ymd = m[1];
    const hm = m[2];
    const fileTs = new Date(
      `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T${hm.slice(
        0,
        2,
      )}:${hm.slice(2, 4)}:00Z`,
    );
    if (fileTs >= since) inWindow.push(f);
  }

  // Parallel-fetch in chunks of 8 to keep concurrency reasonable
  const CHUNK = 8;
  let aransas = 0;
  let nueces = 0;
  let intervalsCounted = 0;

  for (let i = 0; i < inWindow.length; i += CHUNK) {
    const chunk = inWindow.slice(i, i + CHUNK);
    const results = await Promise.all(
      chunk.map((f) =>
        fetchAndParse(f.key, [ARANSAS, NUECES]).catch(() => []),
      ),
    );
    for (const readings of results) {
      const a = readings.find((r) => r.location === ARANSAS);
      const n = readings.find((r) => r.location === NUECES);
      if (a?.enabled) aransas += a.birdsPassed;
      if (n?.enabled) nueces += n.birdsPassed;
      intervalsCounted++;
    }
  }

  return { aransas, nueces, intervalsCounted };
}

export async function fetchBirdCastSnapshot(): Promise<BirdCastSnapshot | null> {
  try {
    const key = await findLatestNightFile();
    if (!key) return null;
    const [readings, totals] = await Promise.all([
      fetchAndParse(key, [ARANSAS, NUECES]),
      fetchRecentTotals(12).catch(() => ({
        aransas: 0,
        nueces: 0,
        intervalsCounted: 0,
      })),
    ]);
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
      recentTotalAransas: totals.aransas,
      recentTotalNueces: totals.nueces,
      recentTotalCombined: totals.aransas + totals.nueces,
      recentIntervalsCounted: totals.intervalsCounted,
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
