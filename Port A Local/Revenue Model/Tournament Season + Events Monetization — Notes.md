# Tournament Season + Events Monetization — Notes

**Status:** Pinned · Winston ↔ Claude conversation, NOT for Collie's plate
**Source:** Winston, 2026-04-25 session — "she is marketing and design. get people to the site using what we have built, we will figure out how to make money."
**Hard rule retained:** No paid placements anywhere on PAL editorial. This is non-negotiable.

---

## Org clarity

| Lane | Owner | Job |
|------|-------|-----|
| Trust + traffic | Collie | Marketing, design, brand voice, relationships (Foxes, Pyles, etc.) — get people to the site, make sure what they see when they arrive is right |
| Monetization + commercial | Winston + Claude | Revenue model, paid services, infrastructure that turns traffic into income — without compromising the editorial position |

Collie is shielded from monetization conversations on purpose. Her work is measured in traffic and trust, not revenue.

---

## The honest constraint

**No paid placements on editorial surfaces.** That rules out:
- Sponsored event hubs ("This page brought to you by...")
- Paid captain spotlights / featured-fish / featured-team upgrades
- Banner ads on tournament pages, history pages, Dispatch
- Pay-to-be-listed business directory
- Paid news / sponsored Dispatch pieces

If we break this, we lose the editorial position that makes the whole platform work. The "do it well, force them to come to us" strategy collapses the moment we start selling visibility.

---

## What's left — angles worth exploring

### 1. Cart-portal pattern extends naturally (highest priority — proven model)

**Premise:** Free editorial coverage feeds paid logistical services. Tournament weekends are the highest-margin lodging / dinner / cart / charter weekends of the year on the island. Tournament Season concentrates that traffic.

