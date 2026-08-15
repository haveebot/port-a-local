#!/usr/bin/env python3
"""SH 361 strip map: crashes per half-mile along TxDOT DFO, fatal/serious markers, landmarks.
Input: cris_sh361_stretch.csv (CRIS extract). Optional: sh361_access_inventory.csv (name,type,lat,lon,...) for access-point ticks.
Output: sh361_stripmap.png + .svg
"""
import csv, os, sys, math
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

HERE = os.path.dirname(os.path.abspath(__file__))
S = list(csv.DictReader(open(os.path.join(HERE, "cris_sh361_stretch.csv"))))
def f(x):
    try: return float(x)
    except: return None

# lat -> DFO linear map (from data anchors)
A_DFO, A_LAT = 19.50, 27.8064
B_DFO, B_LAT = 35.22, 27.6179
def dfo_from_lat(lat): return A_DFO + (A_LAT - lat) * (B_DFO - A_DFO) / (A_LAT - B_LAT)

X0, X1 = 19.3, 35.5
BIN = 0.5
bins = {}
for r in S:
    d = f(r["DFO"])
    if d is None: continue
    b = math.floor(d / BIN) * BIN
    bins[b] = bins.get(b, 0) + 1
fatal = [(f(r["DFO"]), int(r["Death Count"] or 0), r["Crash Date"][:4], r["Manner of Collision"]) for r in S if r["Crash Severity"].startswith("K") and f(r["DFO"]) is not None]
serious = [f(r["DFO"]) for r in S if r["Crash Severity"].startswith("A") and f(r["DFO"]) is not None]

# landmarks (DFO, label, style)
LM = [
    (19.50, "Beach Access Rd 1A /\nPiper Blvd (signal)", "pub"),
    (20.31, "Beach Access Rd 1\n(TxDOT project start)", "pub"),
    (20.80, "Port A city limit", "line"),
    (22.13, "Corpus Christi city limit", "line"),
    (dfo_from_lat(27.7725), "Access Rd 1-B\n(opened Mar 2, 2026)", "pub"),
    (27.72, "Beach Access Rd 2", "pub"),
    (32.11, "Access Rd 3", "pub"),
    (33.40, "Newport Pass Rd", "pub"),
    (34.44, "Zahn Rd", "pub"),
    (35.22, "PR 22\n(signal)", "pub"),
]
# optional development access points from inventory
dev = []
inv = os.path.join(HERE, "sh361_access_inventory.csv")
# snap inventory points to the DFO of the nearest CRIS crash location (all CRIS points sit on the highway)
CRIS_PTS = [(f(r["Latitude"]), f(r["Longitude"]), f(r["DFO"])) for r in S if f(r["Latitude"]) and f(r["Longitude"]) and f(r["DFO"]) is not None]
def snap_dfo(la, lo):
    best = min(CRIS_PTS, key=lambda p: (p[0]-la)**2 + ((p[1]-lo)*0.887)**2)
    return best[2]
SKIP = ("unknown", "utility", "residence", "private", "public utility", "intersection")
if os.path.exists(inv):
    seen = []
    for r in csv.DictReader(open(inv)):
        la = f(r.get("lat")); lo = f(r.get("lon"))
        if la is None or lo is None: continue
        typ = (r.get("type") or "").lower()
        if any(k in typ for k in SKIP): continue
        d = snap_dfo(la, lo)
        if not (X0 <= d <= X1): continue
        if any(abs(d - x) < 0.12 for x in seen): 
            d = d + 0.12  # nudge near-duplicates so labels don't stack exactly
        seen.append(d)
        name = r.get("name","").split(" - ")[0].split(" (")[0].strip()
        ys = (r.get("opened_year") or "").strip()
        import re as _re
        yr = ""
        if ys and not ys.lower().startswith(("n.d", "ncad_pending", "-")):
            m = _re.search(r"(?:opened|built|construction (?:began|from)|first home sale|first units built|est\.)\D{0,30}?((?:19|20)\d\d)", ys, flags=_re.I)
            if not m: m = _re.search(r"((?:19|20)\d\d)", ys)
            yr = m.group(1) if m else ""
        dev.append((d, name[:28], yr, typ))

# --- figure -------------------------------------------------------------
INK = "#1f2933"; MUTED = "#6b7280"; GRID = "#e5e7eb"; BAR = "#9aa5b1"; BAR_BLVD = "#c5cdd6"
FATAL = "#b42318"; SERIOUS = "#d97706"; ACCENT = "#0f766e"
fig, (ax, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 12), gridspec_kw={"height_ratios": [3.0, 1.25, 1.9], "hspace": 0.06}, sharex=True)
fig.patch.set_facecolor("white")

# boulevard section shading (4-lane curbed median, Port A south edge)
for a in (ax, ax2, ax3):
    a.axvspan(19.46, 20.35, color="#eef2f6", zorder=0, lw=0)
    a.set_xlim(X0, X1)
    for s in ("top", "right"): a.spines[s].set_visible(False)
    a.spines["left"].set_color(GRID); a.spines["bottom"].set_color(GRID)
    a.tick_params(colors=MUTED, labelsize=9)

# bars
xs = sorted(bins)
ax.bar([x + BIN/2 for x in xs], [bins[x] for x in xs], width=BIN*0.92, color=BAR, zorder=2, linewidth=0)
ax.set_ylabel("Crashes per half-mile, 2016 – Aug 2026", color=MUTED, fontsize=10)
ax.yaxis.grid(True, color=GRID, lw=0.8, zorder=1); ax.set_axisbelow(True)
ymax = max(bins.values()) * 1.25
ax.set_ylim(0, ymax)
ax.text(19.9, ymax*0.80, "4-lane\ncurbed\nblvd", ha="center", va="top", fontsize=7.5, color=MUTED)
ax.text(23.6, ymax*0.97, "two-lane, undivided, no median — 60 mph →", ha="center", va="top", fontsize=9, color=MUTED, style="italic")

