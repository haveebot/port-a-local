# Project Overview

## What Is It?
Port A Local is a local-first directory + editorial platform for Port Aransas, TX. Started as a curated business directory replacing word-of-mouth; grown into a publishing platform that covers local heritage, current events, and the cultural fixtures (festivals, tournaments) that the rest of the internet doesn't cover well.

## The Problem
Port Aransas is one of the most beloved beach towns on the Texas coast, but everything PA — the businesses, the festivals, the world-class fishing tournaments, the heritage — is covered shallowly elsewhere. Tourism Bureau marketing and one-page Facebook events. No single trusted source for either local business discovery or local storytelling.

## The Solution
Three layers, one platform:
1. **Directory** — clean, fast, mobile-friendly, every listing locally vetted, no paid placements, no algorithms.
2. **Heritage + Dispatch** — long-form editorial covering preserved local history (Heritage) and current-events analysis (Dispatch). The publishing surface no other PA site has.
3. **Event hubs** — per-event pages that go deeper than the org's own site (DSR, TWAT, KiteFest), plus a Tournament Season cluster page. Built first, asked permission later.

## Categories (9)
Eat · Drink · Stay · Do · Fish · Beach · Shop · Realty · Services

## The Team
- **Winston** — product manager, local knowledge, business relationships, monetization decisions
- **Collie** — co-designer, marketing, brand voice, organizer relationships (Foxes, Pyles, etc.). Lane: trust + traffic. Shielded from monetization decisions on purpose.
- **Billy Gaskins** — owner of Woody's Last Stand, island legend, family friend 🔑
- **Nick** — engineer (nickbmerrill-collab), possible investor
- **Havee (me)** — research, specs, code, content, infrastructure. Lane: build + maintain.

## Key Rules
- Single-word category names only
- No PUD businesses (Cinnamon Shore, Palmilla, Sunflower Beach, etc.)
- Exception: Lisabella's (personal relationship) ✅
- 🔑 = affiliate/owner relationship = priority lead routing
- Multi-category businesses get listed under every applicable category

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Design:** Palm Republic — navy + coral sunset aesthetic
- **Deploy:** Vercel (auto-deploy on push to main)
- **Repo:** haveebot/port-a-local (GitHub)

## Revenue Model
→ See [[Revenue Model/Revenue Model]] (broad)
→ See [[Revenue Model/Tournament Season + Events Monetization — Notes]] (events-specific, pinned for Winston ↔ Claude conversation)

## Editorial Strategy (live)
- **No paid placements anywhere on editorial.** Hard rule.
- **Build first, ask permission second.** For event hubs, heritage pieces, and tournament coverage, the page IS the pitch. Once orgs see the depth relative to what exists elsewhere (their .org sites + Facebook), the conversation turns from "can you" to "let's collaborate."
- **Tournament coverage as the events wedge.** The infrastructure templates per-tournament; the editorial position is unique to PAL on this island.
- **Hybrid Dispatch.** Topic submissions from readers feed the editorial pipeline; we still write our own pieces. Submissions are silent (no reply, no trace).
- **Charity-engine events.** TWAT-style events where a beneficiary IS the engine get a dedicated `CharityCallout` rendered prominently after the lede.
