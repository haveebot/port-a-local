#!/usr/bin/env python3
"""SH 361 day/night analysis — same restrained idiom as the published corridor chart.
Neutral grays, one accent for fatal, plain source line. Two orientations:
  sh361_night_mobile.png   tall, for phones and the feed
  sh361_night_desktop.png  landscape, for the article on wide screens
"""
import csv, os, collections
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(HERE, "cris_sh361_stretch.csv"))))
def f(x):
    try: return float(x)
    except: return None
LO, HI = 20.31, 35.22                     # TxDOT corridor: Beach Access Rd 1 -> PR 22
C = [r for r in rows if f(r["DFO"]) is not None and LO <= f(r["DFO"]) <= HI]
def isfatal(r): return r["Crash Severity"].startswith("K")
def isdark(r):  return r["Light Condition"].startswith("DARK")   # dawn/dusk are not dark

# Impairment for the FATAL crashes comes from the best available record — FARS lab
# results, court outcomes, DPS toxicology — not the state file's contributing-factor
# field, which misses a third of them. Keyed by crash date.
IMPAIRED_FATAL = {
    "2016-01-13": True,   "2018-03-17": True,   "2019-01-25": False,
    "2022-06-16": False,  "2022-08-13": True,   "2023-06-30": True,
    "2023-07-03": True,   "2023-11-02": True,   "2024-05-14": True,
    "2024-08-09": True,   "2025-08-15": True,   "2026-03-02": False,
}
# Aug 2026 crashes are not in the state file yet: (DFO, deaths, dark?, impaired?)
NEWS_FATAL = [(27.72, 1, False, False), (26.90, 2, False, False)]
ALC_FLAG = ("UNDER INFLUENCE - ALCOHOL", "HAD BEEN DRINKING",
            "UNDER INFLUENCE - DRUG", "TAKING MEDICATION")
def flagged(r):
    s = (r["Contributing Factors"] or "") + ";" + (r["Other Factor"] or "")
    return any(k in s for k in ALC_FLAG)

# same palette as the published corridor chart
INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; BAR="#9aa5b1"; BARLIGHT="#c9d1d9"
FATAL="#b42318"; ACCENT="#0f766e"; PAPER="#ffffff"

GROUPS = [("In daylight", "DAYLIGHT", BARLIGHT),
          ("After dark, with street lighting", "DARK, LIGHTED", BAR),
          ("After dark, no lighting", "DARK, NOT LIGHTED", FATAL)]
LIT_SECTIONS = [(22.96, 23.34), (26.75, 27.00), (27.75, 28.05), (29.85, 34.75)]
SOURCE = ("Sources: TxDOT Crash Records Information System (421 crashes, Beach Access Road 1 to Park Road 22, 2016–Aug. 15, 2026);\n"
          "NHTSA Fatality Analysis Reporting System, Nueces County court records and DPS lab results for impairment in the fatal crashes.\n"
          "Shaded hourly portions are a FLOOR — the state file's factor field misses a third of the impaired fatal crashes, because\n"
          "toxicology returns after the report is filed. Impairment means any driver involved, not necessarily the person killed.\n"
          "Fourteen fatal crashes is a small number: read the gaps as direction. Neither Aug. 10 nor Aug. 14 was after dark.")


def panel_share(ax, label_size, num_size, note_size, gap=1.55):
    for (label, key, color), yy in zip(GROUPS, [2, 1, 0]):
        sub = [r for r in C if r["Light Condition"] == key]
        fat = [r for r in sub if isfatal(r)]
        p = 100 * len(fat) / len(sub)
        ax.barh([yy], [p], height=0.38, color=color, zorder=2)
        ax.text(0.06, yy + 0.28, label, fontsize=label_size, color=INK, va="bottom")
        ax.text(p + 0.16, yy, f"{p:.1f}%", fontsize=num_size, fontweight="bold",
                color=INK, va="center", ha="left")
        ax.text(p + gap, yy, f"{len(fat)} of {len(sub)} crashes", fontsize=note_size,
                color=MUTED, va="center", ha="left")
    ax.set_xlim(0, 10.8); ax.set_ylim(-0.65, 2.95)
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values(): s.set_visible(False)


