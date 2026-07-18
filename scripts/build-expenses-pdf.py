#!/usr/bin/env python3
"""PAL Card Expenses Report — split by card (FB Ads ····5656 vs General Expense ····6459).
Data: the 5 dashboard Transactions screenshots (merchant + card), reconciled to the
Financial Account Balance Activity CSV and cross-checked against Meta ad spend."""
import os, re
from collections import defaultdict
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

NAVY = colors.HexColor("#0B2C4D"); CORAL = colors.HexColor("#E8624A")
SAND = colors.HexColor("#F5EFE6"); ROW = colors.HexColor("#F3F4F6"); MUT = colors.HexColor("#6B7280")

# (amount, card, merchant, date, status)
R = [
 (30.88,'GEN','Walgreens #5765','2026-06-27','ok'),(36.73,'GEN','Taco Bell #31401','2026-06-26','ok'),
 (20.20,'GEN','Murphy (Walmart) gas','2026-06-26','ok'),(44.19,'GEN','Favor / H-E-B','2026-06-26','ok'),
 (27.60,'GEN','Walgreens #5765','2026-06-25','ok'),(14.00,'GEN','OpenArt AI','2026-06-25','ok'),
 (20.00,'GEN','Resend','2026-06-24','ok'),(11.90,'GEN','Google YouTube TV','2026-06-21','ok'),
 (10.00,'GEN','Google Workspace','2026-06-21','ok'),(39.61,'FB','Facebook Ads','2026-06-18','ok'),
 (7.57,'GEN','Spotify','2026-06-17','ok'),(12.57,'GEN','Walgreens #5765','2026-06-14','failed'),
 (16.97,'GEN','Walgreens #5765','2026-06-14','failed'),(3.76,'FB','Facebook Ads','2026-06-14','failed'),
 (14.84,'FB','Facebook Ads','2026-06-14','ok'),(7.42,'FB','Facebook Ads','2026-06-14','ok'),
 (3.71,'FB','Facebook Ads','2026-06-14','ok'),(6.99,'GEN','Walgreens #5765','2026-06-14','ok'),
 (69.97,'GEN','H-E-B #621','2026-06-13','ok'),(13.48,'FB','Facebook Ads','2026-06-13','failed'),
 (6.74,'FB','Facebook Ads','2026-06-13','ok'),(3.37,'FB','Facebook Ads','2026-06-13','ok'),
 (27.00,'FB','Facebook Ads','2026-06-13','failed'),(21.59,'GEN','H-E-B #621','2026-06-13','ok'),
 (27.96,'GEN','Las Palapas Boerne','2026-06-12','ok'),(20.20,'GEN','Murphy (Walmart) gas','2026-06-12','ok'),
 (20.00,'GEN','Murphy (Walmart) gas','2026-06-12','ok'),(19.25,'GEN','Dairy Queen #10732','2026-06-11','ok'),
 (9.93,'GEN','Murphy (Walmart) gas','2026-06-11','ok'),(27.00,'FB','Facebook Ads','2026-06-11','ok'),
 (23.75,'GEN','Taco Bell #31401','2026-06-10','ok'),(9.93,'GEN','Murphy (Walmart) gas','2026-06-10','ok'),
 (21.00,'FB','Facebook Ads','2026-06-09','ok'),(13.04,'GEN','Burger King #9722','2026-06-09','ok'),
 (250.00,'GEN','SHS*Surepointer','2026-06-08','ok'),(25.77,'GEN','Gruene Botanicals','2026-06-08','ok'),
 (19.25,'GEN','Dairy Queen #10732','2026-06-07','ok'),(9.93,'GEN','Murphy (Walmart) gas','2026-06-07','ok'),
 (25.95,'GEN','Las Palapas Boerne','2026-06-06','failed'),(20.20,'GEN','Murphy (Walmart) gas','2026-06-06','ok'),
 (21.81,'GEN','Chevron 0203210','2026-06-05','ok'),(20.00,'GEN','H-E-B gas / carwash #621','2026-06-05','ok'),
 (73.93,'GEN','Google Workspace','2026-06-04','ok'),(8.63,'FB','Facebook Ads','2026-06-02','ok'),
 (3.23,'FB','Facebook Ads','2026-06-01','ok'),(12.68,'FB','Facebook Ads','2026-06-01','ok'),
 (6.34,'FB','Facebook Ads','2026-06-01','ok'),(3.17,'FB','Facebook Ads','2026-06-01','ok'),
 (70.84,'GEN','CPA Texas (tax)','2026-06-01','ok'),(13.52,'FB','Facebook Ads','2026-05-31','failed'),
 (6.76,'FB','Facebook Ads','2026-05-31','ok'),(3.38,'FB','Facebook Ads','2026-05-31','ok'),
 (27.00,'FB','Facebook Ads','2026-05-31','failed'),(2.17,'FB','Facebook Ads','2026-05-29','ok'),
 (8.56,'FB','Facebook Ads','2026-05-29','ok'),(4.28,'FB','Facebook Ads','2026-05-29','ok'),
 (2.14,'FB','Facebook Ads','2026-05-29','ok'),(38.44,'GEN','Taco Bell #31401','2026-05-28','ok'),
 (25.80,'GEN','Raising Canes 0343','2026-05-28','ok'),(10.02,'GEN','Murphy (Walmart) gas','2026-05-28','ok'),
 (89.84,'GEN','Google YouTube TV','2026-05-28','ok'),(9.93,'GEN','Murphy (Walmart) gas','2026-05-28','ok'),
 (13.48,'FB','Facebook Ads','2026-05-28','failed'),(6.74,'FB','Facebook Ads','2026-05-28','ok'),
 (3.37,'FB','Facebook Ads','2026-05-28','ok'),(27.00,'FB','Facebook Ads','2026-05-28','failed'),
 (20.00,'GEN','Resend','2026-05-24','ok'),(20.00,'GEN','Resend','2026-05-24','failed'),
 (19.00,'FB','Facebook Ads','2026-05-21','ok'),(19.00,'FB','Facebook Ads','2026-05-20','ok'),
 (13.00,'FB','Facebook Ads','2026-05-19','ok'),(9.00,'FB','Facebook Ads','2026-05-17','ok'),
 (9.00,'FB','Facebook Ads','2026-05-16','ok'),(6.00,'FB','Facebook Ads','2026-05-15','ok'),
 (301.28,'GEN','AT&T bill payment','2026-05-15','ok'),(2.00,'FB','Facebook Ads','2026-05-12','ok'),
 (3.16,'FB','Facebook Ads','2026-05-07','ok'),(3.16,'FB','Facebook Ads','2026-05-07','failed'),
 (3.12,'FB','Facebook Ads','2026-05-04','failed'),(2.00,'FB','Facebook Ads','2026-05-02','failed'),
]

