---
name: Customer-pulls-the-platform signal
description: When a customer asks for a portal/dashboard/login that doesn't yet exist, that IS the product-market-fit signal. Build against it immediately. Origin — Travis L&EA, 2026-04-30. Cross-project rule.
type: feedback
originSessionId: 2026-04-30-pm-lea-portal-pull
---

Cross-project rule for HeyeDeploy and Sage / CrossRef / PAL / future tenants.

## The signal

Travis D'Amico, Principal at Lighting & Electrical Associates (Sage's first executed agency, signed 2026-04-30), replied to Sage's contract execution:

> I'm good. Please just send the log in info for the portal when it's ready.

There was no portal. The mention had been a passing line in Winston's recovery email: *"Everything will be available in your agency portal soon."* Travis took that as a real promise and asked for it.

**This is the product-market-fit signal in its purest form.** When a customer asks for an artifact you mentioned-but-haven't-built — login info, a dashboard, a portal, an API endpoint — they're telling you what to build next. That's not a deflection. That's not vaporware leakage. That's the customer pulling the platform.

## How to apply

1. **Treat it as the next-build-block source-of-truth.** When a customer asks for an interface that doesn't exist, that interface immediately becomes the next priority — ahead of internal-only features, ahead of speculative roadmap items.

2. **Block-by-block scope it real-time.** Don't over-engineer. Travis wants login + portal access. Block 1: schema + auth. Block 2: the portal route with their data. Block 3: send him the link. Iterate from there based on what he uses + asks for next.

3. **Capture the signal in HQ activity_events.** When a customer pulls, log it. The HQ event for L&EA stamped `metadata.portalRequested: true` and that field is searchable for future "who's pulled for portal access?" queries.

4. **Don't promise specific timelines.** Travis didn't ask "when?" — he asked for the artifact. Ship it when it's ready and surface to him; don't pre-commit a date.

## Why this matters cross-project

- **Sage HQ → agency portal** (this rule's origin) — Travis pulled, build now
- **PAL → resident portal / contributor portal** — when residents start asking how to manage their own listings/posts/profile, that's the pull
- **CrossRef → user dashboard** — when a specifier asks "do you have a saved-searches view?" or "can I export my project history?" — they're pulling
- **Heye Lab future tenants** — same pattern: every tenant of a HeyeDeploy SaaS gets a customer-facing surface, and the customer's first ask for that surface (whatever they call it) is the green light

## What's NOT a customer pull

- A casual "wouldn't it be nice if..." comment in a meeting (often deflection)
- A request to add a feature that's already covered by an existing surface (it's a discoverability problem)
- Asking how to use a feature that already exists (it's a documentation problem)

The pull-signal is specifically **customer asks for a thing that doesn't exist as if it does**. That's the moment.

## Cross-reference

- Sage HQ Step 2 spec: [`Strategy/Sage HQ Step 2 — Spec from 2026-04-28 PM Email.md`](../../../Projects/workspace/sage-em/sage/Sage Em/Strategy/Sage HQ Step 2 — Spec from 2026-04-28 PM Email.md)
- L&EA execution + Travis pull: `Session Notes/2026-04-30.md`
- HQ activity event: row `2ad8e2a6-fc9b-4969-bf3a-aa25862f08c6` in `activity_events` (lea-louisiana)
- Standard Agency Intro Email Template (which planted the portal mention): vault `Strategy/Standard Agency Intro Email Template.md`
