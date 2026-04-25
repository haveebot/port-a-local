# Dispatch idea (queued for discussion) — User-Submission Pipeline

**Status:** Idea · awaiting discussion · NOT building yet
**Source:** Winston, 2026-04-25 session
**Type:** Editorial system / product change to the existing Dispatch section

---

## Winston's framing (verbatim from chat)

> The angle could be that the dispatch articles written all come from user recommendations. The user submits a topic — we say thank you we will let you know if your topic is used in a dispatch article, anonymously — we review like we would any topic anyway — if we write the article we email back and say you can view your article at this link.

## Proposed flow

1. User submits a topic on PAL (existing `/dispatch` "Send a Tip" form, expanded to "Suggest a topic")
2. Auto-reply confirms: "Thanks. We review every submission like we would any topic. If we write something inspired by yours, we'll email you the link. Submission is anonymous to readers."
3. We review with the same Dispatch workflow we already use (push back, verify publicly, etc.)
4. If we write the piece: email submitter — "Your topic became this article" — with link
5. If we don't: silence (or optional "we read it but didn't pursue" acknowledgment, TBD)

## What this would solve

- **Idea scarcity.** Right now Dispatch ideas come from Winston + my pattern-matching. A submission pipeline turns Port A's ~3,000 residents + ~10,000 weekly visitors into a sourcing engine.
- **Hard-to-attack positioning.** "Our editorial comes from the community" is the strongest possible defense against any "PAL has an agenda" claim. Same idea Winston already pushed when we framed the Tourism Bureau Dispatch.
- **Reader investment.** Knowing your tip might become a piece changes how people read PAL. They start *looking* for stories instead of consuming.
- **Editorial signal.** Volume + topic clustering tells us what the community actually cares about — better signal than guessing.

## Honest tradeoffs

- **Volume → triage burden.** A working form will surface lots of low-quality / off-topic / personal-grievance submissions. Need a rhythm for processing without burning out (weekly review, batched).
- **Editorial integrity vs. submitter satisfaction.** A submission isn't an obligation. We must be willing to ignore tips that don't meet the standard (verifiable facts, defensible angle, not a personal score-settle). The auto-reply must set this expectation honestly.
- **Pure-submission vs. hybrid.** Winston's framing reads as "ALL Dispatch comes from submissions." Tradeoff: maximally community-driven, but removes our agency to break stories no one's asked for (some of the best journalism is "I noticed something nobody else has"). My recommendation: **hybrid** — submissions are one input, our own observations are another. Frame it as "many of our pieces start with a submission" not "all of them."
- **"Your article" framing.** The email saying "you can view your article" is interesting — it's technically not theirs (we wrote it, sourced it, edited it), but giving them that ownership invites distribution. Risk: someone wants to edit "their" article and we have to push back. Better framing maybe: "The piece your tip helped start went live — view it here."
- **Anonymity is real, but verification isn't optional.** Anonymous tip → we still verify before publishing per the existing Dispatch workflow. We don't run anonymous accusations as fact.
- **Time-to-response.** "We'll let you know if we use it" creates a soft contract. We owe the email when the piece ships, even if it took 6 months. Need a queue we can actually track.
- **Sensitivity scope.** Some submissions will be about real people doing real harm. We need a clear protocol for handling those — verification standards, libel concerns, when to refer the submitter elsewhere (e.g., police, attorney, specific resources).

## Open questions to resolve

1. **Pure or hybrid?** All Dispatch from submissions, or "many of our pieces start with submissions"?
2. **Optional non-acknowledgment ack?** Do we email "we read it but aren't pursuing" or stay silent on rejected tips? Silence is simpler; ack feels more respectful.
3. **Tracking infrastructure?** Vercel KV queue, simple Google Sheet, Linear-style internal board, or a custom admin page?
4. **Publish a "Submit a topic" surface beyond the existing tip form?** Dedicated `/dispatch/submit` page with bigger framing about how submissions become pieces?
5. **Show "this piece started with a community submission" badge** on pieces that did? Extra trust signal but also a small editorial-process disclosure.
6. **Cadence guardrail?** Right now we have 1 Dispatch piece. A submission pipeline that promises responses needs a publishing rate that matches the inbound volume. We may need to commit to "X Dispatch pieces per month" implicitly.

## Existing pieces this connects to

- The `/dispatch` "Send a Tip" form already exists (commit `0dd95e1`, posts to `/api/dispatch/tip`, emails `admin@` + `hello@`). The pipeline is half-built.
- The EventOrganizerClaim form pattern shipped this session is the same idea applied to events — proves the form-→-email-→-respond pattern works.

## Rough build sketch (when we decide to build)

- Extend `/api/dispatch/tip` to: (a) generate a tracking ID, (b) store the submission in a simple data store (Vercel KV or Google Sheet), (c) send the auto-reply with the tracking ID
- Add a `relatedTipId?: string` field to dispatches.ts → when we publish, mark which tip(s) the piece originated from
- On publish: trigger an email to the submitter linked by tip ID
- Optional: small admin page at `/admin/tips` for triage (Winston / Collie review queue)
- Optional: "started with a community submission" badge on Dispatch pieces with a `relatedTipId`

Total build size: ~1 day if we use a Google Sheet for the queue, ~3 days if we build a real admin panel.

---

## When we discuss

Bring this doc to the conversation. Three things to decide first:
1. Hybrid vs. pure
2. Silent rejection vs. acknowledged rejection
3. Tracking infrastructure level (sheet → KV → admin panel)

Everything else flows from those three.
