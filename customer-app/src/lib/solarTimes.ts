// Solar position math — sunrise / sunset / golden hour for any lat/lon/date.
// NOAA's solar calculator algorithm (no API call, pure local computation).
// Accurate to ~1 minute, plenty for a "sunset in N hours" UX.
//
// Reference: https://gml.noaa.gov/grad/solcalc/solareqns.PDF

const PORT_ARANSAS_LAT = 27.8397;
const PORT_ARANSAS_LON = -97.0725;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Solar position for a given date+lat+lon. Returns sunrise / sunset
 * (and the corresponding golden-hour starts) as Date objects in local time.
 * If the day is polar night/day, returns nulls.
 */
export interface SolarTimes {
  sunrise: Date | null;
  sunset: Date | null;
  /** Golden hour ends at sunrise; this is when the warm window opens in the morning. */
  goldenHourMorningStart: Date | null;
  /** Golden hour starts here in the evening; ends at sunset. */
  goldenHourEveningStart: Date | null;
}

function solarEvent(date: Date, lat: number, lon: number, sunAltitude: number, evening: boolean): Date | null {
  // NOAA solar equations. Anchor to noon UT of the input calendar day so
  // we always compute *today's* sunrise/sunset regardless of clock time.
  // Critical: longitude shifts solar noon from prime meridian to local;
  // east is positive, so Port Aransas (lon = -97.07°W) gets +0.27d.
  const noonUT = new Date(date);
  noonUT.setUTCHours(12, 0, 0, 0);
  const n = julianDay(noonUT) - 2451545.0 - lon / 360;
  const M = (357.5291 + 0.98560028 * n) % 360; // mean solar anomaly (deg)
  const C =
    1.9148 * Math.sin(toRad(M)) +
    0.02 * Math.sin(toRad(2 * M)) +
    0.0003 * Math.sin(toRad(3 * M));
  const lambda = (M + C + 180 + 102.9372) % 360; // ecliptic longitude
  const Jtransit =
    2451545.0 + n + 0.0053 * Math.sin(toRad(M)) - 0.0069 * Math.sin(toRad(2 * lambda));
  const sinDecl = Math.sin(toRad(lambda)) * Math.sin(toRad(23.44));
  const decl = toDeg(Math.asin(sinDecl));

  const cosH =
    (Math.sin(toRad(sunAltitude)) - Math.sin(toRad(lat)) * Math.sin(toRad(decl))) /
    (Math.cos(toRad(lat)) * Math.cos(toRad(decl)));

  if (cosH < -1 || cosH > 1) return null; // sun never reaches that altitude today

  const H = toDeg(Math.acos(cosH));
  const Jevent = Jtransit + (evening ? H : -H) / 360;
  return new Date((Jevent - 2440587.5) * 86400000);
}

export function getSolarTimes(date: Date = new Date(), lat = PORT_ARANSAS_LAT, lon = PORT_ARANSAS_LON): SolarTimes {
  // Standard sunrise/sunset uses an altitude of -0.833° (atmospheric refraction).
  const sunrise = solarEvent(date, lat, lon, -0.833, false);
  const sunset = solarEvent(date, lat, lon, -0.833, true);
  // Golden hour is roughly the period when the sun is between 6° and 0°.
  const goldenHourMorningStart = solarEvent(date, lat, lon, -4, false);
  const goldenHourEveningStart = solarEvent(date, lat, lon, 6, true);
  return { sunrise, sunset, goldenHourMorningStart, goldenHourEveningStart };
}

/**
 * "7:42p" style for the readout — always rendered in US Central, since the
 * data is from Port Aransas regardless of the viewing device's timezone.
 */
export function formatSolarTime(d: Date): string {
  // en-US "h:mm a" in America/Chicago, then squash "AM"/"PM" → "a"/"p".
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);
  let hour = "", minute = "", ampm = "a";
  for (const p of parts) {
    if (p.type === "hour") hour = p.value;
    else if (p.type === "minute") minute = p.value;
    else if (p.type === "dayPeriod") ampm = p.value.toLowerCase().startsWith("p") ? "p" : "a";
  }
  return `${hour}:${minute}${ampm}`;
}

/**
 * Golden-hour intensity — 0 to 1 — based on how close `now` is to today's sunset.
 *
 *   Far from sunset       → 0
 *   60 min before sunset  → starts ramping up
 *   At sunset             → 1.0  (peak)
 *   30 min after sunset   → fully back to 0 (twilight done)
 */
export function getGoldenHourIntensity(now: Date = new Date(), lat = PORT_ARANSAS_LAT, lon = PORT_ARANSAS_LON): number {
  const { sunset } = getSolarTimes(now, lat, lon);
  if (!sunset) return 0;
  const minutesUntilSunset = (sunset.getTime() - now.getTime()) / 60000;

  // Ramp up: 60 min before sunset → 0, at sunset → 1
  if (minutesUntilSunset >= 0 && minutesUntilSunset <= 60) {
    return 1 - minutesUntilSunset / 60;
  }
  // Fade out: at sunset → 1, 30 min after → 0
  if (minutesUntilSunset < 0 && minutesUntilSunset >= -30) {
    return 1 + minutesUntilSunset / 30;
  }
  return 0;
}

/** Human-friendly "in 1h 23m" / "in 14m" / "now" / "passed". */
export function timeUntil(target: Date, from: Date = new Date()): string {
  const diffMin = Math.round((target.getTime() - from.getTime()) / 60000);
  if (diffMin < -1) return "passed";
  if (diffMin <= 1) return "now";
  if (diffMin < 60) return `in ${diffMin}m`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}
