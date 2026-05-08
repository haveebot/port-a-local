---
name: Sage contract drafting principles
description: Three patterns from Zack's review of v1.1 agency contract (2026-04-28). Apply to any future Sage legal/business contract.
type: feedback
originSessionId: 39f652cb-f71a-42ff-9605-fa479524a0b5
---
Three principles for any Sage Em legal/business contract drafted from this point forward, distilled from Zack's 2026-04-28 review of the v1.1 Sage Agency Sales Representative Agreement (resolved in v1.2).

## 1. Quote-based, not catalog-based

Sage operates on quote-based pricing — does NOT publish a catalog price list. Contract language must reflect this.

**Canonical phrasing (locked in v1.2 §11 + §12(a)):**
> "Manufacturer shall **establish** a Base Price for each Product, which shall be communicated to Representative through **Manufacturer's quote process** or by other written advices."

**Why:** Sage doesn't have a published price book. The Base Price exists per-opportunity, conveyed via quote. Replaces traditional "published price list" / "price book sheets" framing common in Acuity/Lithonia/Cooper rep agreements.

**How to apply:** Whenever a contract clause references pricing communication, default to the quote-process language. Don't write "price list" / "price book" / "published price" anywhere.

---

## 2. Operational simplicity over comprehensive coverage

Default to the SHORTER drafting choice unless coverage is mandatory. Z's review consistently moved toward simpler/shorter:

- Removed Schedule C (Approved Competitive Product Lines) — pain in the ass to enumerate per agency
- Reserved Section 16 (Consignment Stock) — zero current interest
- Softened §13(b) "each month" → "from time to time"
- Trimmed Representative signature block (removed Website, Incorporated YES/NO, State of Incorporation)
- Adopted catch-all Trade Area definition: "trade area assigned to Representative by the largest lighting conglomerate then represented" — saves drafting custom territory per agency

**Why:** Sage is small + spec-driven. Each piece of friction in the contract = one more reason an agency hesitates. Shorter contract = lower deal-friction. We can always amend forward.

**How to apply:** When drafting any optional/comprehensive clause, ask "would Sage actually run this operationally early-stage?" If no → simplify or omit. Mandatory legal/tax bits stay.

---

## 3. Reserve over Remove for unused-but-possible clauses

When stakeholders are NEUTRAL on optional sections (Z's word: "no harm no foul"), Reserve them rather than deleting. Preserves cross-references, keeps optionality open, signals "this can re-enable" without forcing renumbering.

**Canonical pattern (locked in v1.2 §16):**
```
## 16. Consignment Stock

*[Reserved — consignment stock is not contemplated as of the Effective Date. The parties may, by written addendum executed by both parties, establish consignment stock terms if and when desired.]*
```

Cross-references elsewhere (e.g., §11's "except for sale of consignment stock pursuant to Paragraph 16") stay intact and become harmless no-ops when the section is dormant.

**When to Remove vs Reserve:**
- **Remove** when the clause is actively against Sage's position (e.g., Schedule C — pain to enforce, friction at deal-time)
- **Reserve** when neutral/optional (e.g., Section 16 — possibly useful one day, no current need)

---

**Cross-reference:** Full Z review log + per-issue resolution at `sage-em/sage/Sage Em/Strategy/Sage Contract — Z Review v1.1 (2026-04-28).md`. Original framework at `Strategy/Agency Contract Framework.md`. Canonical contract at `Documents/Sage-Agency-Sales-Representative-Agreement.md` (always current; v1.2 as of this writing).
