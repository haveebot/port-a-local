import { NextResponse } from "next/server";

const STATION = "8775237"; // Port Aransas
const BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

async function fetchNOAA(product: string, extra = "") {
  const url = `${BASE}?date=latest&station=${STATION}&product=${product}&time_zone=lst_ldt&units=english&format=json${extra}`;
  const res = await fetch(url, { next: { revalidate: 300 } }); // Cache 5 min
  if (!res.ok) return null;
  return res.json();
}

async function fetchTides() {
  const url = `${BASE}?date=today&station=${STATION}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;
  const res = await fetch(url, { next: { revalidate: 600 } }); // Cache 10 min
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  try {
    const [waterTemp, airTemp, wind, tides] = await Promise.all([
      fetchNOAA("water_temperature"),
      fetchNOAA("air_temperature"),
      fetchNOAA("wind"),
      fetchTides(),
    ]);

    return NextResponse.json({
      waterTemp: waterTemp?.data?.[0]?.v ?? null,
      airTemp: airTemp?.data?.[0]?.v ?? null,
      windSpeed: wind?.data?.[0]?.s ?? null,
      windDirection: wind?.data?.[0]?.dr ?? null,
      windGust: wind?.data?.[0]?.g ?? null,
      tides: tides?.predictions ?? [],
      station: STATION,
      updatedAt: waterTemp?.data?.[0]?.t ?? new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conditions" }, { status: 500 });
  }
}