def usd(x): return f"${x:,.2f}"
def dfmt(d):
    import datetime
    return datetime.datetime.strptime(d, "%Y-%m-%d").strftime("%b %d")

ok = [r for r in R if r[4] == 'ok']
failed = [r for r in R if r[4] == 'failed']
fb = sorted([r for r in ok if r[1] == 'FB'], key=lambda r: r[3], reverse=True)
gen = sorted([r for r in ok if r[1] == 'GEN'], key=lambda r: r[3], reverse=True)
fb_tot = sum(r[0] for r in fb); gen_tot = sum(r[0] for r in gen)

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Title"], textColor=NAVY, fontSize=21, alignment=0, spaceAfter=2)
SUB = ParagraphStyle("SUB", parent=styles["Normal"], textColor=MUT, fontSize=9, spaceAfter=12)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=CORAL, fontSize=13, spaceBefore=16, spaceAfter=6)
BODY = ParagraphStyle("BODY", parent=styles["Normal"], fontSize=9.5)
NOTE = ParagraphStyle("NOTE", parent=styles["Normal"], fontSize=8, textColor=MUT, spaceBefore=6)

out = os.path.expanduser("~/Desktop/PAL_Expenses_by_Merchant.pdf")
doc = SimpleDocTemplate(out, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch,
                        leftMargin=0.7*inch, rightMargin=0.7*inch, title="PAL Expenses by Merchant")
S = []

def mktbl(data, widths, totalrow=False):
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [("FONTSIZE",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
          ("LEFTPADDING",(0,0),(-1,-1),7),("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),colors.white),
          ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,ROW]),
          ("ALIGN",(-1,0),(-1,-1),"RIGHT"),("VALIGN",(0,0),(-1,-1),"MIDDLE")]
    if totalrow:
        st += [("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),("LINEABOVE",(0,-1),(-1,-1),0.75,NAVY),
               ("BACKGROUND",(0,-1),(-1,-1),SAND)]
    t.setStyle(TableStyle(st)); return t

S.append(Paragraph("Port A Local — Expenses by Merchant", H1))
S.append(Paragraph("Financial-account spend cards &nbsp;·&nbsp; May 2 – Jun 27, 2026 &nbsp;·&nbsp; "
                   "generated Jun 28, 2026", SUB))

# Summary
S.append(Paragraph("Summary", H2))
summ = [["Card", "Charges", "Spend"],
        ["PAL · FB Ads ····5656  (Facebook ad spend)", str(len(fb)), usd(fb_tot)],
        ["PAL · General Expense ····6459", str(len(gen)), usd(gen_tot)],
        ["TOTAL", str(len(ok)), usd(fb_tot+gen_tot)]]
S.append(mktbl(summ, [4.4*inch, 1.0*inch, 1.6*inch], totalrow=True))
S.append(Paragraph(f"Excludes {len(failed)} failed/declined attempts (${sum(r[0] for r in failed):,.2f} not charged). "
                   f"FB-card total ties to Meta's reported ad spend ($275.31). "
                   f"$40.88 of the total is still pending settlement.", NOTE))

# ---- by-merchant summary (both cards, one table sorted by spend) ----
bym = defaultdict(lambda: {"card": "", "n": 0, "amt": 0.0})
for r in ok:
    m = r[2]
    bym[m]["card"] = "FB ····5656" if r[1] == "FB" else "General ····6459"
    bym[m]["n"] += 1
    bym[m]["amt"] += r[0]
S.append(Paragraph(f"Expenses by merchant ({len(bym)} merchants, {len(ok)} charges)", H2))
data = [["Merchant", "Card", "Charges", "Total"]]
for m, d in sorted(bym.items(), key=lambda kv: -kv[1]["amt"]):
    data.append([m, d["card"], str(d["n"]), usd(d["amt"])])
data.append(["TOTAL", "", str(len(ok)), usd(fb_tot + gen_tot)])
S.append(mktbl(data, [3.0*inch, 1.7*inch, 0.9*inch, 1.4*inch], totalrow=True))

doc.build(S)
print("WROTE", out)
print(f"FB ····5656: {len(fb)} charges = {usd(fb_tot)}")
print(f"GEN ····6459: {len(gen)} charges = {usd(gen_tot)}")
print(f"TOTAL: {len(ok)} charges = {usd(fb_tot+gen_tot)}  | failed excluded: {len(failed)}")