def panel_hours(ax, tick_size, legend_size):
    H = collections.Counter(); HF = collections.Counter(); HA = collections.Counter()
    for r in C:
        t = (r["Crash Time"] or "").strip()
        if len(t) != 4 or not t[:2].isdigit(): continue
        h = int(t[:2]); H[h] += 1
        if isfatal(r): HF[h] += 1
        if flagged(r): HA[h] += 1
    hours = range(24)
    isnight = lambda h: h >= 20 or h < 6
    ax.bar(list(hours), [H[h] for h in hours], width=0.76, zorder=2,
           color=[BAR if isnight(h) else BARLIGHT for h in hours])
    # impairment overlay — the portion of each hour's crashes with a recorded
    # alcohol or drug factor. A floor: the field misses cases (see note).
    ax.bar(list(hours), [HA[h] for h in hours], width=0.76, zorder=3, color=FATAL, alpha=0.85)
    for h in hours:
        for i in range(HF[h]):
            ax.plot([h], [H[h] + 4.5 + 4.2 * i], marker="D", color=FATAL, ms=7.5,
                    mec=PAPER, mew=1, zorder=3)
    ax.set_xlim(-0.8, 23.8); ax.set_ylim(0, max(H.values()) * 1.52)
    ax.set_xticks([0, 6, 12, 18, 23])
    ax.set_xticklabels(["midnight", "6am", "noon", "6pm", "11pm"], fontsize=tick_size, color=MUTED)
    ax.set_yticks([]); ax.tick_params(length=0)
    for s in ("top", "right", "left"): ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.text(0.5, 0.93, "◆ = a fatal crash", transform=ax.transAxes, fontsize=legend_size,
            color=FATAL, ha="center", va="top")
    ax.text(0.995, 0.93, "shaded = alcohol or drugs recorded", transform=ax.transAxes,
            fontsize=legend_size - 1, color=FATAL, ha="right", va="top")
    ax.text(0.005, 0.93, "darker bars = 8pm–6am", transform=ax.transAxes,
            fontsize=legend_size - 1, color=MUTED, ha="left", va="top")


def panel_corridor(ax, label_size, tick_size):
    for a, b in LIT_SECTIONS:
        ax.axvspan(a, b, ymin=0.34, ymax=0.56, color=GRID, zorder=1)
    ax.plot([LO, HI], [0.45, 0.45], color="#dde3ea", lw=8, solid_capstyle="butt", zorder=0)
    def mark(d, dark, impaired):
        y = 0.86 if dark else 0.06
        ax.plot([d], [y], marker="D", ms=12,
                mfc=FATAL if dark else PAPER, mec=FATAL, mew=1.6, zorder=4)
        ax.plot([d, d], [0.45, 0.79 if dark else 0.13], color=FATAL, lw=1,
                alpha=0.45, zorder=2)
        if impaired:
            ax.plot([d], [y], marker="o", ms=21, mfc="none", mec=INK, mew=1.5,
                    zorder=5)
    for r in C:
        if not isfatal(r): continue
        mark(f(r["DFO"]), isdark(r), IMPAIRED_FATAL.get(r["Crash Date"], False))
    for d, _n, dark, imp in NEWS_FATAL:
        mark(d, dark, imp)
    ax.text(HI - 0.15, 0.99, "after dark", fontsize=label_size, color=FATAL,
            fontweight="bold", va="top", ha="right")
    ax.text(HI - 0.15, 0.0, "daylight or dusk", fontsize=label_size, color=MUTED,
            va="bottom", ha="right")

    ax.text(32.3, 0.585, "lit by TxDOT, 2023–24", fontsize=tick_size, color=MUTED,
            ha="center", va="bottom")
    for x, lab, ha in [(20.31, "Port Aransas", "left"), (27.88, "Access Rd 2", "center"),
                       (35.22, "Park Rd 22", "right")]:
        ax.axvline(x, color=ACCENT, lw=1, alpha=0.6, zorder=1)
        ax.text(x, -0.16, lab, fontsize=tick_size, color=ACCENT, ha=ha, va="top")
    ax.set_xlim(LO - 0.3, HI + 0.3); ax.set_ylim(-0.04, 1.06)
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values(): s.set_visible(False)