**What this looks like:**
- Lodging reservation engine: $X/night booking fee on rooms reserved through PAL during tournament weekends. Hotels/condos opt in; PAL takes a per-booking transaction fee (similar to /rent's $10/day cart reservation pattern).
- Charter booking engine: same model for fishing charters during DSR / Texas Legends / Pachanga weekends.
- Restaurant reservation engine: lighter version, possibly affiliate-tracked OpenTable links rather than a custom booking layer.
- Beach setup pre-booking for tournament weekends: existing /beach portal already does this; just needs marketing into the Tournament Season hub.

**Defensibility:** The cart portal already proves the model — directory listings stay free; bookings collected through PAL pay a fee; vendor fulfills. No editorial compromise.

**Build cost:** Medium. Lodging + charter portals are real builds (Stripe + Resend + vendor management). Could leverage the existing /rent infrastructure.

### 2. Paid services TO tournament orgs (not paid placements FROM them)

**Premise:** PAL becomes a small media production house for tournament organizers. Paid by the org for a service we deliver, not paid for visibility.

**What this looks like:**
- Day-of photo coverage as a service ($X/day for a photographer + same-day deliverable)
- Day-of video / social-media reels production (TikTok-ready clips)
- Live leaderboard hosting fee (currently we'd give it away; orgs without the Reel Time Apps budget could pay PAL to run it)
- Annual coverage contract: hub page maintenance, day-of coverage, recap piece, photo essay, post-event social — bundled
- Tournament-specific microsites built and hosted on PAL infra

**Defensibility:** This is paid services delivered, not paid editorial. Same as a freelance photographer charging the same org for the same coverage — except PAL controls the publishing surface.

**Build cost:** Low to start (sell what we already do). Higher if we productize.

**Risk:** Could blur editorial independence if not careful. Mitigation: separate "Tournament Services" surface from editorial; bill from a different entity (Palm Family Ventures, LLC) so the editorial side stays clean; explicit disclosure when coverage was sponsored by the org.

### 3. PAL-branded "Tournament Season" merch

**Premise:** Lean into the cultural beat we're already documenting. Sell PAL identity, not someone else's.

**What this looks like:**
- "Tournament Season" t-shirt with the four tournament names + a date stamp (annual edition)
- Hat with the Tournament Season eyebrow + lighthouse mark
- Limited-run posters (the print/qr/[slug] pattern already exists for branded prints)
- Sold via Shopify Storefront API per the existing merch decision

**Defensibility:** Pure PAL product. We don't need anyone's permission, we don't claim to represent any tournament, and the merch itself becomes free marketing on every body wearing it.

**Build cost:** Low. Shopify Storefront integration is already in the architecture decisions. Print-on-demand drops the inventory risk.

**Bonus:** Mirrors what makes TWAT merch work culturally — scarcity, in-the-know identity, supporting the cause. PAL merch could include a donation slice to a rotating local cause.

### 4. Charity-aligned partnerships (no money to PAL, but builds equity)

**Premise:** Not direct revenue, but a class of partnership that compounds trust with the organizations that matter. Treat as long-term investment.

**What this looks like:**
- "Donate to The Purple Door" button on TWAT hub (no commission, just amplification)
- "Support Boatmen Inc. scholarships" surface tied to DSR
- "Donate to Harte Research Institute" tied to Pachanga
- We get nothing direct; we earn the right to be the org that covers them deeply

**Why it matters:** Even with zero revenue from this, it positions PAL as the org that actually understands and supports the local mission. Pays off in adoption, intros, and resilience to "you're trying to make money off our event" pushback.

### 5. Tournament data licensing (long-tail, after we have years of coverage)

**Premise:** Once PAL has 3-5 years of leaderboards, photos, recaps, and editorial, that body of work is licensable to fishing media (Marlin Magazine, Sport Fishing, BD Outdoors), regional news outlets (Caller-Times, KIII), and the orgs themselves for their own retrospectives.

**What this looks like:** Standard licensing fees per use. Photo + recap packages.

**Build cost:** Zero — this only happens if we keep doing the coverage every year.

**Realistic timeline:** 3+ years out.

---

## Anti-patterns (what NOT to do)

- **Subscription / paywall** for visitor access. Kills traffic, breaks the directory ethos.
- **Affiliate links sprinkled into editorial.** Reads as ad, undermines voice. Affiliate is fine when it's a clean booking flow (like /rent), not when it's a link in a heritage article.
- **Sponsored anything labeled as editorial.** Even with disclosure, it muddies the position.
- **Selling email list / data.** Hard no. Anonymity-by-default is part of why submissions work on Dispatch.

---

## Open questions for the conversation

1. **Lodging portal** — biggest revenue lever. Hardest build. What's the right MVP? Start with a single hotel/condo partner, or batch-pitch?
2. **Tournament services** — do we offer these now (TWAT 2026 day-of coverage as paid pilot), or wait until DSR + TWAT pages drive obvious organic interest?
3. **Merch** — drop a small Tournament Season run for August 2026 as a test? Cost is small; signal value is high.
4. **Charity buttons** — would the orgs see this as helpful or as us positioning ourselves as their fundraising platform? Depends on the org. TWAT/Purple Door probably yes; DSR/Boatmen Inc. needs the conversation first.
5. **Bigger picture** — at what traffic threshold do the marquee revenue moves (lodging engine, paid services) become real? What do we need to see before committing infra build?

---

## Pin context

- Surfaces this conversation depends on are LIVE today (Tournament Season hub, DSR + TWAT full hubs, /events index restructure, Dispatch user-submission pipeline)
- The next-conversation question is "now what" — when do we start converting?
- Decision: not yet. Let coverage simmer; let the Foxes / Pyles / future organizers see what we've built; let traffic patterns emerge organically; come back to this doc when we have signal.

---

## Related

- `Revenue Model/Revenue Model.md` — broader site-level revenue model (this doc is the events-specific deep-dive)
- `Features/Tournament Coverage — Spec.md` — strategic build-it-anyway framing for tournament coverage
- `Roadmap.md` — what's queued for build
