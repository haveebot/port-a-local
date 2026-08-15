# SH 361 crash-record method note (for publication alongside the Dispatch)

_Prepared 2026-08-15. All sources public; no accounts, no records requests._

## Crash records
- **Source:** Texas Department of Transportation, Crash Records Information System (CRIS), public Query tool — https://cris.dot.state.tx.us/public/Query/app/home. Data "as of 08/15/2026." CRIS holds reportable crashes (Texas Peace Officer's Crash Report, CR-3) for the previous ten full calendar years plus the current year.
- **Query:** Crashes · Crash Year 2016–2026 · County = NUECES · Highway = SH0361 → 966 crashes / 1,902 units / 3,326 persons. Attribute list exported with 54 crash-level fields (date, time, severity, death/injury counts, latitude/longitude, TxDOT distance-from-origin (DFO), reference marker, contributing factors, manner of collision, first harmful event, intersection relation, traffic control, light/weather/surface, speed limit, median type, lane design, TxDOT-attached ADT). Files: `cris_sh361_nueces_2016_2026.csv` (all 966), `cris_sh361_stretch.csv` (516).
- **The stretch:** SH 361 from Beach Access Road 1A / Piper Blvd at Port Aransas's south edge (TxDOT DFO 19.50; 27.8064, −97.0825) to Park Road 22 (DFO 35.22; 27.6179, −97.2218) — 15.7 miles, matching TxDOT's "approximately 15-mile corridor" for the SH 361 Mustang Island Project (CSJ 2263-03-024). Crashes were assigned to the stretch by DFO (latitude used for the few rows without DFO). The county-wide set additionally contains SH 361 in Port Aransas proper and on Harbor Island toward the Aransas Pass ferry.
- **Segments used for rates:** Port A boulevard (DFO 19.46–20.34; 4-lane curbed median, built 2016–17) · Middle (20.34–27.71; two-lane undivided, 60 mph; Port A city edge to Beach Access Road 2) · South (27.71–35.22; two-lane undivided; Beach Access Road 2 to PR 22).
- **Fatal-crash cross-check:** NHTSA FARS (crashviewer.nhtsa.dot.gov CrashAPI), Texas / Nueces County, 2014–2024, filtered to SR-361 within the island bounding box. Every CRIS fatal crash on the stretch for 2016–2024 appears in FARS at the same coordinates (10 crashes / 12 deaths); FARS adds two pre-2016 fatal crashes (2014-03-16, 2015-05-03).

## Exposure (vehicle-miles)
- **Source:** TxDOT Annual Average Daily Traffic, "TxDOT_AADT_Annuals (Public View)" ArcGIS feature service (Transportation Planning & Programming), 2025 report with 12 prior years per station. Stations on SH 361 in Nueces County: 178H47 (27.7918, just south of Port Aransas city limits) used for the middle segment; 178H46 (27.6205, near Zahn Rd) for the south segment; 178H48 (27.818) for the Port A boulevard. File: `aadt_361.json`.
- **VMT** = Σ over 2016–2025 of (station AADT for that year × segment length in miles × 365). Rates = count ÷ (VMT ÷ 100,000,000). Caveat: two count stations represent 15 miles; AADT is annualized, so Spring Break/summer peaks are averaged in.

## Benchmarks
- TxDOT, *Texas Motor Vehicle Traffic Crash Facts, Calendar Year 2024* — "Statewide Traffic Crash Rates 2024" (crashes per 100M VMT by highway system and road type: rural State Highway 94.00; rural 2-lane 2-way 100.46; rural 4+ lane divided 57.92; rural 4+ lane undivided 105.15), "Rural and Urban Crashes and Injuries by Severity 2024," and "Comparison of Motor Vehicle Traffic Deaths, Vehicle Miles, Death Rates 2003–2025" (statewide fatality rate per 100M VMT: 1.35 in 2024; 39,783 deaths on 2,875 billion VMT 2016–2025 = 1.38). PDFs in this folder.
- NHTSA, *Rural/Urban Comparison of Motor Vehicle Traffic Fatalities, 2022 Data* (DOT HS 813 599): rural 1.68 vs urban 1.15 fatalities per 100M VMT.

## Reproduce
`python3 cris_decode.py` (decodes the raw CRIS JSON reply saved from the Query tool's own REST call, `cris_body.json` is the request) → `python3 cris_stretch.py` (stretch statistics) → `python3 stripmap.py` / `python3 geomap.py` (figures).
