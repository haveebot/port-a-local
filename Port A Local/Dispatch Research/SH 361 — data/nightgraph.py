#!/usr/bin/env python3
"""SH 361 day/night share graphic — phone-first portrait (1080x1350) for Facebook.
Panels: how deadly a crash is by light condition; when crashes happen vs when they
kill; where the deaths after dark happened, against the sections TxDOT has lit.
Layout is explicit (add_axes + fig.text at fixed figure coords) so nothing collides."""
import csv, os, collections
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(HERE, "cris_sh361_stretch.csv"))))
def f(x):
    try: return float(x)
    except: return None
LO, HI = 20.31, 35.22                     # TxDOT corridor: Beach Access Rd 1 → PR 22
C = [r for r in rows if f(r["DFO"]) is not None and LO <= f(r["DFO"]) <= HI]
def isfatal(r): return r["Crash Severity"].startswith("K")
def isdark(r):  return r["Light Condition"].startswith("DARK")   # dusk/dawn are NOT dark

INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; PAPER="#ffffff"
DAY="#d99a45"; DAYINK="#a16207"; LIT="#7d8ba1"; UNLIT="#b42318"; ACCENT="#0f766e"
L, R = 0.085, 0.955
W = R - L

fig = plt.figure(figsize=(10.8, 13.5), dpi=100)
fig.patch.set_facecolor(PAPER)

def head(y, text, size=21):
    fig.text(L, y, text, fontsize=size, fontweight="bold", color=INK, va="top")
def note(y, text, size=15, color=INK):
    fig.text(L, y, text, fontsize=size, color=color, va="top", linespacing=1.5)

fig.text(L, 0.975, "Highway 361 after dark", fontsize=36, fontweight="bold",
         color=INK, va="top")
fig.text(L, 0.932, "Ten years of state crash records for the island road,\n"
                   "from Port Aransas to Park Road 22",
         fontsize=17, color=MUTED, va="top", linespacing=1.45)

# ---------------------------------------------------------------- A
head(0.868, "How often a crash kills someone")
axA = fig.add_axes([L, 0.700, W, 0.148])
groups = [("In daylight", "DAYLIGHT", DAY),
          ("After dark, street lighting", "DARK, LIGHTED", LIT),
          ("After dark, no lighting", "DARK, NOT LIGHTED", UNLIT)]
y = [2, 1, 0]
for (label, key, color), yy in zip(groups, y):
    sub = [r for r in C if r["Light Condition"] == key]
    fat = [r for r in sub if isfatal(r)]
    p = 100 * len(fat) / len(sub)
    axA.barh([yy], [p], height=0.44, color=color, zorder=2)
    axA.text(0.06, yy + 0.30, label, fontsize=17, color=INK, va="bottom")
    axA.text(p + 0.15, yy, f"{p:.1f}%", fontsize=26, fontweight="bold", color=INK,
             va="center", ha="left")
    axA.text(p + 1.45, yy, f"{len(fat)} of {len(sub)} crashes", fontsize=14,
             color=MUTED, va="center", ha="left")
axA.set_xlim(0, 10.4); axA.set_ylim(-0.60, 2.85)
axA.set_xticks([]); axA.set_yticks([])
for s in axA.spines.values(): s.set_visible(False)
note(0.684, "A crash on an unlit stretch after dark is about four times as likely to kill\n"
            "as the same crash in daylight.")

# ---------------------------------------------------------------- B
head(0.628, "When crashes happen — and when they kill")
axB = fig.add_axes([L, 0.462, W, 0.145])
H = collections.Counter(); HF = collections.Counter()
for r in C:
    t = (r["Crash Time"] or "").strip()
    if len(t) != 4 or not t[:2].isdigit(): continue
    h = int(t[:2]); H[h] += 1
    if isfatal(r): HF[h] += 1
hours = range(24)
isnight = lambda h: h >= 20 or h < 6
axB.bar(list(hours), [H[h] for h in hours], width=0.76, zorder=2,
        color=[UNLIT if isnight(h) else "#c9d1d9" for h in hours])
