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

**The lab is real and GPU-capable** (locked 2026-04-27, Winston):
- Nick is **running QWEN models natively on his rig in the lab** — Alibaba's open-source LLM family. That means the hardware is GPU-rich enough to host real model inference workloads, not just web services.
- This is significant: the lab's capability ceiling is much higher than "container host for Next.js apps." It's a bare-metal AI/compute platform.

**The Heye Lab operating mindset: "max it and find out" — same on both sides** (locked 2026-04-27, Winston):
- **There is NO planned migration from Vercel to the lab.** Don't think point-A-to-point-B.
- **Both sides build to limit independently.** Nick maxes the platform (lab capability + native model hosting + capacity testing). Winston + Claude max the products (CrossRef graph density / Compare / materials / curated layer; PAL features / nav / business onboarding).
- **Intersection happens organically when both are mature enough.** The day CrossRef is feature-complete enough to need different infra AND the lab is stable enough to host it, they meet. Until then, keep shipping both.
- This is the same posture Winston applies to product builds (V1 at V3 altitude, ship into use, let use shape the next move). Apply it to platform too.

**Implicit long-term direction: AI features without per-query API cost.**
- CrossRef has surfaces that would benefit from real LLM-backed inference: "Describe what you need" mode (currently trigram + heuristic), an LFS-import endpoint that parses engineer spec sheets, semantic search across the graph, automated industry-pair authoring suggestions.
- All of those today would require OpenAI / Anthropic API calls = per-query billing.
- With QWEN running natively in Nick's lab, those features can eventually run **for free at the per-call level** (only hardware cost, which is fixed). The AI workloads collapse from variable cost to fixed cost.
- This is the real long-term Heye Lab vision — own the model infra so the products lean on AI without the meter running.

**Operational consequence today: cost decisions on Vercel stand alone.**
- Vercel spend cap, crawl-delay, observability sampling — all the right moves regardless of lab timing.
- "Don't optimize Vercel because we'll migrate" is the wrong frame. The migration isn't planned; it's emergent. Optimize today as if Vercel is permanent.
- Build with portability in mind (no Vercel-specific lock-in beyond the build / ISR conventions) — this stays true.

**The flagship product: CityDeploy** (locked in 2026-04-26, Winston):
- Working name **"CityDeploy"** (a.k.a. "City Deployment") for the SaaS-ified PAL platform — sold to other towns. PAL is the proof-of-concept; CityDeploy is the engine that gets templated and deployed per city.
- Tagline pattern: "Powered by Heye Lab · Built on CityDeploy"
- The platform extraction Nick is mining for: same Next.js + Postgres + Stripe Connect + cookie-session + email/SMS comms + admin dashboards stack, configurable per town.
- Memory mirror at `port-a-local/Port A Local/Memory/` is the working ground for pattern extraction — CityDeploy gets seeded from PAL's hard-won decisions.

**Public framing:** `CrossRef — Powered by Heye Lab` (tagline pattern; expect similar on other beta projects).

**Why:** Learned 2026-04-22 during the Xwalk → CrossRef rename discussion. The existing account-structure memory didn't reflect a platform-company layer — Heye Lab is that layer, and it reshapes how the projects present publicly and host technically.

**How to apply:**
- When branding CrossRef or PAL public surfaces, include "Powered by Heye Lab" framing where it fits naturally (footer, about page, meta).
- When Winston says "Nick," that's Nick Merrill / Heye Lab — not anyone from Sage or 2M.
- **Don't propose Vercel→Heye-Lab migrations unprompted.** There's no plan; both sides build to limit. Treat Vercel as permanent infra for cost decisions today.
- **Build with portability in mind** (no Vercel-specific lock-in beyond standard build / ISR conventions). Keeps the org option open for whenever both sides are ready.
- **AI feature ideas should note "could land natively on Heye Lab eventually."** Don't gate them on lab timing — but flag the cost-collapse-from-variable-to-fixed trajectory in the memory + decision log when the idea touches LLM-backed surfaces (semantic search, LFS-import, auto-pair authoring, etc.).
- When account-structure takes shape under Heye Lab, update `project_account_structure.md` to reflect the three-layer model: Winston (owner) → Heye Lab (platform) → CrossRef / PAL / future beta projects (tenants).
