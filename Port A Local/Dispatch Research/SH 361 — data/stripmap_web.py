#!/usr/bin/env python3
"""Vertical strip map for the web article: miles run down the page (phone-friendly).
Three aligned columns: fatal crashes | crashes-per-half-mile bars | landmarks + access points.
"""
import csv, os, math
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

HERE = os.path.dirname(os.path.abspath(__file__))
S = list(csv.DictReader(open(os.path.join(HERE, "cris_sh361_stretch.csv"))))
def f(x):
    try: return float(x)
    except: return None

LO, HI, BIN = 20.31, 35.35, 0.5
bins = {}
for r in S:
    d = f(r["DFO"])
    if d is None or not (LO <= d <= HI): continue
    b = math.floor(d / BIN) * BIN
    bins[b] = bins.get(b, 0) + 1
fatal = [(f(r["DFO"]), int(r["Death Count"] or 0), r["Crash Date"][:4]) for r in S
         if r["Crash Severity"].startswith("K") and f(r["DFO"]) is not None and LO <= f(r["DFO"]) <= HI]
NEWS = [(27.72, 1, "Aug 10"), (26.90, 2, "Aug 14")]
ALL_FATAL = sorted([(d, n, y, False) for d, n, y in fatal] + [(d, n, y, True) for d, n, y in NEWS])

LM = [
    (20.31, "Beach Access Rd 1"),
    (22.33, "Access Rd 1-B (new, 2026)"),
    (27.88, "Beach Access Rd 2"),
    (32.72, "Access Rd 3"),
    (33.80, "Newport Pass Rd"),
    (34.88, "Zahn Rd"),
    (35.22, "Park Road 22 (signal)"),
]

CRIS_PTS = [(f(r["Latitude"]), f(r["Longitude"]), f(r["DFO"])) for r in S
            if f(r["Latitude"]) and f(r["Longitude"]) and f(r["DFO"]) is not None]
SKIP = ("unknown", "utility", "residence", "private", "public utility", "intersection")
dev = []
inv = os.path.join(HERE, "sh361_access_inventory.csv")
if os.path.exists(inv):
    for r in csv.DictReader(open(inv)):
        la, lo = f(r.get("lat")), f(r.get("lon"))
        if la is None or lo is None: continue
        if any(k in (r.get("type") or "").lower() for k in SKIP): continue
        d = min(CRIS_PTS, key=lambda p: (p[0]-la)**2 + ((p[1]-lo)*0.887)**2)[2]
        if LO <= d <= HI: dev.append(d)

def separate(vals, gap):
    """Return label positions >= gap apart, anchored to the LAST item, pushing earlier ones up."""
    ys = list(vals)
    for i in range(len(ys) - 2, -1, -1):
        if ys[i + 1] - ys[i] < gap:
            ys[i] = ys[i + 1] - gap
    return ys

INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; BAR="#9aa5b1"; FATAL="#b42318"; ACCENT="#0f766e"
fig, (axF, axB, axR) = plt.subplots(
    1, 3, figsize=(8.4, 13.6), sharey=True,
    gridspec_kw={"width_ratios": [1.15, 2.4, 1.95], "wspace": 0.04})
fig.patch.set_facecolor("white")

for a in (axF, axB, axR):
    a.set_ylim(HI, LO)
    a.axhspan(20.31, 32.72, color="#fdf3f2", zorder=0)
    for sp in ("top", "right", "left", "bottom"): a.spines[sp].set_visible(False)
    a.set_facecolor("white")
    a.tick_params(axis="y", length=0)

# ---- middle: bars
xs = sorted(bins)
axB.barh([x + BIN/2 for x in xs], [bins[x] for x in xs], height=BIN*0.88, color=BAR, zorder=2, linewidth=0)
axB.set_xlim(0, max(bins.values()) * 1.12)
axB.xaxis.grid(True, color=GRID, lw=0.7); axB.set_axisbelow(True)
axB.spines["bottom"].set_visible(True); axB.spines["bottom"].set_color(GRID)
axB.tick_params(axis="x", colors=MUTED, labelsize=8)
axB.set_xlabel("crashes per half-mile", color=MUTED, fontsize=9, labelpad=2)
for m in range(21, 36):
    axB.axhline(m, color=GRID, lw=0.5, zorder=1)