# serious-injury crashes: small amber ticks just above baseline row
for d in serious:
    ax.plot([d], [ymax*0.06], marker="|", color=SERIOUS, ms=12, mew=2, zorder=3)
# fatal crashes: red diamonds, size by deaths, year label
prev=None; flip=False
for d, deaths, yr, manner in sorted(fatal):
    ax.plot([d], [ymax*0.14], marker="D", color=FATAL, ms=8 + 4*(deaths-1), zorder=4, mec="white", mew=1)
    flip = (prev is not None and d - prev < 0.35) and not flip
    dy = 9 if not flip else 34
    ax.annotate(f"{yr}" + (f" ×{deaths}" if deaths > 1 else ""), (d, ymax*0.14), xytext=(0, dy), textcoords="offset points", ha="center", fontsize=7.5, color=FATAL, rotation=90, va="bottom")
    prev=d

# news-reported fatal crashes not yet in CRIS (Aug 2026): hollow diamonds
NEWS=[(27.72,1,"Aug 10 2026\n(news)"),(26.9,2,"Aug 14 2026 ×2\n(news)")]
for d,deaths,lab in NEWS:
    ax.plot([d],[ymax*0.14],marker="D",mfc="white",mec=FATAL,mew=1.6,ms=8+4*(deaths-1),zorder=4)
    ax.annotate(lab,(d,ymax*0.14),xytext=(0,60 if deaths==1 else 34),textcoords="offset points",ha="center",fontsize=7,color=FATAL,rotation=90,va="bottom")
# landmarks
for d, lab, kind in LM:
    for a in (ax, ax2, ax3):
        a.axvline(d, color=ACCENT if kind=="pub" else MUTED, lw=1 if kind=="pub" else 0.8, ls="-" if kind=="pub" else "--", alpha=0.7, zorder=1)
    ax2.text(d - (0.22 if "Corpus" in lab else 0), 0.97, lab, rotation=90, ha="center", va="top", fontsize=7, color=ACCENT if kind=="pub" else MUTED,
             bbox=dict(boxstyle="round,pad=0.12", fc="white", ec="none", alpha=0.9))
ax2.set_ylim(0, 1); ax2.set_yticks([]); ax2.set_ylabel("public\nroads", color=MUTED, fontsize=8, rotation=0, ha="right", va="center")
# development access points
prev_d=None; alt=False
for d, name, yr, typ in sorted(dev):
    ax3.plot([d], [0.04], marker="^", color=INK, ms=5, zorder=3)
    alt = (prev_d is not None and d - prev_d < 0.22) and not alt
    ax3.text(d, 0.08 if not alt else 0.50, f"{name}" + (f" ({yr})" if yr else ""), rotation=90, ha="center", va="bottom", fontsize=5.4, color=INK)
    prev_d = d
ax3.set_ylim(0, 1); ax3.set_yticks([]); ax3.set_ylabel("development\naccess points", color=MUTED, fontsize=8, rotation=0, ha="right", va="center")
ax3.set_xlabel("Miles along SH 361 (TxDOT distance-from-origin)  ·  north (Port Aransas) → south (Park Road 22)", color=MUTED, fontsize=10)
ax3.set_xticks(range(20, 36))

# legend (text + marks, not color alone)
from matplotlib.lines import Line2D
h = [Line2D([0],[0], marker="s", color=BAR, lw=0, ms=10, label="Crashes per half-mile (all severities)"),
     Line2D([0],[0], marker="D", color=FATAL, lw=0, ms=8, label="Fatal crash (larger = 2 deaths; year labeled)"),
     Line2D([0],[0], marker="D", mfc="white", mec=FATAL, mew=1.6, lw=0, ms=8, label="Fatal crash reported Aug 10 & Aug 14, 2026 — not yet in CRIS (approx. location)"),
     Line2D([0],[0], marker="|", color=SERIOUS, lw=0, ms=12, mew=2, label="Suspected-serious-injury crash"),
     Line2D([0],[0], color=ACCENT, lw=1, label="Public access road / signal")]
if dev:
    h.append(Line2D([0],[0], marker="^", color=INK, lw=0, ms=6, label="Development access point (see inventory)"))
ax.legend(handles=h, loc="upper right", frameon=False, fontsize=8.5, labelcolor=INK)

n = len(S); nf = len(fatal); nd = sum(x[1] for x in fatal)
fig.suptitle("SH 361, Mustang Island — where the crashes are, and where the deaths are", x=0.02, ha="left", fontsize=14, color=INK, weight="bold", y=0.985)
ax.set_title(f"TxDOT CRIS, Nueces County SH 361 between Beach Access Rd 1A and PR 22 · {n} crashes, {nf} fatal crashes, {nd} deaths in CRIS (2016 – Aug 15, 2026),\n"
             "plus two fatal crashes / three deaths reported Aug 10 & 14, 2026. Both ends carry the most crashes; 14 of 15 fatal crashes are in the undivided, no-median middle.", loc="left", fontsize=9.5, color=MUTED, pad=8)
plt.savefig(os.path.join(HERE, "sh361_stripmap.png"), dpi=170, bbox_inches="tight", facecolor="white")
plt.savefig(os.path.join(HERE, "sh361_stripmap.svg"), bbox_inches="tight", facecolor="white")
print("saved", n, nf, nd, "dev points:", len(dev))