for h in hours:
    for i in range(HF[h]):
        axB.plot([h], [H[h] + 4.5 + 4.2 * i], marker="D", color=UNLIT, ms=8,
                 mec="white", mew=1, zorder=3)
axB.set_xlim(-0.8, 23.8); axB.set_ylim(0, max(H.values()) * 1.52)
axB.set_xticks([0, 6, 12, 18, 23])
axB.set_xticklabels(["midnight", "6am", "noon", "6pm", "11pm"], fontsize=14, color=MUTED)
axB.set_yticks([]); axB.tick_params(length=0)
for s in ("top", "right", "left"): axB.spines[s].set_visible(False)
axB.spines["bottom"].set_color(GRID)
axB.text(0.5, 0.99, "◆ = a fatal crash", transform=axB.transAxes, fontsize=14,
         color=UNLIT, ha="center", va="top")
axB.text(0.995, 0.99, "red bars = 8pm–6am", transform=axB.transAxes, fontsize=13,
         color=MUTED, ha="right", va="top")
note(0.424, "8pm to 6am is 22% of the crashes on this road — and 58% of the fatal ones.")

# ---------------------------------------------------------------- C
head(0.382, "Where the deaths after dark happened")
axC = fig.add_axes([L, 0.205, W, 0.148])
for a, b in [(22.96, 23.34), (26.75, 27.00), (27.75, 28.05), (29.85, 34.75)]:
    axC.axvspan(a, b, ymin=0.34, ymax=0.56, color="#fcd97a", zorder=1)
axC.plot([LO, HI], [0.45, 0.45], color="#cbd5e1", lw=8, solid_capstyle="butt", zorder=0)
for r in C:
    if not isfatal(r): continue
    d = f(r["DFO"]); dark = isdark(r)
    axC.plot([d], [0.86 if dark else 0.06], marker="D", ms=13,
             color=UNLIT if dark else DAY, mec="white", mew=1.2, zorder=4)
    axC.plot([d, d], [0.45, 0.79 if dark else 0.13], color=UNLIT if dark else DAY,
             lw=1.1, alpha=0.5, zorder=2)
axC.text(HI - 0.15, 0.99, "after dark", fontsize=15, color=UNLIT,
         fontweight="bold", va="top", ha="right")
axC.text(27.45, 0.0, "daylight or dusk", fontsize=15, color=DAYINK,
         va="bottom", ha="center")
axC.text(32.3, 0.585, "lit by TxDOT, 2023–24", fontsize=13, color=DAYINK,
         ha="center", va="bottom")
for x, lab, ha in [(20.31, "Port Aransas", "left"), (27.88, "Access Rd 2", "center"),
                   (35.22, "Park Rd 22", "right")]:
    axC.axvline(x, color=ACCENT, lw=1.1, alpha=0.6, zorder=1)
    axC.text(x, -0.16, lab, fontsize=13.5, color=ACCENT, ha=ha, va="top")
axC.set_xlim(LO - 0.3, HI + 0.3); axC.set_ylim(-0.04, 1.06)
axC.set_xticks([]); axC.set_yticks([])
for s in axC.spines.values(): s.set_visible(False)
note(0.162, "Every fatal crash after dark is at or north of Access Road 2. The five miles\n"
            "TxDOT lit in 2023–24 have not had one.")

fig.text(R, 0.112, "PORT A LOCAL  ·  theportalocal.com/dispatch", fontsize=13,
         color=INK, va="top", ha="right", fontweight="bold")
fig.text(L, 0.086,
         "Source: TxDOT Crash Records Information System — 421 crashes on SH 361 between Beach Access Road 1 and Park\n"
         "Road 22, 2016 through Aug. 15, 2026. This compares how deadly a crash is, not how many happen: there is less\n"
         "traffic after dark. Twelve fatal crashes is a small number — read the gaps as direction, not precision. The lighting\n"
         "went in recently, so this is not a before-and-after. Neither crash that killed three people this week was after dark.",
         fontsize=11.5, color=MUTED, va="top", linespacing=1.55)

out = os.path.join(HERE, "sh361_day_night.png")
plt.savefig(out, facecolor=PAPER)
print("saved", out)