# ---- left: fatal crashes (dodge labels that crowd)
axF.set_xlim(0, 1); axF.set_xticks([])
axF.set_yticks(range(21, 36))
axF.set_yticklabels([f"mile {m}" for m in range(21, 36)], fontsize=8)
axF.tick_params(axis="y", colors=MUTED, length=0, pad=2, labelleft=True)
fy = separate([d for d, _, _, _ in ALL_FATAL], 0.42)
for (d, deaths, yr, is_news), y in zip(ALL_FATAL, fy):
    lab = yr + (" ×2" if deaths > 1 else "")
    if is_news:
        axF.plot([0.86], [d], marker="D", mfc="white", mec=FATAL, mew=1.8, ms=9 + 4*(deaths-1), zorder=4, clip_on=False)
    else:
        axF.plot([0.86], [d], marker="D", color=FATAL, ms=9 + 4*(deaths-1), mec="white", mew=1, zorder=4, clip_on=False)
    if abs(y - d) > 0.05:
        axF.plot([0.78, 0.83], [y, d], color=FATAL, lw=0.7, alpha=0.55, zorder=3, clip_on=False)
    axF.annotate(lab, (0.74, y), ha="right", va="center", fontsize=8.5, color=FATAL,
                 fontweight="bold" if is_news else "normal")
    prev = d
axF.set_title("fatal crashes", fontsize=9, color=MUTED, pad=14, loc="left")

# ---- right: landmarks + development access ticks
axR.set_xlim(0, 1); axR.set_xticks([]); axR.tick_params(axis="y", labelleft=False)
for d in dev:
    axR.plot([0.07], [d], marker=">", color=INK, ms=5, zorder=3, clip_on=False)
ly = separate([d for d, _ in LM], 0.46)
for (d, lab), y in zip(LM, ly):
    for a in (axF, axB, axR):
        a.axhline(d, color=ACCENT, lw=1.0, alpha=0.7, zorder=2)
    if abs(y - d) > 0.05:
        axR.plot([0.12, 0.16], [d, y], color=ACCENT, lw=0.7, alpha=0.6, zorder=3, clip_on=False)
    axR.annotate(lab, (0.17, y), ha="left", va="center",
                 fontsize=8.2, color=ACCENT, clip_on=False)
axR.set_title("access points", fontsize=9, color=MUTED, pad=14, loc="left")

axB.annotate("PORT ARANSAS ↑", (0.5, 1.017), xycoords="axes fraction", ha="center",
             fontsize=10, color=INK, fontweight="bold")
axB.annotate("↓ PARK ROAD 22", (0.5, -0.075), xycoords="axes fraction", ha="center",
             fontsize=10, color=INK, fontweight="bold")
axB.annotate("two lanes,\nno median,\n60 mph", (0.62, 30.4), fontsize=9.5, color=FATAL,
             ha="center", va="center", style="italic")

h = [Line2D([0],[0], marker="s", color=BAR, lw=0, ms=10, label="crashes per half-mile, 2016 – Aug 2026"),
     Line2D([0],[0], marker="D", color=FATAL, lw=0, ms=9, label="fatal crash (larger = two deaths)"),
     Line2D([0],[0], marker="D", mfc="white", mec=FATAL, mew=1.8, lw=0, ms=9, label="this week's two crashes"),
     Line2D([0],[0], marker=">", color=INK, lw=0, ms=6, label="development entrance or street"),
     Line2D([0],[0], color=ACCENT, lw=1, label="public beach access road")]
fig.legend(handles=h, loc="lower center", frameon=False, fontsize=9, labelcolor=INK,
           ncol=1, bbox_to_anchor=(0.5, -0.035))

plt.tight_layout()
out = os.path.join(HERE, "sh361_stripmap_web.png")
plt.savefig(out, dpi=115, bbox_inches="tight", facecolor="white")
print("saved", out, "| bars", len(xs), "| fatal", len(ALL_FATAL), "| dev", len(dev))