def render_mobile(out):
    L, R = 0.085, 0.955; W = R - L
    fig = plt.figure(figsize=(10.8, 13.5), dpi=100); fig.patch.set_facecolor(PAPER)
    head = lambda y, t: fig.text(L, y, t, fontsize=20, fontweight="bold", color=INK, va="top")
    note = lambda y, t: fig.text(L, y, t, fontsize=14.5, color=INK, va="top", linespacing=1.5)
    fig.text(L, 0.972, "SH 361 — day, night and impairment",
             fontsize=26, fontweight="bold", color=INK, va="top")
    fig.text(L, 0.936, "Ten years of TxDOT crash records for the island road, Port Aransas to Park\n"
                       "Road 22 — by light condition, and by whether drink or drugs were involved",
             fontsize=15, color=MUTED, va="top", linespacing=1.45)
    head(0.876, "How often a crash kills someone")
    panel_share(fig.add_axes([L, 0.700, W, 0.156]), 16.5, 25, 13.5)
    note(0.690, "A crash on an unlit stretch after dark is about four times as likely to kill\n"
                "as the same crash in daylight.")
    head(0.630, "When crashes happen — and when they kill")
    panel_hours(fig.add_axes([L, 0.464, W, 0.145]), 13.5, 13.5)
    note(0.420, "8pm to 6am is 22% of the crashes on this road — and 58% of the fatal ones.\n"
                "Recorded impairment runs about four times higher after dark.")
    head(0.384, "Where the deaths after dark happened")
    fig.text(R, 0.384, "◯ = impaired driver involved", fontsize=13, color=INK,
             va="top", ha="right")
    panel_corridor(fig.add_axes([L, 0.205, W, 0.148]), 14.5, 13)
    note(0.156, "Every fatal crash after dark is at or north of Access Road 2. Nine of the\n"
                "fourteen involved an impaired driver — in daylight as well as after dark —\n"
                "and eight ended with a vehicle in the oncoming lane.")
    fig.text(R, 0.104, "theportalocal.com/dispatch", fontsize=12.5, color=MUTED,
             va="top", ha="right")
    fig.text(L, 0.078, SOURCE, fontsize=11, color=MUTED, va="top", linespacing=1.55)
    plt.savefig(out, facecolor=PAPER); print("saved", out)


def render_desktop(out):
    """Landscape: same three panels, stacked full width — wide and short."""
    L, R = 0.058, 0.972; W = R - L
    fig = plt.figure(figsize=(11.4, 9.6), dpi=100); fig.patch.set_facecolor(PAPER)
    head = lambda y, t: fig.text(L, y, t, fontsize=17, fontweight="bold", color=INK, va="top")
    note = lambda y, t: fig.text(L, y, t, fontsize=13, color=INK, va="top", linespacing=1.5)
    fig.text(L, 0.972, "SH 361 — day, night and impairment",
             fontsize=25, fontweight="bold", color=INK, va="top")
    fig.text(L, 0.930, "Ten years of TxDOT crash records for the island road, from Port Aransas to Park Road 22, sorted by\n"
                       "the light condition recorded on each report — and by whether alcohol or drugs were involved",
             fontsize=13, color=MUTED, va="top", linespacing=1.45)
    head(0.868, "How often a crash kills someone")
    panel_share(fig.add_axes([L, 0.700, W, 0.148]), 14, 21, 12, gap=1.35)
    note(0.686, "A crash on an unlit stretch after dark is about four times as likely to kill as the same crash in daylight.")
    head(0.640, "When crashes happen — and when they kill")
    panel_hours(fig.add_axes([L, 0.492, W, 0.128]), 12, 12)
    note(0.462, "8pm to 6am is 22% of the crashes on this road — and 58% of the fatal ones.\n"
                "Recorded impairment runs about four times higher after dark.")
    head(0.400, "Where the deaths after dark happened")
    fig.text(R, 0.400, "◯ = impaired driver involved", fontsize=12, color=INK,
             va="top", ha="right")
    panel_corridor(fig.add_axes([L, 0.246, W, 0.130]), 13, 11.5)
    note(0.208, "Every fatal crash after dark is at or north of Access Road 2. Nine of the fourteen involved an impaired\n"
                "driver — in daylight as well as after dark — and eight ended with a vehicle in the oncoming lane.")
    fig.text(R, 0.150, "theportalocal.com/dispatch", fontsize=11.5, color=MUTED, va="top", ha="right")
    fig.text(L, 0.124, SOURCE, fontsize=10.5, color=MUTED, va="top", linespacing=1.55)
    plt.savefig(out, facecolor=PAPER); print("saved", out)


render_mobile(os.path.join(HERE, "sh361_night_mobile.png"))
render_desktop(os.path.join(HERE, "sh361_night_desktop.png"))
