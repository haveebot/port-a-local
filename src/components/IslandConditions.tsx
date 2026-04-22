"use client";

import { useState, useEffect } from "react";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

interface Conditions {
  waterTemp: string | null;
  airTemp: string | null;
  windSpeed: string | null;
  windDirection: string | null;
  windGust: string | null;
  tides: { t: string; v: string; type: string }[];
  updatedAt: string;
}

function ConditionCard({ icon, label, value, unit }: { icon: PortalIconName; label: string; value: string; unit: string }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5 text-center">
      <PortalIcon name={icon} className="w-7 h-7 mx-auto mb-2 text-navy-900" />
      <p className="text-2xl font-bold text-navy-900">
        {value}
        <span className="text-sm font-normal text-navy-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-navy-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

export default function IslandConditions() {
  const [data, setData] = useState<Conditions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conditions")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-navy-400 font-light">Loading conditions...</p>
      </div>
    );
  }

  if (!data || data.waterTemp === null) {
    return (
      <div className="text-center py-12">
        <p className="text-navy-400 font-light">
          Conditions data temporarily unavailable.{" "}
          <a
            href="https://www.ndbc.noaa.gov/station_page.php?station=PTAT2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral-500 hover:text-coral-600"
          >
            View on NOAA →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Condition cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <ConditionCard
          icon="thermometer"
          label="Water Temp"
          value={data.waterTemp ?? "--"}
          unit="°F"
        />
        <ConditionCard
          icon="sun"
          label="Air Temp"
          value={data.airTemp ?? "--"}
          unit="°F"
        />
        <ConditionCard
          icon="wind"
          label={`Wind ${data.windDirection ?? ""}`}
          value={data.windSpeed ?? "--"}
          unit="kts"
        />
        <ConditionCard
          icon="wind"
          label="Wind Gust"
          value={data.windGust ?? "--"}
          unit="kts"
        />
      </div>

      {/* Tide predictions */}
      {data.tides.length > 0 && (
        <div className="bg-white rounded-xl border border-sand-200 p-6">
          <h3 className="font-display font-bold text-navy-900 mb-4">Today&apos;s Tides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.tides.map((tide, i) => {
              const time = tide.t.split(" ")[1] ?? tide.t;
              const isHigh = tide.type === "H";
              return (
                <div
                  key={i}
                  className={`rounded-lg p-4 text-center ${
                    isHigh ? "bg-blue-50 border border-blue-100" : "bg-sand-50 border border-sand-100"
                  }`}
                >
                  <p className="text-xs font-semibold text-navy-400 uppercase mb-1">
                    {isHigh ? "High" : "Low"}
                  </p>
                  <p className="text-lg font-bold text-navy-900">{time}</p>
                  <p className="text-sm text-navy-400">{tide.v} ft</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-navy-300 mt-4">
            NOAA Station 8775237 — Port Aransas · Updated {data.updatedAt}
          </p>
        </div>
      )}
    </div>
  );
}
