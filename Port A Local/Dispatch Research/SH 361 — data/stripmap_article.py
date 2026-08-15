#!/usr/bin/env python3
"""Horizontal article chart for wide screens: miles across, crashes per half-mile as bars,
fatal crashes as diamonds, landmarks + development access ticks. Sized to render ~1:1 in the
article's wide breakout (about 1100 px)."""
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
NEWS = [(26.90, 2, "Aug 14"), (27.72, 1, "Aug 10")]
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
    xs = list(vals)
    for i in range(len(xs) - 2, -1, -1):
        if xs[i + 1] - xs[i] < gap:
            xs[i] = xs[i + 1] - gap
    return xs

INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; BAR="#9aa5b1"; FATAL="#b42318"; ACCENT="#0f766e"
fig, (ax, axL) = plt.subplots(
    2, 1, figsize=(11.4, 7.4), sharex=True,
    gridspec_kw={"height_ratios": [3.0, 1.9], "hspace": 0.05})
fig.patch.set_facecolor("white")

for a in (ax, axL):
    a.set_xlim(LO - 0.15, HI + 0.15)
    a.axvspan(20.31, 32.72, color="#fdf3f2", zorder=0)
    for sp in ("top", "right", "left"): a.spines[sp].set_visible(False)

xs = sorted(bins)
ax.bar([x + BIN/2 for x in xs], [bins[x] for x in xs], width=BIN*0.86, color=BAR, zorder=2, linewidth=0)
ymax = max(bins.values()) * 1.95
ax.set_ylim(0, ymax)
ax.set_ylabel("crashes per half-mile\n2016 – Aug 2026", color=MUTED, fontsize=9.5)
ax.yaxis.grid(True, color=GRID, lw=0.7); ax.set_axisbelow(True)
ax.tick_params(axis="y", colors=MUTED, labelsize=9)
ax.spines["bottom"].set_color(GRID)

fx = separate([d for d, _, _, _ in ALL_FATAL], 0.62)
for (d, deaths, yr, is_news), x in zip(ALL_FATAL, fx):
    y = ymax * 0.575
    if is_news:
        ax.plot([d], [y], marker="D", mfc="white", mec=FATAL, mew=1.8, ms=9 + 4*(deaths-1), zorder=4)
    else:
        ax.plot([d], [y], marker="D", color=FATAL, ms=9 + 4*(deaths-1), mec="white", mew=1, zorder=4)
    if abs(x - d) > 0.02:
        ax.plot([d, x], [y + ymax*0.045, y + ymax*0.10], color=FATAL, lw=0.7, alpha=0.55, zorder=3)
    ax.annotate(yr + (" ×2" if deaths > 1 else ""), (x, y + ymax*0.115), ha="center", va="bottom",
                fontsize=8.5, color=FATAL, rotation=90,
                fontweight="bold" if is_news else "normal")

ax.annotate("two lanes, no median, 60 mph", (26.5, ymax*0.985), ha="center", va="top",
            fontsize=10.5, color=FATAL, style="italic")
ax.annotate("← PORT ARANSAS", (LO + 0.1, ymax*0.985), ha="left", va="top", fontsize=9.5,
            color=INK, fontweight="bold")
ax.annotate("PARK ROAD 22 →", (HI - 0.1, ymax*0.985), ha="right", va="top", fontsize=9.5,
            color=INK, fontweight="bold")

# lower strip: landmarks + development access ticks
axL.set_ylim(0, 1); axL.set_yticks([]); axL.spines["bottom"].set_color(GRID)
for d in dev:
    axL.plot([d], [0.93], marker="v", color=INK, ms=5, zorder=3)
axL.annotate("development entrances →", (LO + 0.1, 0.80), ha="left", va="top", fontsize=8.5, color=INK)
lx = separate([d for d, _ in LM], 0.72)
for (d, lab), x in zip(LM, lx):
    for a in (ax, axL):
        a.axvline(d, color=ACCENT, lw=1.0, alpha=0.7, zorder=1)
    if abs(x - d) > 0.02:
        axL.plot([d, x], [0.62, 0.55], color=ACCENT, lw=0.7, alpha=0.6, zorder=3)
    axL.annotate(lab, (x, 0.52), rotation=90, ha="center", va="top", fontsize=8.5, color=ACCENT)

axL.set_xticks(range(21, 36))
axL.set_xticklabels([f"mile {m}" if m in (21, 25, 30, 35) else str(m) for m in range(21, 36)], fontsize=8.5)
axL.tick_params(axis="x", colors=MUTED, length=3)

h = [Line2D([0],[0], marker="s", color=BAR, lw=0, ms=10, label="crashes per half-mile"),
     Line2D([0],[0], marker="D", color=FATAL, lw=0, ms=9, label="fatal crash (larger = two deaths)"),
     Line2D([0],[0], marker="D", mfc="white", mec=FATAL, mew=1.8, lw=0, ms=9, label="this week's two crashes"),
     Line2D([0],[0], marker="v", color=INK, lw=0, ms=6, label="development entrance or street"),
     Line2D([0],[0], color=ACCENT, lw=1, label="public beach access road")]
fig.legend(handles=h, loc="lower center", bbox_to_anchor=(0.5, -0.055), frameon=False,
           fontsize=9.5, labelcolor=INK, ncol=3, columnspacing=2.0, handletextpad=0.6)

plt.tight_layout()
out = os.path.join(HERE, "sh361_stripmap_article.png")
plt.savefig(out, dpi=100, bbox_inches="tight", facecolor="white")
print("saved", out, "| bars", len(xs), "| fatal", len(ALL_FATAL), "| dev", len(dev))
