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

# same palette as the published corridor chart
INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; BAR="#9aa5b1"; BARLIGHT="#c9d1d9"
FATAL="#b42318"; ACCENT="#0f766e"; PAPER="#ffffff"

GROUPS = [("In daylight", "DAYLIGHT", BARLIGHT),
          ("After dark, with street lighting", "DARK, LIGHTED", BAR),
          ("After dark, no lighting", "DARK, NOT LIGHTED", FATAL)]
LIT_SECTIONS = [(22.96, 23.34), (26.75, 27.00), (27.75, 28.05), (29.85, 34.75)]
SOURCE = ("Source: TxDOT Crash Records Information System — 421 crashes on SH 361 between Beach Access Road 1 and Park Road 22,\n"
          "2016 through Aug. 15, 2026. This measures how deadly a crash is, not how many happen: there is less traffic after dark.\n"
          "Twelve fatal crashes is a small number — read the gaps as direction, not precision. The lighting was installed recently,\n"
          "so this is not a before-and-after. Neither of the two crashes that killed three people on Aug. 10 and Aug. 14 was after dark.")


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
    H = collections.Counter(); HF = collections.Counter()
    for r in C:
        t = (r["Crash Time"] or "").strip()
        if len(t) != 4 or not t[:2].isdigit(): continue
        h = int(t[:2]); H[h] += 1
        if isfatal(r): HF[h] += 1
    hours = range(24)
    isnight = lambda h: h >= 20 or h < 6
    ax.bar(list(hours), [H[h] for h in hours], width=0.76, zorder=2,
           color=[BAR if isnight(h) else BARLIGHT for h in hours])
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
    ax.text(0.995, 0.93, "darker bars = 8pm–6am", transform=ax.transAxes,
            fontsize=legend_size - 1, color=MUTED, ha="right", va="top")


def panel_corridor(ax, label_size, tick_size):
    for a, b in LIT_SECTIONS:
        ax.axvspan(a, b, ymin=0.34, ymax=0.56, color=GRID, zorder=1)
    ax.plot([LO, HI], [0.45, 0.45], color="#dde3ea", lw=8, solid_capstyle="butt", zorder=0)
    for r in C:
        if not isfatal(r): continue
        d = f(r["DFO"]); dark = isdark(r)
        ax.plot([d], [0.86 if dark else 0.06], marker="D", ms=12,
                mfc=FATAL if dark else PAPER, mec=FATAL, mew=1.6, zorder=4)
        ax.plot([d, d], [0.45, 0.79 if dark else 0.13], color=FATAL, lw=1,
                alpha=0.45, zorder=2)
    ax.text(HI - 0.15, 0.99, "after dark", fontsize=label_size, color=FATAL,
            fontweight="bold", va="top", ha="right")
    ax.text(27.45, 0.0, "daylight or dusk", fontsize=label_size, color=MUTED,
            va="bottom", ha="center")
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
    fig.text(L, 0.972, "SH 361, Mustang Island — the day/night record",
             fontsize=26, fontweight="bold", color=INK, va="top")
    fig.text(L, 0.936, "Ten years of TxDOT crash records for the island road, from Port Aransas\n"
                       "to Park Road 22, sorted by the light condition on each crash report",
             fontsize=15, color=MUTED, va="top", linespacing=1.45)
    head(0.876, "How often a crash kills someone")
    panel_share(fig.add_axes([L, 0.700, W, 0.156]), 16.5, 25, 13.5)
    note(0.690, "A crash on an unlit stretch after dark is about four times as likely to kill\n"
                "as the same crash in daylight.")
    head(0.630, "When crashes happen — and when they kill")
    panel_hours(fig.add_axes([L, 0.464, W, 0.145]), 13.5, 13.5)
    note(0.426, "8pm to 6am is 22% of the crashes on this road — and 58% of the fatal ones.")
    head(0.384, "Where the deaths after dark happened")
    panel_corridor(fig.add_axes([L, 0.205, W, 0.148]), 14.5, 13)
    note(0.162, "Every fatal crash after dark is at or north of Access Road 2. The southern\n"
                "miles have plenty of night crashes — 65 — but none of them fatal, before or\n"
                "after the lights went in.")
    fig.text(R, 0.104, "theportalocal.com/dispatch", fontsize=12.5, color=MUTED,
             va="top", ha="right")
    fig.text(L, 0.078, SOURCE, fontsize=11, color=MUTED, va="top", linespacing=1.55)
    plt.savefig(out, facecolor=PAPER); print("saved", out)


def render_desktop(out):
    """Landscape: same three panels, stacked full width — wide and short."""
    L, R = 0.058, 0.972; W = R - L
    fig = plt.figure(figsize=(11.4, 8.8), dpi=100); fig.patch.set_facecolor(PAPER)
    head = lambda y, t: fig.text(L, y, t, fontsize=17, fontweight="bold", color=INK, va="top")
    note = lambda y, t: fig.text(L, y, t, fontsize=13, color=INK, va="top", linespacing=1.5)
    fig.text(L, 0.968, "SH 361, Mustang Island — the day/night record",
             fontsize=25, fontweight="bold", color=INK, va="top")
    fig.text(L, 0.921, "Ten years of TxDOT crash records for the island road, from Port Aransas to Park Road 22,\n"
                       "sorted by the light condition recorded on each crash report",
             fontsize=13, color=MUTED, va="top", linespacing=1.45)
    head(0.852, "How often a crash kills someone")
    panel_share(fig.add_axes([L, 0.672, W, 0.158]), 14, 21, 12, gap=1.35)
    note(0.658, "A crash on an unlit stretch after dark is about four times as likely to kill as the same crash in daylight.")
    head(0.610, "When crashes happen — and when they kill")
    panel_hours(fig.add_axes([L, 0.450, W, 0.138]), 12, 12)
    note(0.416, "8pm to 6am is 22% of the crashes on this road — and 58% of the fatal ones.")
    head(0.368, "Where the deaths after dark happened")
    panel_corridor(fig.add_axes([L, 0.206, W, 0.138]), 13, 11.5)
    note(0.166, "Every fatal crash after dark is at or north of Access Road 2. The southern miles have plenty of night crashes — 65 — but none fatal, before or after the lights.")
    fig.text(R, 0.140, "theportalocal.com/dispatch", fontsize=11.5, color=MUTED, va="top", ha="right")
    fig.text(L, 0.108, SOURCE, fontsize=10.5, color=MUTED, va="top", linespacing=1.55)
    plt.savefig(out, facecolor=PAPER); print("saved", out)


render_mobile(os.path.join(HERE, "sh361_night_mobile.png"))
render_desktop(os.path.join(HERE, "sh361_night_desktop.png"))
