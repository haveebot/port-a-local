#!/usr/bin/env python3
"""Geographic scatter of SH 361 stretch crashes (CRIS) — lat/lon, severity-coded, with landmarks. No basemap (offline)."""
import csv, os, math
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
HERE=os.path.dirname(os.path.abspath(__file__))
S=list(csv.DictReader(open(os.path.join(HERE,"cris_sh361_stretch.csv"))))
def f(x):
    try: return float(x)
    except: return None
pts=[(f(r["Longitude"]),f(r["Latitude"]),r["Crash Severity"][0],int(r["Death Count"] or 0),r["Crash Date"][:4]) for r in S if f(r["Latitude"]) and f(r["Longitude"])]
INK="#1f2933"; MUTED="#6b7280"; GRID="#e5e7eb"; BASE="#b8c1cc"; FATAL="#b42318"; SERIOUS="#d97706"; ACCENT="#0f766e"
fig,ax=plt.subplots(figsize=(9,11)); fig.patch.set_facecolor("white")
lat0=27.72; ax.set_aspect(1/math.cos(math.radians(lat0)))
xs=[p[0] for p in pts if p[2] not in "KA"]; ys=[p[1] for p in pts if p[2] not in "KA"]
ax.scatter(xs,ys,s=10,c=BASE,alpha=0.55,linewidths=0,zorder=2,label="Crash (no fatal/serious injury)")
xa=[p[0] for p in pts if p[2]=="A"]; ya=[p[1] for p in pts if p[2]=="A"]
ax.scatter(xa,ya,s=34,c=SERIOUS,marker="o",edgecolors="white",linewidths=0.6,zorder=3,label="Suspected serious injury")
for lon,lat,sev,d,yr in pts:
    if sev=="K":
        ax.scatter([lon],[lat],s=90+70*(d-1),c=FATAL,marker="D",edgecolors="white",linewidths=0.8,zorder=4)
        ax.annotate(yr+(" ×2" if d>1 else ""),(lon,lat),xytext=(7,0),textcoords="offset points",fontsize=7.5,color=FATAL,va="center")
LM=[(27.8064,-97.0825,"Beach Access Rd 1A (signal)\nPort Aransas"),(27.7725,-97.1094,"Access Rd 1-B (2026)"),(27.7058,-97.1544,"Beach Access Rd 2"),(27.6510,-97.1912,"Access Rd 3"),(27.6350,-97.2020,"Newport Pass Rd"),(27.6220,-97.2108,"Zahn Rd"),(27.6179,-97.2218,"PR 22 (signal)")]
for la,lo,lab in LM:
    ax.plot([lo],[la],marker="_",color=ACCENT,ms=14,mew=2,zorder=5)
    ax.annotate(lab,(lo,la),xytext=(-8,0),textcoords="offset points",ha="right",va="center",fontsize=8,color=ACCENT)
ax.set_xlabel("longitude",color=MUTED); ax.set_ylabel("latitude",color=MUTED)
for s in ("top","right"): ax.spines[s].set_visible(False)
ax.grid(True,color=GRID,lw=0.6); ax.tick_params(colors=MUTED,labelsize=8)
h=[Line2D([0],[0],marker="o",color=BASE,lw=0,ms=6,label="Crash, no fatal/serious injury"),
   Line2D([0],[0],marker="o",color=SERIOUS,lw=0,ms=7,label="Suspected serious injury"),
   Line2D([0],[0],marker="D",color=FATAL,lw=0,ms=8,label="Fatal (year labeled; larger = 2 deaths)"),
   Line2D([0],[0],marker="_",color=ACCENT,lw=0,ms=12,mew=2,label="Public access road / signal")]
ax.legend(handles=h,loc="center left",frameon=False,fontsize=8.5)
ax.set_title("SH 361 Mustang Island crashes, 2016 – Aug 2026 (TxDOT CRIS)\nEvery point sits on the highway; the deaths sit in the undivided middle",loc="left",fontsize=11,color=INK)
plt.savefig(os.path.join(HERE,"sh361_geomap.png"),dpi=160,bbox_inches="tight",facecolor="white")
print("saved",len(pts))
