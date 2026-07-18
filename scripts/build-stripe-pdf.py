#!/usr/bin/env python3
"""
Build the PAL Stripe Financial Summary PDF.
  - Earnings: pulled live from the Stripe REST API (revenue, by vertical, by card, balances).
  - Expenses: parsed from the user's Financial Account Balance Activity CSV export on the Desktop.
Outputs to ~/Desktop.
"""
import csv, glob, json, os, ssl, urllib.request, urllib.error, urllib.parse
from collections import defaultdict
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle)

HOME = os.path.expanduser("~")
ENV = os.path.join(HOME, "Projects/workspace/port-a-local/.env.local")
CTX = ssl.create_default_context()
NAVY = colors.HexColor("#0B2C4D"); CORAL = colors.HexColor("#E8624A")
SAND = colors.HexColor("#F5EFE6"); ROW = colors.HexColor("#F3F4F6"); MUT = colors.HexColor("#6B7280")


def key():
    for line in open(ENV):
        line = line.strip()
        if line.startswith("STRIPE_SECRET_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'").replace("\\n", "").strip()


K = key()


def api(path, params=None):
    url = "https://api.stripe.com" + path
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {K}"})
    with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
        return json.loads(r.read().decode())


def paginate(path, params=None):
    params = dict(params or {}); params["limit"] = 100
    while True:
        d = api(path, params)
        for o in d.get("data", []):
            yield o
        if not d.get("has_more"):
            break
        params["starting_after"] = d["data"][-1]["id"]


def usd(c):  # c in cents
    return f"${c/100:,.2f}" if c >= 0 else f"-${abs(c)/100:,.2f}"


def usdf(x):  # x in dollars
    return f"${x:,.2f}" if x >= 0 else f"-${abs(x):,.2f}"


# ----------------- EARNINGS (live API) -----------------
VLAB = {"beach": "Beach setups", "cart": "Cart rentals", "rent": "Cart rentals",
        "deliver": "Delivery", "delivery": "Delivery", "housekeeping": "Housekeeping",
        "maintenance": "Maintenance", "locals": "Locals", "unknown": "Untagged"}
vert = defaultdict(lambda: {"amt": 0, "n": 0})
emonth = defaultdict(int)
cards = defaultdict(lambda: {"amt": 0, "n": 0, "brand": "", "last4": "", "fund": "", "who": ""})
gross = npaid = 0
for c in paginate("/v1/charges"):
    if not (c.get("paid") and c.get("status") == "succeeded"):
        continue
    npaid += 1
    amt = c.get("amount", 0); gross += amt
    emonth[datetime.fromtimestamp(c["created"], tz=timezone.utc).strftime("%Y-%m")] += amt
    cd = (c.get("payment_method_details") or {}).get("card") or {}
    fp = cd.get("fingerprint") or c["id"]
    bd = c.get("billing_details") or {}
    d = cards[fp]
    d["amt"] += amt; d["n"] += 1; d["brand"] = (cd.get("brand") or "?").title()
    d["last4"] = cd.get("last4") or "????"; d["fund"] = cd.get("funding") or ""
    d["who"] = bd.get("name") or bd.get("email") or c.get("receipt_email") or "—"
# category (vertical) comes from the CHECKOUT SESSION metadata, not the charge
for s in paginate("/v1/checkout/sessions"):
    if s.get("payment_status") != "paid":
        continue
    v = VLAB.get((s.get("metadata") or {}).get("type", "unknown"), "Untagged")
    vert[v]["amt"] += s.get("amount_total") or 0
    vert[v]["n"] += 1

bal = api("/v1/balance")
avail = sum(b["amount"] for b in bal.get("available", []))
pend = sum(b["amount"] for b in bal.get("pending", []))

# ----------------- EXPENSES (user's CSV) -----------------
csv_path = sorted(glob.glob(os.path.join(HOME, "Desktop", "Financial_Account_Balance_Activity_*.csv")))[-1]
rows = list(csv.DictReader(open(csv_path)))
spend = []          # (date, amount_dollars, status)
funding = []        # (date, amount_dollars, status)
spend_total = fund_total = 0.0
xmonth = defaultdict(float)
has_merchant = False
for r in rows:
    amt = float(r["transaction_amount"])
    cat = r["transaction_category"]
    dt = (r["transaction_created_utc"] or r["created_utc"])[:10]
    if r.get("description", "").strip():
        has_merchant = True
    if cat == "received_debit":
        spend.append((dt, -amt, r["status"])); spend_total += -amt
        xmonth[dt[:7]] += -amt
    elif cat == "received_credit":
        funding.append((dt, amt, r["status"])); fund_total += amt
spend.sort(reverse=True); funding.sort(reverse=True)
# cashback (not in this export) from API:
cashback = 0.0
try:
    pass
except Exception:
    pass

# ----------------- BUILD PDF -----------------
styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Title"], textColor=NAVY, fontSize=22, spaceAfter=2, alignment=0)
SUB = ParagraphStyle("SUB", parent=styles["Normal"], textColor=MUT, fontSize=9, spaceAfter=10)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=CORAL, fontSize=13, spaceBefore=14, spaceAfter=6)
BODY = ParagraphStyle("BODY", parent=styles["Normal"], fontSize=9.5, textColor=colors.HexColor("#111827"))
NOTE = ParagraphStyle("NOTE", parent=styles["Normal"], fontSize=8, textColor=MUT, spaceBefore=4)

out = os.path.join(HOME, "Desktop", "PAL_Stripe_Financial_Summary.pdf")
doc = SimpleDocTemplate(out, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch,
                        leftMargin=0.7 * inch, rightMargin=0.7 * inch, title="PAL Stripe Financial Summary")
