#!/usr/bin/env python3
"""
PAL Stripe analysis — read-only.

Pulls live Stripe data and prints a financial analysis far deeper than the
/wheelhouse/revenue snapshot (which is gross-only, last-30-days, by-vertical).

This script makes ONLY GET requests. It never moves money or writes anything.

Sources, all paginated to completion (all-time):
  - /v1/balance                 current available + pending
  - /v1/balance_transactions    ground truth: gross in, Stripe fees, net, refunds, payouts, transfers, issuing, adjustments
  - /v1/checkout/sessions        per-vertical margin split (pal_fee_total_cents vs vendor_total_cents in metadata)
  - /v1/charges                  refunds, disputes, customer/email repeat analysis
  - /v1/refunds, /v1/disputes
  - /v1/payouts                  money actually wired to the bank
  - /v1/transfers                Connect payouts to vendor accounts (deliver / locals)
  - /v1/issuing/transactions     card spend (FB ads), if Issuing is enabled

Key is read from ../.env.local (STRIPE_SECRET_KEY) — never printed.

Usage:
  python3 scripts/stripe-analysis.py            # all-time
  python3 scripts/stripe-analysis.py --days 90  # restrict charge/session/txn windows to last N days
"""

import json
import os
import ssl
import sys
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

API = "https://api.stripe.com"
HERE = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(HERE, "..", ".env.local")


