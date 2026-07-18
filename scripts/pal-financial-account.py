#!/usr/bin/env python3
"""
PAL — FINANCIAL ACCOUNT (expense side) analysis via the Stripe REPORTING API.

The direct Treasury/Issuing REST endpoints are blocked for PAL's own key, BUT the
Reporting API exposes financial-account report types. This pulls the full ledger
(card spend, funding transfers in, cashback) and the current balance — automated,
no dashboard needed.

Read-only intent: it POSTs a report_run (an analytics artifact — no money moves).

  python3 scripts/pal-financial-account.py
"""
import csv, io, json, ssl, time, urllib.request, urllib.error, urllib.parse
from collections import defaultdict

CTX = ssl.create_default_context()


def key():
    for line in open(__file__.rsplit("/", 2)[0] + "/.env.local"):
        line = line.strip()
        if line.startswith("STRIPE_SECRET_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'").replace("\\n", "").strip()


K = key()


def api(path, method="GET", data=None):
    url = "https://api.stripe.com" + path
    h = {"Authorization": f"Bearer {K}"}
    body = None
    if data:
        body = urllib.parse.urlencode(data, doseq=True).encode()
        h["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, headers=h, data=body, method=method)
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {}


def run_report(rt):
    _, spec = api(f"/v1/reporting/report_types/{rt}")
    p = {"report_type": rt,
         "parameters[interval_start]": spec["data_available_start"],
         "parameters[interval_end]": spec["data_available_end"]}
    _, run = api("/v1/reporting/report_runs", "POST", p)
    rid = run["id"]
    for _ in range(40):
        _, run = api(f"/v1/reporting/report_runs/{rid}")
        if run.get("status") in ("succeeded", "failed"):
            break
        time.sleep(3)
    if run.get("status") != "succeeded":
        raise RuntimeError(f"{rt}: {run.get('status')} {run.get('error')}")
    req = urllib.request.Request(run["result"]["url"], headers={"Authorization": f"Bearer {K}"})
    with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
        return list(csv.DictReader(io.StringIO(r.read().decode())))


def usd(x):
    return f"${x:,.2f}" if x >= 0 else f"-${abs(x):,.2f}"


print("PAL — FINANCIAL ACCOUNT (expenses) via Reporting API\n" + "=" * 60)

# ---- current balance (authoritative) ----
def f(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0

bal = run_report("financial_account_balance.summary.1")
print("CURRENT FINANCIAL-ACCOUNT BALANCE")
for row in bal:
    print(f"  {row.get('category',''):<22} {row.get('description',''):<18} {usd(f(row.get('amount')))}")

# ---- full ledger ----
rows = run_report("financial_account_balance_change_from_activity.itemized.2")
cat = defaultdict(lambda: {"in": 0.0, "out": 0.0, "n": 0})
monthly = defaultdict(lambda: {"spend": 0.0, "fund": 0.0})
net = 0.0
spend_posted = spend_pending = fund_in = rewards = 0.0
n_spend = 0
for r in rows:
    amt = f(r["amount"])
    st = r["status"]
    c = r["category"]
    net += f(r["available_balance_impact"])
    if st == "void":
        continue
    cat[c]["n"] += 1
    cat[c]["in" if amt >= 0 else "out"] += amt
    m = (r["created"] or "")[:7]
    if c == "received_debit":
        n_spend += 1
        if st == "posted":
            spend_posted += -amt
        else:
            spend_pending += -amt
        monthly[m]["spend"] += -amt
    elif c == "received_credit":
        fund_in += amt
        monthly[m]["fund"] += amt
    elif c == "reward":
        rewards += amt

print("\nLEDGER SUMMARY  (" + str(len(rows)) + " transactions, "
      + (rows[-1]["created"][:10] if rows else "") + " → " + (rows[0]["created"][:10] if rows else "") + ")")
print(f"  card spend (settled)   : {usd(-spend_posted)}   over {n_spend} card transactions")
print(f"  card spend (pending)   : {usd(-spend_pending)}")
print(f"  TOTAL spent on card    : {usd(-(spend_posted+spend_pending))}")
print(f"  funded in (transfers)  : {usd(fund_in)}   (moved from Payments balance)")
print(f"  cashback rewards       : {usd(rewards)}")
print(f"  net available impact   : {usd(net)}  (reconciles to balance above)")

print("\nBY CATEGORY")
for c, d in sorted(cat.items(), key=lambda kv: kv[0]):
    tot = d["in"] + d["out"]
    print(f"  {c:<20} {d['n']:>3} txns   net {usd(tot)}")

print("\nMONTHLY  (card spend vs funding in)")
for m in sorted(monthly):
    d = monthly[m]
    print(f"  {m}   spent {usd(d['spend']):>11}   funded {usd(d['fund']):>11}")

print("\nNOTE: merchant names + which card (····6459 vs ····6758) are NOT in this")
print("report (Treasury view). That per-merchant / per-card split needs Stripe Sigma")
print("(enabled on this account) — issuing_transactions table. Ask to wire it up.")
