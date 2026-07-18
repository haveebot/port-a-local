#!/usr/bin/env python3
"""
PAL — what's been PROCESSED, broken down by each individual card + current balances.
Read-only (GET only). Key read from ../.env.local; never printed.

  python3 scripts/pal-processed-by-card.py            # all-time
  python3 scripts/pal-processed-by-card.py --days 90
"""
import json, os, ssl, sys, time, urllib.parse, urllib.request, urllib.error
from collections import defaultdict
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, "..", ".env.local")
CTX = ssl.create_default_context()


def key():
    for line in open(ENV):
        line = line.strip()
        if line.startswith("STRIPE_SECRET_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'").replace("\\n", "").strip()
    sys.exit("no STRIPE_SECRET_KEY")


K = key()


def api(path, params=None):
    url = "https://api.stripe.com" + path
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {K}"})
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"_err": json.loads(e.read().decode()).get("error", {}).get("message"), "_code": e.code}


def paginate(path, params=None):
    params = dict(params or {}); params["limit"] = 100
    while True:
        d = api(path, params)
        if "_err" in d:
            raise RuntimeError(d["_err"])
        for o in d.get("data", []):
            yield o
        if not d.get("has_more"):
            break
        params["starting_after"] = d["data"][-1]["id"]


def usd(c):
    return f"${c/100:,.2f}"


since = None
if "--days" in sys.argv:
    since = int(time.time()) - int(sys.argv[sys.argv.index("--days") + 1]) * 86400
WIN = {"created[gte]": since} if since else {}
label = "all-time" if not since else f"last {(int(time.time())-since)//86400}d"

acct = api("/v1/account")
print(f"PAL — PROCESSED BY CARD  ({label})")
print(f"account: {acct.get('id')}  {acct.get('business_profile',{}).get('name') or ''}  [{'LIVE' if K.startswith('sk_live') else 'TEST'}]")
print(f"generated {datetime.now(timezone.utc):%Y-%m-%d %H:%M UTC}")

# ---------------- CURRENT BALANCES ----------------
print("\n" + "=" * 70)
print("CURRENT BALANCES")
print("=" * 70)
bal = api("/v1/balance")
avail = sum(b["amount"] for b in bal.get("available", []))
pend = sum(b["amount"] for b in bal.get("pending", []))
print("  ▸ PAYMENTS BALANCE  (this account)")
print(f"      available : {usd(avail)}")
print(f"      pending   : {usd(pend)}")
print(f"      total     : {usd(avail+pend)}")
print("  ▸ FINANCIAL ACCOUNT (Stripe Treasury)")
fa = api("/v1/treasury/financial_accounts")
if "_err" in fa:
    print(f"      NOT on this account — Treasury capability: {acct.get('capabilities',{}).get('treasury','absent')}")
    print(f"      ({fa['_err']})")
    print("      → lives on a different Stripe login; needs that account's key to read.")
else:
    for a in fa.get("data", []):
        b = a.get("balance", {}).get("cash", {})
        print(f"      {a['id']}  cash: {b}")

# ---------------- PROCESSED, GROUPED BY CARD ----------------
print("\n" + "=" * 70)
print(f"WHAT PAL HAS PROCESSED — BY INDIVIDUAL CARD  ({label})")
print("=" * 70)
cards = defaultdict(lambda: {"gross": 0, "refunded": 0, "n": 0, "brand": "", "last4": "", "funding": "", "country": "", "wallet": "", "who": set(), "first": None, "last": None})
non_card = defaultdict(lambda: {"gross": 0, "n": 0})
total_gross = total_ref = n_paid = 0

for c in paginate("/v1/charges", WIN):
    if not (c.get("paid") and c.get("status") == "succeeded"):
        continue
    n_paid += 1
    amt = c.get("amount", 0)
    ref = c.get("amount_refunded", 0)
    total_gross += amt; total_ref += ref
    pmd = c.get("payment_method_details", {}) or {}
    card = pmd.get("card") or (pmd.get("card_present")) or None
    bd = c.get("billing_details", {}) or {}
    who = bd.get("name") or bd.get("email") or c.get("receipt_email") or "—"
    if card and card.get("fingerprint"):
        fp = card["fingerprint"]
        d = cards[fp]
        d["gross"] += amt; d["refunded"] += ref; d["n"] += 1
        d["brand"] = card.get("brand", "?"); d["last4"] = card.get("last4", "????")
        d["funding"] = card.get("funding", ""); d["country"] = card.get("country", "")
        w = card.get("wallet")
        if w:
            d["wallet"] = w.get("type", "")
        d["who"].add(who)
        if d["first"] is None or c["created"] < d["first"]:
            d["first"] = c["created"]
        if d["last"] is None or c["created"] > d["last"]:
            d["last"] = c["created"]
    else:
        non_card[pmd.get("type", "unknown")]["gross"] += amt
        non_card[pmd.get("type", "unknown")]["n"] += 1

rows = sorted(cards.values(), key=lambda d: -d["gross"])
print(f"  {len(rows)} distinct card(s) across {n_paid} paid charge(s)\n")
print(f"  {'#':>2}  {'card':<28}{'type':<9}{'chgs':>5}{'processed':>12}{'refunded':>11}  cardholder / dates")
print("  " + "-" * 96)
for i, d in enumerate(rows, 1):
    cardstr = f"{d['brand'].capitalize()} ****{d['last4']}"
    if d["wallet"]:
        cardstr += f" ({d['wallet']})"
    who = "; ".join(sorted(d["who"]))[:34]
    fr = datetime.fromtimestamp(d["first"], tz=timezone.utc).strftime("%m/%d")
    to = datetime.fromtimestamp(d["last"], tz=timezone.utc).strftime("%m/%d")
    dates = fr if fr == to else f"{fr}–{to}"
    refs = usd(d["refunded"]) if d["refunded"] else "—"
    print(f"  {i:>2}  {cardstr:<28}{d['funding']:<9}{d['n']:>5}{usd(d['gross']):>12}{refs:>11}  {who} [{dates}]")
print("  " + "-" * 96)
print(f"  {'TOTAL':<39}{n_paid:>5}{usd(total_gross):>12}{usd(total_ref) if total_ref else '—':>11}")
if non_card:
    print("\n  non-card payment methods:")
    for t, d in non_card.items():
        print(f"    {t}: {d['n']} charge(s), {usd(d['gross'])}")

print("\n  notes:")
print("   · 'processed' = gross the cardholder was charged (before Stripe fees).")
print("   · cards de-duplicated by Stripe fingerprint, so the same physical card")
print("     used on multiple orders rolls into one row (with charge count + date span).")
print("   · refunds across all cards this window:", usd(total_ref) if total_ref else "$0.00")