def load_key():
    if not os.path.exists(ENV_PATH):
        sys.exit(f"Cannot find {ENV_PATH}")
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line.startswith("STRIPE_SECRET_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                # defensive: some PAL env values carry a literal trailing \n
                v = v.replace("\\n", "").strip()
                return v
    sys.exit("STRIPE_SECRET_KEY not found in .env.local")


KEY = load_key()
CTX = ssl.create_default_context()
# macOS system Python ships LibreSSL; default context is fine for api.stripe.com


def sget(path, params=None):
    """Single GET. Returns parsed JSON dict. Raises on hard HTTP error."""
    url = API + path
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
        return json.loads(r.read().decode())


def paginate(path, params=None, cap=200):
    """Yield every object across all pages (limit=100). cap = max pages."""
    params = dict(params or {})
    params["limit"] = 100
    pages = 0
    while True:
        try:
            data = sget(path, params)
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            try:
                msg = json.loads(body)["error"]["message"]
            except Exception:
                msg = body[:200]
            raise RuntimeError(f"{e.code} {msg}")
        for obj in data.get("data", []):
            yield obj
        pages += 1
        if not data.get("has_more") or pages >= cap:
            if data.get("has_more"):
                print(f"  [warn] hit page cap ({cap}) on {path} — results truncated", file=sys.stderr)
            break
        last = data["data"][-1]["id"]
        params["starting_after"] = last


def usd(cents):
    neg = cents < 0
    cents = abs(int(round(cents)))
    s = f"${cents/100:,.2f}"
    return f"-{s}" if neg else s


def ym(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m")


def hr(title):
    print("\n" + "═" * 64)
    print(title)
    print("═" * 64)


# ---- optional time window ----
since_ts = None
if "--days" in sys.argv:
    n = int(sys.argv[sys.argv.index("--days") + 1])
    since_ts = int(time.time()) - n * 86400
WINDOW = {"created[gte]": since_ts} if since_ts else {}
window_label = f"last {(int(time.time())-since_ts)//86400} days" if since_ts else "all-time"


def main():
    print(f"PAL STRIPE ANALYSIS  ({window_label})")
    print(f"generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    acct = sget("/v1/account")
    mode = "LIVE" if KEY.startswith("sk_live") else "TEST"
    print(f"account: {acct.get('id')}  ({acct.get('business_profile',{}).get('name') or acct.get('settings',{}).get('dashboard',{}).get('display_name') or '—'})  [{mode}]")

    # ---------- BALANCE ----------
    hr("1. CURRENT BALANCE")
    bal = sget("/v1/balance")
    for kind in ("available", "pending"):
        for b in bal.get(kind, []):
            print(f"  {kind:9} {b['currency'].upper()}  {usd(b['amount'])}")
    conn = bal.get("connect_reserved", [])
    for b in conn:
        print(f"  reserved  {b['currency'].upper()}  {usd(b['amount'])}")

    # ---------- BALANCE TRANSACTIONS (ground truth) ----------
    hr(f"2. LIFETIME MONEY FLOW  (balance transactions, {window_label})")
    by_type = defaultdict(lambda: {"gross": 0, "fee": 0, "net": 0, "n": 0})
    total_fee = 0
    txn_count = 0
    for t in paginate("/v1/balance_transactions", WINDOW):
        ty = t["type"]
        by_type[ty]["gross"] += t["amount"]
        by_type[ty]["fee"] += t["fee"]
        by_type[ty]["net"] += t["net"]
        by_type[ty]["n"] += 1
        total_fee += t["fee"]
        txn_count += 1
    print(f"  {'type':<24}{'count':>7}{'gross':>16}{'fee':>13}{'net':>16}")
    print("  " + "-" * 74)
    for ty in sorted(by_type, key=lambda k: -abs(by_type[k]["net"])):
        d = by_type[ty]
        print(f"  {ty:<24}{d['n']:>7}{usd(d['gross']):>16}{usd(d['fee']):>13}{usd(d['net']):>16}")
    print("  " + "-" * 74)
    print(f"  {'TOTAL Stripe fees':<24}{'':>7}{'':>16}{usd(total_fee):>13}")
    print(f"  ({txn_count} balance transactions scanned)")

    # ---------- CHECKOUT SESSIONS: margin split by vertical ----------
    hr(f"3. REVENUE BY VERTICAL  (paid checkout sessions, {window_label})")
    vert = defaultdict(lambda: {"paid": 0, "pal": 0, "vendor": 0, "n": 0, "pal_known": 0, "vendor_known": 0})
    sess_total = 0
    sess_paid = 0
    monthly = defaultdict(int)
    emails = defaultdict(lambda: {"n": 0, "amt": 0})
    for s in paginate("/v1/checkout/sessions", WINDOW):
        sess_total += 1
        if s.get("payment_status") != "paid":
            continue
        sess_paid += 1
        amt = s.get("amount_total") or 0
        md = s.get("metadata") or {}
        v = md.get("type") or "unknown"
        vert[v]["paid"] += amt
        vert[v]["n"] += 1
        if "pal_fee_total_cents" in md:
            try:
                vert[v]["pal"] += int(md["pal_fee_total_cents"]); vert[v]["pal_known"] += 1
            except ValueError:
                pass
        if "vendor_total_cents" in md:
            try:
                vert[v]["vendor"] += int(md["vendor_total_cents"]); vert[v]["vendor_known"] += 1
            except ValueError:
                pass
        monthly[ym(s["created"])] += amt
        em = (s.get("customer_details") or {}).get("email") or md.get("email") or "—"
        emails[em.lower()]["n"] += 1
        emails[em.lower()]["amt"] += amt

    print(f"  {'vertical':<16}{'count':>7}{'customer paid':>16}{'PAL fee':>14}{'vendor share':>15}")
    print("  " + "-" * 68)
    tot_paid = tot_pal = tot_vendor = 0
    for v in sorted(vert, key=lambda k: -vert[k]["paid"]):
        d = vert[v]
        pal = usd(d["pal"]) if d["pal_known"] else "—"
        ven = usd(d["vendor"]) if d["vendor_known"] else "—"
        print(f"  {v:<16}{d['n']:>7}{usd(d['paid']):>16}{pal:>14}{ven:>15}")
        tot_paid += d["paid"]; tot_pal += d["pal"]; tot_vendor += d["vendor"]
    print("  " + "-" * 68)
    print(f"  {'TOTAL':<16}{sess_paid:>7}{usd(tot_paid):>16}{usd(tot_pal):>14}{usd(tot_vendor):>15}")
    if sess_paid:
        print(f"  AOV (avg order value): {usd(tot_paid/sess_paid)}   ·   {sess_total-sess_paid} unpaid/abandoned sessions")
    print("  note: PAL fee / vendor share shown only where checkout metadata carries the split")
    print("        (beach & cart). Surfaces without split metadata show '—'.")

    # ---------- MONTHLY TREND ----------
    hr("4. MONTHLY TREND  (customer paid, from paid sessions)")
    if monthly:
        mx = max(monthly.values())
        for m in sorted(monthly):
            bar = "█" * int(40 * monthly[m] / mx) if mx else ""
            print(f"  {m}  {usd(monthly[m]):>13}  {bar}")

    # ---------- CHARGES: refunds / disputes / repeat ----------
    hr(f"5. CHARGES, REFUNDS & DISPUTES  ({window_label})")
    n_charges = n_paid = n_refunded = n_disputed = 0
    gross_charges = refunded_amt = 0
    for c in paginate("/v1/charges", WINDOW):
        n_charges += 1
        if c.get("paid") and c.get("status") == "succeeded":
            n_paid += 1
            gross_charges += c.get("amount", 0)
        if c.get("refunded") or c.get("amount_refunded", 0) > 0:
            n_refunded += 1
            refunded_amt += c.get("amount_refunded", 0)
        if c.get("disputed"):
            n_disputed += 1
    print(f"  charges (succeeded): {n_paid}    gross: {usd(gross_charges)}")
    refund_rate = (refunded_amt / gross_charges * 100) if gross_charges else 0
    print(f"  refunds: {n_refunded} charge(s), {usd(refunded_amt)} returned  ({refund_rate:.1f}% of gross)")
    disp = list(paginate("/v1/disputes", WINDOW))
    if disp:
        d_amt = sum(d["amount"] for d in disp)
        open_d = sum(1 for d in disp if d.get("status") in ("needs_response", "warning_needs_response", "under_review"))
        print(f"  disputes: {len(disp)} ({usd(d_amt)}), {open_d} needing response")
        for d in disp[:5]:
            print(f"    · {usd(d['amount'])}  {d.get('reason')}  [{d.get('status')}]  {datetime.fromtimestamp(d['created'],tz=timezone.utc):%Y-%m-%d}")
    else:
        print("  disputes: none ✅")

    # ---------- CUSTOMERS ----------
    hr("6. CUSTOMERS  (by email, from paid sessions)")
    real = {e: d for e, d in emails.items() if e and e != "—"}
    repeat = {e: d for e, d in real.items() if d["n"] > 1}
    print(f"  distinct customers: {len(real)}    repeat (2+ orders): {len(repeat)}")
    top = sorted(real.items(), key=lambda kv: -kv[1]["amt"])[:8]
    for e, d in top:
        flag = "  ↻" if d["n"] > 1 else ""
        print(f"    {usd(d['amt']):>11}  {d['n']:>2} order(s)  {e}{flag}")

    # ---------- PAYOUTS ----------
    hr("7. PAYOUTS TO BANK")
    payouts = list(paginate("/v1/payouts", WINDOW))
    if payouts:
        paid_out = sum(p["amount"] for p in payouts if p.get("status") == "paid")
        pending = sum(p["amount"] for p in payouts if p.get("status") in ("pending", "in_transit"))
        print(f"  {len([p for p in payouts if p.get('status')=='paid'])} paid payouts, total {usd(paid_out)} wired to bank")
        if pending:
            print(f"  in transit / pending: {usd(pending)}")
        print("  recent:")
        for p in payouts[:6]:
            arr = datetime.fromtimestamp(p["arrival_date"], tz=timezone.utc).strftime("%Y-%m-%d")
            print(f"    {usd(p['amount']):>11}  arrives {arr}  [{p.get('status')}]  {p.get('method','')}")
    else:
        print("  no payouts in window (funds may be held in balance)")

    # ---------- CONNECT TRANSFERS ----------
    hr("8. CONNECT TRANSFERS  (vendor payouts: deliver / locals)")
    try:
        transfers = list(paginate("/v1/transfers", WINDOW))
        if transfers:
            tt = sum(t["amount"] for t in transfers)
            bydest = defaultdict(lambda: [0, 0])
            for t in transfers:
                bydest[t.get("destination", "—")][0] += t["amount"]
                bydest[t.get("destination", "—")][1] += 1
            print(f"  {len(transfers)} transfers, {usd(tt)} sent to connected accounts")
            for dest, (amt, n) in sorted(bydest.items(), key=lambda kv: -kv[1][0])[:8]:
                print(f"    {usd(amt):>11}  {n:>2}x  → {dest}")
        else:
            print("  no Connect transfers in window")
    except RuntimeError as e:
        print(f"  (Connect not queryable: {e})")

    # ---------- ISSUING (ad card) ----------
    hr("9. ISSUING / CARD SPEND  (e.g. FB ads card)")
    try:
        itx = list(paginate("/v1/issuing/transactions", WINDOW))
        if itx:
            spend = sum(-t["amount"] for t in itx if t["amount"] < 0)
            bym = defaultdict(int)
            for t in itx:
                if t["amount"] < 0:
                    bym[ym(t["created"])] += -t["amount"]
            print(f"  {len(itx)} issuing transactions, {usd(spend)} spent")
            for m in sorted(bym):
                print(f"    {m}  {usd(bym[m])}")
        else:
            print("  no issuing transactions in window")
    except RuntimeError as e:
        print(f"  (Issuing not enabled / not queryable: {e})")

    print("\n" + "═" * 64)
    print("CAVEATS")
    print("═" * 64)
    print("  · Beach & cart vendor splits: PAL collects the FULL customer amount in")
    print("    Stripe; vendors are paid OUT OF BAND (manual). So 'customer paid' for")
    print("    those verticals is NOT PAL margin — see the PAL-fee column for the take.")
    print("  · Deliver / locals use Connect: vendor share leaves via transfers (§8).")
    print("  · 'net' in §2 = gross minus Stripe processing fees only.")


if __name__ == "__main__":
    main()
