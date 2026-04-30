const LOG_ENTRIES = [
  { time: "07:22", note: "Fog rolling in early. Can't see the breakwater from the tower balcony." },
  { time: "09:45", note: "Caught a glimpse of the lighthouse beacon flickering — storm interference?" },
  { time: "11:08", note: "Tide higher than the tables predicted. Station 04 reporting minor spray on the glass." },
  { time: "14:30", note: "Whispers in the wires again. Just the wind, probably." },
  { time: "16:51", note: "Pelicans pushing south of the jetty. Bait pod working the tide line." },
];

export default function CoastalWatch() {
  return (
    <section className="relative bg-navy-950 border-y border-sand-200/10 overflow-hidden">
      <div className="absolute inset-0 palm-pattern opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8 font-mono text-[10px] tracking-[0.25em] uppercase text-sand-300/70">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral-400 coastal-live-dot" />
            <span>Coastal Watch · Station 04 · Port Aransas</span>
          </div>
          <span className="hidden sm:inline">27°50′N · 97°03′W</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Topo map of Mustang Island with pulsing "you are here" marker */}
          <div className="lg:col-span-2 relative rounded-xl border border-sand-200/10 bg-navy-900/60 p-4 min-h-[320px]">
            <div className="absolute top-4 left-4 right-4 flex justify-between font-mono text-[9px] tracking-[0.2em] uppercase text-sand-300/50">
              <span>Mustang Island</span>
              <span>Chart 11308</span>
            </div>
            <svg viewBox="0 0 400 320" className="w-full h-full" aria-label="Topographic map of Mustang Island with pulsing location marker">
              <defs>
                <radialGradient id="cw-marker-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f08589" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#e8656f" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#e8656f" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Outer water grid */}
              <g stroke="#3a6597" strokeOpacity="0.18" strokeWidth="0.5" fill="none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} />
                ))}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="320" />
                ))}
              </g>
              {/* Island contour lines — elongated NE-SW running barrier island */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path
                  d="M70,250 C110,210 160,180 220,150 C280,120 330,95 360,70"
                  stroke="#5a8ab8"
                  strokeOpacity="0.55"
                  strokeWidth="1.1"
                />
                <path
                  d="M85,260 C125,225 175,200 235,170 C295,140 340,115 365,95"
                  stroke="#7aaad5"
                  strokeOpacity="0.7"
                  strokeWidth="1.2"
                />
                <path
                  d="M105,265 C145,240 195,215 255,185 C300,160 335,140 360,125"
                  stroke="#a9c8e6"
                  strokeOpacity="0.85"
                  strokeWidth="1.3"
                />
                <path
                  d="M125,265 C170,245 215,225 270,200 C310,180 335,165 350,155"
                  stroke="#d4a843"
                  strokeOpacity="0.9"
                  strokeWidth="1.4"
                />
              </g>
              {/* Compass rose */}
              <g transform="translate(48,48)" stroke="#d4a843" strokeOpacity="0.6" fill="none" strokeWidth="0.8">
                <circle r="14" />
                <line x1="0" y1="-18" x2="0" y2="18" />
                <line x1="-18" y1="0" x2="18" y2="0" />
                <text x="0" y="-22" textAnchor="middle" fill="#d4a843" fillOpacity="0.7" fontSize="8" fontFamily="monospace">N</text>
              </g>
              {/* Pulsing "you are here" marker — Port A area at NE end of island */}
              <g transform="translate(255,170)">
                <circle r="22" fill="url(#cw-marker-glow)" className="coastal-marker-pulse" />
                <circle r="4" fill="#f08589" />
                <circle r="2" fill="#fff5d7" />
                <text x="14" y="4" fill="#f5d29a" fontSize="9" fontFamily="monospace" letterSpacing="1">PORT A</text>
              </g>
            </svg>
          </div>

          {/* Logbook feed — typewriter-style entries */}
          <div className="lg:col-span-3 relative rounded-xl border border-sand-200/10 bg-navy-900/60 p-6">
            <div className="flex items-center justify-between mb-5 font-mono text-[10px] tracking-[0.2em] uppercase text-sand-300/60">
              <span>The Logbook</span>
              <span className="text-coral-300/80">Live</span>
            </div>
            <ul className="space-y-3.5 font-serif">
              {LOG_ENTRIES.map((entry, i) => (
                <li
                  key={entry.time}
                  className="flex gap-4 coastal-log-entry"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <span className="font-mono text-[11px] tracking-wide text-gold-400/80 pt-1 w-12 shrink-0">
                    {entry.time}
                  </span>
                  <span className="text-sand-100/85 italic leading-relaxed">
                    &ldquo;{entry.note}&rdquo;
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-sand-200/10 grid grid-cols-3 gap-4 font-mono text-[10px] tracking-[0.2em] uppercase text-sand-300/60">
              <div>
                <div className="text-sand-200 text-base font-display tracking-normal normal-case">76°F</div>
                <div>Air</div>
              </div>
              <div>
                <div className="text-sand-200 text-base font-display tracking-normal normal-case">71°F</div>
                <div>Water</div>
              </div>
              <div>
                <div className="text-sand-200 text-base font-display tracking-normal normal-case">2.4 ft</div>
                <div>Tide · Rising</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
