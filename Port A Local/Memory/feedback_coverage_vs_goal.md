---
name: Surface coverage-against-stated-goal every session, not just raw counts
description: When Winston sets a customer-specific goal (e.g. "2M as the beta"), report coverage % against that goal every session, not just total product / brand counts
type: feedback
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---
When Winston frames a project's goal in customer-specific terms ("use 2M as the beta," "build this for Nate's agency"), **track and report coverage against that specific customer's scope every session**, not just raw graph / product / brand totals.

**Why:** Sessions 1–15 of CrossRef optimized for graph breadth (Cooper because sitemap was clean, Acuity because Chromium recipe transferred, Current because HLI consolidation surfaced) and never once surfaced "X of 2M's 160 brands indexed" despite Winston setting 2M as the beta in session 1. I led every session with "big win / huge unlock / ready for Nate" while the real demo-readiness number (26/160 = 16%) went unmeasured. When Winston finally ran the number at session 15, the gap between my framing and the data eroded his trust in the project. His words: *"back to not trusting fucking anything about this."*

**How to apply:**

1. When Winston names a specific customer / beta target / goal, **capture it as the dashboard metric** in memory and in session notes. Not a nice-to-have — the core measure.
2. Every session, **include a coverage-against-goal line** in the session close (e.g. "2M line-card brand coverage: 32/160 (20%)"). Surface it whether it moved or not. If it didn't move, say so.
3. Distinguish **graph totals** (our 14,004 products, 72 brands) from **customer-scoped coverage** (26 of 2M's 160 brands, 5,184 SKUs on card). The first is the machine; the second is what the customer sees.
4. If ingestion targets drift from the stated goal for good reason (e.g. Cooper sitemap too good to pass up), **flag the drift explicitly** and propose when to return to the goal-aligned list.
5. For CrossRef specifically: full per-brand 2M line-card triage lives at `docs/analysis/2m-coverage-triage.md`. Every ingestion session picks from that list and updates a coverage counter.
6. Applies to future Heye Lab projects (PAL, new beta tools) — when Winston sets a specific customer goal, that number lives on the dashboard from day one.

**The pattern to avoid:** cheerleading each session's raw win ("+989 products! 72 brands!") while the stated-goal gauge sits at 16% unmeasured. Real wins are measured against the goal the user set, not the goal that's easiest to deliver against.