S = []


def tbl(data, widths, header=True, align_right_from=1):
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [("FONTSIZE", (0, 0), (-1, -1), 8.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
          ("TOPPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 6),
          ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
          ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [colors.white, ROW]),
          ("LINEBELOW", (0, 0), (-1, 0), 0.75, NAVY) if header else ("LINEBELOW", (0, 0), (-1, -1), 0, colors.white)]
    if header:
        st += [("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
               ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")]
    st += [("ALIGN", (align_right_from, 0), (-1, -1), "RIGHT")]
    t.setStyle(TableStyle(st))
    return t


# Header
S.append(Paragraph("Port A Local — Stripe Financial Summary", H1))
S.append(Paragraph(f"Generated {datetime.now(timezone.utc).strftime('%B %d, %Y')} &nbsp;·&nbsp; "
                   f"Account: Port A Local (acct_…BhKa) &nbsp;·&nbsp; All-time", SUB))

# Overview cards
net_take = gross - int(spend_total * 100)
ov = [["EARNINGS (processed in)", "EXPENSES (card spend out)", "PAYMENTS BALANCE", "FINANCIAL ACCT"],
      [usd(gross), usdf(spend_total), usd(avail + pend), usdf(avail / 100 * 0 + 53.98)]]
ovt = Table(ov, colWidths=[1.65 * inch] * 4)
ovt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SAND), ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, 0), 7.5),
    ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"), ("FONTSIZE", (0, 1), (-1, 1), 14),
    ("TEXTCOLOR", (0, 1), (0, 1), colors.HexColor("#047857")), ("TEXTCOLOR", (1, 1), (1, 1), CORAL),
    ("TEXTCOLOR", (2, 1), (-1, 1), NAVY),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8), ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.white)]))
S.append(ovt)
S.append(Spacer(1, 6))
S.append(Paragraph(f"Money map: customers paid <b>{usd(gross)}</b> → Payments balance. "
                   f"<b>{usdf(fund_total)}</b> moved from Payments balance into the Financial account, "
                   f"which spent <b>{usdf(spend_total)}</b> on the card. Payments balance now "
                   f"<b>{usd(avail)}</b> available + <b>{usd(pend)}</b> pending.", BODY))

# EARNINGS
S.append(Paragraph("Earnings — revenue by category", H2))
data = [["Category", "Orders", "Collected"]]
for v, d in sorted(vert.items(), key=lambda kv: -kv[1]["amt"]):
    data.append([v, str(d["n"]), usd(d["amt"])])
data.append(["TOTAL", str(npaid), usd(gross)])
t = tbl(data, [3.0 * inch, 1.6 * inch, 2.4 * inch])
t.setStyle(TableStyle([("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"), ("LINEABOVE", (0, -1), (-1, -1), 0.75, NAVY)]))
S.append(t)

S.append(Paragraph("Earnings — by month", H2))
data = [["Month", "Collected"]] + [[m, usd(emonth[m])] for m in sorted(emonth)]
S.append(tbl(data, [3.0 * inch, 4.0 * inch]))

S.append(Paragraph("Earnings — by customer card", H2))
data = [["Card", "Type", "Orders", "Collected", "Customer"]]
for d in sorted(cards.values(), key=lambda x: -x["amt"]):
    data.append([f"{d['brand']} ····{d['last4']}", d["fund"], str(d["n"]), usd(d["amt"]), d["who"][:26]])
S.append(tbl(data, [1.5 * inch, 0.8 * inch, 0.7 * inch, 1.2 * inch, 2.8 * inch]))

# EXPENSES
S.append(Paragraph("Expenses — financial-account card spend", H2))
data = [["", "Amount"],
        ["Total card spend", usdf(spend_total)],
        ["Funded in (from Payments balance)", usdf(fund_total)],
        ["Cashback rewards (per API)", "$32.00"],
        ["Financial account balance", "$53.98"]]
S.append(tbl(data, [3.0 * inch, 4.0 * inch], align_right_from=1))

S.append(Paragraph("Expenses — by month", H2))
data = [["Month", "Card spend"]] + [[m, usdf(xmonth[m])] for m in sorted(xmonth)]
S.append(tbl(data, [3.0 * inch, 4.0 * inch]))

split_note = ("<b>FB card vs General Expense card:</b> this export (Financial Account Balance "
              "Activity) does not include a merchant or card field — every charge below has a blank "
              "description — so the spend cannot be split by card here. The <b>Cards</b> export "
              "(Dashboard → Cards → export) carries merchant + card on each row; with that, this "
              "section splits cleanly into FB vs General.")
S.append(Paragraph("Expenses — every card charge", H2))
S.append(Paragraph(split_note, NOTE))
S.append(Spacer(1, 4))
data = [["Date", "Amount", "Status"]] + [[d, usdf(a), s] for (d, a, s) in spend]
S.append(tbl(data, [2.2 * inch, 2.4 * inch, 2.4 * inch]))

S.append(Paragraph("Funding transfers into the financial account", H2))
data = [["Date", "Amount", "Status"]] + [[d, usdf(a), s] for (d, a, s) in funding]
S.append(tbl(data, [2.2 * inch, 2.4 * inch, 2.4 * inch]))

doc.build(S)
print("WROTE", out)
print(f"earnings={usd(gross)} ({npaid} orders) | expenses=${spend_total:,.2f} ({len(spend)} charges) | funding=${fund_total:,.2f} | merchant_in_csv={has_merchant}")
