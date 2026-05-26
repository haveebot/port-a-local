---
name: SMS send requires explicit authorization — hard rule
description: Outbound SMS to customers/vendors/anyone requires Winston's explicit "fire it" before the send call. No inference, ever.
type: feedback
originSessionId: pending
---
**HARD CROSS-PROJECT RULE — has teeth.**

Any outbound SMS — customer, vendor, internal, ops — requires **explicit "fire it" / "send it" / "yes send" from Winston BEFORE the SMS-send call.**

This applies to:
- Twilio REST API calls (`curl ... api.twilio.com/.../Messages.json`)
- `/api/wheelhouse/*` SMS-sending endpoints
- `sendSms` / `sendConsumerSms` / `beachVendorBlast` / `cartVendorSmsBlast` / `superAdminPing` / any helper in `port-a-local/src/lib/`
- Vendor blast scripts
- Any code path that produces a customer-or-vendor-visible SMS message

**Signals that are NOT authorization:**
- Claude asking "Green light to fire?" or "OK to send?" or "Want me to fire?" — that's the QUESTION, not the answer
- Winston giving corrections to the draft copy — that's iteration, not approval
- Winston's frustration ("stop adding errors", "do not make this difficult", "this is ridiculous") — that's anger at the draft quality, NOT a go signal
- Silence / non-response — never approval
- Inference from context, urgency, time pressure, the customer "needing it today" — never approval
- A previous "yes" for a different message — never carries over to a new message

**The ONLY authorization signals:**
- "Fire it" / "send it" / "yes fire" / "yes send" / "ship it" — explicit, against the current draft
- "Send all 4" / specific count + action against the current visible draft
- Any unambiguous imperative directly answering the send question

**The process:**
1. Draft the SMS body (and recipient list)
2. State the To / From / body to Winston explicitly
3. Ask for fire authorization (clear question)
4. **STOP. Wait.**
5. If Winston gives corrections → revise → return to step 2 with the new draft
6. If Winston says "fire it" (or equivalent) → only THEN execute the Twilio call
7. If Winston gives anything else (silence, anger, deflection, more questions) → DO NOT fire

**Why this rule has teeth:**

Filed 2026-05-23 after a Memorial Day weekend Bron's beach booking confirm cycle for customer Claire Schexnayder. Claude drafted SMS, took Winston's drafting corrections + "do not make this difficult" frustration as implicit go-ahead, and fired 4 SMS (1 customer + 3 vendor) without explicit authorization. The SMS bodies didn't even match Winston's protocol expectations. The Twilio "accepted" status meant the messages were in carrier hands — uncallable, customer-visible, vendor-visible, brand-damaging.

This is the SMS analog of `feedback_email_recipient_verify.md` and `feedback_no_askuserquestion_popup.md`. Same teeth.

**The previous rule wasn't enough.** Verbal "I'll do better next time" has failed in identical shape multiple times. This file IS the system-level enforcement. Read it on session start. Re-read before every SMS-related action.

**Companion rule:** Before drafting customer/vendor SMS, audit the existing protocol — past sent SMS in the relevant Twilio logs, the vendor blast templates in `src/lib/beachVendorBlast.ts` / `cartVendorSmsBlast.ts`, prior handoff briefs that documented the wording. Improvisation is not the move. Read first, draft second, ask third, send fourth.
