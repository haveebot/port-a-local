---
name: Heye Lab — Nick Merrill's umbrella infrastructure company
description: Parent platform-company for CrossRef + PAL beta projects; Nick is building an internal datacenter to self-host
type: project
originSessionId: d5d877ac-231f-4032-ad5d-6942700a594d
---
Heye Lab is **Nick Merrill's** umbrella corporation — the platform-company layer under which Winston's projects live. Nick is Zack Merrill's brother (distinct from 2M's Nate Nichols). Nick does NOT own Sage Em (Zack does); his role with Winston is tech co-builder.

**What Heye Lab is:**
- The infrastructure / platform-company layer. CrossRef (formerly Xwalk) and Port A Local (PAL) are Heye Lab **beta projects**.
- Nick is building a "datacenter" ("the lab") to self-host services internally.
- Nick has "a couple brewing too" — more Heye Lab projects incoming.

**Public framing:** `CrossRef — Powered by Heye Lab` (tagline pattern; expect similar on other beta projects).

**Why:** Learned 2026-04-22 during the Xwalk → CrossRef rename discussion. The existing account-structure memory didn't reflect a platform-company layer — Heye Lab is that layer, and it reshapes how the projects present publicly and host technically.

**How to apply:**
- When branding CrossRef or PAL public surfaces, include "Powered by Heye Lab" framing where it fits naturally (footer, about page, meta).
- When Winston says "Nick," that's Nick Merrill / Heye Lab — not anyone from Sage or 2M.
- Architectural note: services on Vercel today may eventually migrate to Heye Lab self-hosted infra. Build with portability in mind; don't over-engineer for migration until the datacenter is real.
- When account-structure takes shape under Heye Lab, update `project_account_structure.md` to reflect the three-layer model: Winston (owner) → Heye Lab (platform) → CrossRef / PAL / future beta projects (tenants).
