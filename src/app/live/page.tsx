"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// === WEBCAM SOURCES (HDOnTap embeds + city ferry cams) ===
const webcams = [
  {
    id: "dunes",
    name: "The Dunes Beach Cam",
    description: "PTZ beach cam from The Dunes Condominiums — panoramic Gulf views",
    embedUrl: "https://hdontap.com/stream/259405/the-dunes-port-aransas-live-beach-cam/embed/",
    source: "HDOnTap / The Dunes",
  },
  {
    id: "casa",
    name: "Casa Condos Beach Cam",
    description: "Rotating shoreline and surf views from Casa Condominiums",
    embedUrl: "https://hdontap.com/stream/831616/casa-condos-port-aransas-beach-live-webcam/embed/",
    source: "HDOnTap / Casa Condos",
  },
  {
    id: "aransas-princess",
    name: "Aransas Princess Beach Cam",
    description: "Beach and Gulf of Mexico from Aransas Princess Condos",
    embedUrl: "https://hdontap.com/stream/167516/aransas-princess-port-aransas-beach-live-webcam/embed/",
    source: "HDOnTap / Aransas Princess",
  },
  {
    id: "sandpiper",
    name: "Sandpiper Beach Cam",
    description: "Panoramic southeast-facing beach view from Sandpiper Condos",
    embedUrl: "https://hdontap.com/stream/518728/port-aransas-beach-live-webvam/embed/",
    source: "HDOnTap / Sandpiper",
  },
  {
    id: "seagull",
    name: "Sea Gull Beach Cam",
    description: "Northeast surf and shoreline from Sea Gull Condos on Mustang Island",
    embedUrl: "https://hdontap.com/stream/814199/port-aransas-beach-seagull-condos-live-webcam/embed/",
    source: "HDOnTap / Sea Gull Condos",
  },
  {
    id: "gulf-shores",
    name: "Gulf Shores Beach Cam",
    description: "East-southeast facing — waves and horizon from Gulf Shores Condos",
    embedUrl: "https://hdontap.com/stream/776400/gulf-shores-port-aransas-live-beach-cam/embed/",
    source: "HDOnTap / Gulf Shores",
  },
  {
    id: "sandcastle",
    name: "Sandcastle Beach Cam",
    description: "PTZ Gulf views from Sand Castle Resort Condominiums",
    embedUrl: "https://hdontap.com/stream/896845/sandcastle-condos-port-aransas-live-beach-cam/embed/",
    source: "HDOnTap / Sandcastle",
  },
  {
    id: "ferry-south",
    name: "Ferry Landing — South View",
    description: "Watch ferries load and cross Aransas Pass",
    embedUrl: "https://cityofportaransas.org/ferrycam1/",
    source: "City of Port Aransas",
  },
];

// === NOAA STATIONS ===
const BUOY_STATION = "PCNT2";
const TIDE_STATION = "8775241";

// === EXTERNAL LINKS ===
const externalLinks = [
  {
    name: "NOAA Marine Forecast",
    description: "Official marine weather forecast for the Aransas Pass area",
    url: "https://forecast.weather.gov/MapClick.php?lat=27.8339&lon=-97.0611&marine=1",
    icon: "🌊",
  },
  {
    name: "Tide Predictions",
    description: "NOAA tide charts for Aransas Pass",
    url: `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${TIDE_STATION}`,
    icon: "🌙",
  },
  {
    name: "Surf Report",
    description: "Current surf conditions at Port Aransas",
    url: "https://www.surfline.com/surf-report/port-aransas/584204204e65fad6a7709cde",
    icon: "🏄",
  },
  {
    name: "Ship Traffic — VesselFinder",
    description: "Live AIS ship tracking for Aransas Pass",
    url: "https://www.vesselfinder.com/?rlat=27.834&rlon=-97.061&zoom=13",
    icon: "⛴️",
  },
  {
    name: "Ferry Wait Times",
    description: "TxDOT real-time ferry status — also on AM 530 radio",
    url: "https://www.txdot.gov/about/districts/corpus-christi/port-aransas-ferry.html",
    icon: "🛥️",
  },
  {
    name: "NOAA Buoy Station",
    description: "Raw observation data from coastal stations near Port Aransas",
    url: `https://www.ndbc.noaa.gov/station_page.php?station=${BUOY_STATION}`,
    icon: "📡",
  },
  {
    name: "All Port A Webcams",
    description: "Full list of webcams on the official tourism site",
    url: "https://www.portaransas.org/plan/webcam/",
    icon: "📹",
  },
];

