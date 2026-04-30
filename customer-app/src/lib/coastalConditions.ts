// Live coastal conditions for the Port A Local Coastal Watch tile.
// Source: NOAA CO-OPS Station 8775237 (Port Aransas, TX).
// Free, no auth, ~10-min cache + in-flight dedupe to stay polite.

import { useCallback, useEffect, useState } from "react";

const STATION = "8775237";
const BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
const COMMON = `station=${STATION}&time_zone=lst_ldt&units=english&format=json&application=port-a-local`;
const CACHE_MS = 10 * 60 * 1000;

export type TideDirection = "rising" | "falling";

export type CoastalConditions = {
  airTempF: number | null;
  waterTempF: number | null;
  tideLevelFt: number | null;
  tideDirection: TideDirection | null;
  fetchedAt: number;
};

let cache: { data: CoastalConditions; expiresAt: number } | null = null;
let pending: Promise<CoastalConditions> | null = null;

const parseLatestValue = (json: unknown): number | null => {
  const data = (json as { data?: Array<{ v?: string }> } | null)?.data;
  if (!data || data.length === 0) return null;
  const v = parseFloat(data[data.length - 1].v ?? "");
  return Number.isFinite(v) ? v : null;
};

const directionFromSeries = (json: unknown): TideDirection | null => {
  const data = (json as { data?: Array<{ v?: string }> } | null)?.data;
  if (!data || data.length < 2) return null;
  const first = parseFloat(data[0].v ?? "");
  const last = parseFloat(data[data.length - 1].v ?? "");
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
  if (Math.abs(last - first) < 0.02) return null; // slack tide — don't claim a direction
  return last > first ? "rising" : "falling";
};

const FETCH_TIMEOUT_MS = 8000;

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`NOAA ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCoastalConditions(force = false): Promise<CoastalConditions> {
  if (!force && cache && cache.expiresAt > Date.now()) return cache.data;
  if (pending) return pending;

  pending = (async () => {
    try {
      const [airR, waterR, levelR] = await Promise.allSettled([
        getJson(`${BASE}?product=air_temperature&date=latest&${COMMON}`),
        getJson(`${BASE}?product=water_temperature&date=latest&${COMMON}`),
        // 1 hour of water_level (≈10 6-min datapoints) — last value + slope for direction.
        // datum=MLLW (Mean Lower Low Water) is the standard tide reference NOAA expects.
        getJson(`${BASE}?product=water_level&range=1&datum=MLLW&${COMMON}`),
      ]);

      const data: CoastalConditions = {
        airTempF: airR.status === "fulfilled" ? parseLatestValue(airR.value) : null,
        waterTempF: waterR.status === "fulfilled" ? parseLatestValue(waterR.value) : null,
        tideLevelFt: levelR.status === "fulfilled" ? parseLatestValue(levelR.value) : null,
        tideDirection: levelR.status === "fulfilled" ? directionFromSeries(levelR.value) : null,
        fetchedAt: Date.now(),
      };

      // Only cache when we have at least one real value — keeps stale cache
      // available on transient errors and lets a fresh attempt happen sooner
      // than the full 10-min window.
      const hasAnyValue =
        data.airTempF != null || data.waterTempF != null || data.tideLevelFt != null;
      if (hasAnyValue) {
        cache = { data, expiresAt: Date.now() + CACHE_MS };
      }
      return cache?.data ?? data;
    } finally {
      pending = null;
    }
  })();

  return pending;
}

export function useCoastalConditions(): { conditions: CoastalConditions | null; refresh: () => Promise<void> } {
  const [conditions, setConditions] = useState<CoastalConditions | null>(cache?.data ?? null);

  useEffect(() => {
    let cancelled = false;
    fetchCoastalConditions()
      .then((c) => { if (!cancelled) setConditions(c); })
      .catch(() => { /* keep prior or null on error */ });
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCoastalConditions(true);
      setConditions(data);
    } catch {
      /* keep last good state */
    }
  }, []);

  return { conditions, refresh };
}