export default function LivePage() {
  const [activeWebcam, setActiveWebcam] = useState(webcams[0].id);
  const currentCam = webcams.find((w) => w.id === activeWebcam) || webcams[0];

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live from Port Aransas
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Island Pulse
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Webcams, weather, tides, ship traffic, and surf conditions — everything happening on the island right now.
          </p>
        </div>
      </section>

      {/* Webcams */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Live Cameras
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              See the Island Right Now
            </h2>
          </div>

          {/* Cam selector tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {webcams.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveWebcam(cam.id)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 ${
                  activeWebcam === cam.id
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white text-navy-600 border-sand-200 hover:border-coral-300 hover:text-coral-600"
                }`}
              >
                {cam.name.replace(" Beach Cam", "").replace(" — South View", "")}
              </button>
            ))}
          </div>

          {/* Active cam */}
          <div className="rounded-2xl overflow-hidden border border-sand-200 bg-navy-950">
            <div className="aspect-video">
              <iframe
                key={currentCam.id}
                src={currentCam.embedUrl}
                title={currentCam.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-white border-t border-sand-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-900">{currentCam.name}</p>
                  <p className="text-sm text-navy-400">{currentCam.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </div>
              </div>
              <p className="text-xs text-navy-300 mt-2">Source: {currentCam.source}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ship Traffic */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Ship Channel
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Live Vessel Traffic
            </h2>
            <p className="text-navy-400 font-light">
              Real-time ship positions in the Corpus Christi Ship Channel. Click a vessel for details — tankers, cargo ships, offshore rigs, and ferries all pass through Aransas Pass.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-sand-200 bg-white">
            <div className="aspect-video">
              <iframe
                src="https://www.marinetraffic.com/en/ais/embed/zoom:12/centery:27.83/centerx:-97.06/maptype:0/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:/remember:false"
                title="MarineTraffic — Aransas Pass"
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
            <div className="p-4 border-t border-sand-200">
              <p className="text-sm text-navy-400">
                Powered by{" "}
                <a href="https://www.marinetraffic.com" target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:text-coral-600">
                  MarineTraffic
                </a>{" "}
                — click any vessel for name, type, speed, and destination
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weather & Conditions */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Current Conditions
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Weather & Tides
            </h2>
            <p className="text-navy-400 font-light">
              Real-time data from NOAA coastal monitoring stations near Port Aransas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NOAA Buoy Widget */}
            <div className="rounded-2xl overflow-hidden border border-sand-200 bg-white">
              <div className="p-4 border-b border-sand-200">
                <h3 className="font-display font-bold text-navy-900">Coastal Observations</h3>
                <p className="text-xs text-navy-400 mt-1">NOAA Station {BUOY_STATION} — water temp, wind, pressure</p>
              </div>
              <div className="p-4">
                <iframe
                  src={`https://www.ndbc.noaa.gov/widgets/station_page.php?station=${BUOY_STATION}`}
                  title="NOAA Buoy Data"
                  className="w-full h-[350px] border-0"
                />
              </div>
            </div>

            {/* Tide Widget */}
            <div className="rounded-2xl overflow-hidden border border-sand-200 bg-white">
              <div className="p-4 border-b border-sand-200">
                <h3 className="font-display font-bold text-navy-900">Tide Predictions</h3>
                <p className="text-xs text-navy-400 mt-1">NOAA Station {TIDE_STATION} — 3-day tide chart</p>
              </div>
              <div className="p-4">
                <iframe
                  src={`https://tidesandcurrents.noaa.gov/noaatidewidget/widget.php?id=${TIDE_STATION}&type=prediction&days=3`}
                  title="NOAA Tide Predictions"
                  className="w-full h-[350px] border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Resources
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              More Island Data
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white rounded-xl border border-sand-200 p-5 card-hover"
              >
                <span className="text-2xl flex-shrink-0">{link.icon}</span>
                <div>
                  <p className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors text-sm">
                    {link.name}
                  </p>
                  <p className="text-xs text-navy-400 mt-1">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
