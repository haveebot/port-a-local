# Tournament Coverage — Spec

**Anchor target:** 2026 Deep Sea Roundup · July 9–12, 2026
**Strategy:** Build coverage so good the org has no choice but to come to us.
**Templates to:** TWAT (Aug), Texas Legends Billfish (early Aug), and any future Port A tournament.

---

## Strategic frame

We are *not* asking permission. We are not running an outreach packet. We are a local website covering a public event from public information — same as any news outlet. The org's options after we ship become:

1. **Engage** — collaborate on photos, divisions, captain bios, history
2. **Ask** — for changes, embeds, link-backs, or co-promotion
3. **Pay** — for something specific (we will likely decline cash; see "no paid placements")
4. **Try to stop us** — and discover that public coverage of public events is journalism

We make option 4 untenable by being so well-executed that any pushback would look bad on them.

## Why Deep Sea Roundup is the framework anchor

1. **Heritage already published.** Heritage piece #11 ("Texas's Oldest Fishing Tournament") covers the 1932 Tarpon Rodeo → DSR lineage. Editorial spine in place.
2. **Farley family lineage.** The Farley family (Collie's family) is woven into the Tarpon Era foundation. The tournament's origin story has personal meaning we don't need to manufacture.
3. **Untold sub-stories.** Piggy Perch (kids' division), Calcutta side bets, the divisions most visitors never hear about, the legacy captains.
4. **Money + lifestyle angle.** Multi-million-dollar yachts, multi-million-dollar fish, the people who live that life. The "Succession on the water" story almost no one tells well.
5. **Texas's oldest tournament since 1932** — historic gravity gives us a defensible reason to cover it deeply.

---

## Page architecture

`/events/deep-sea-roundup-2026` — uses the existing `/events/[slug]` hub pattern. New tournament-specific sections layer on top.

### Reuse from KiteFest hub (zero new build)
- Hero with live countdown
- Schedule timeline
- Good-to-know grid (parking, ferry, harbor access)
- FAQ
- Host card (linking to DSR's official site, plus our /history/oldest-tournament page)
- Photo submission CTA
- Day-of liveblog scaffold (`liveLog`)
- Source citations

### NEW sections specific to tournaments
1. **Divisions & Calcutta panel** — collapsible breakdown of each division (Bay, Surf, Offshore, Fly, Kayak, Junior, Piggy Perch) plus Calcutta side-bet rules
2. **Live leaderboard** (per division) — rank, angler, boat, species, weight, time. New `LeaderboardTable` component.
3. **Weigh-in liveblog** — extends existing `liveLog` with `kind: "weigh-in"` entries that show angler, boat, species, weight, photo
4. **Captain spotlights** ("Boats to watch") — pre-event card per featured captain; becomes "performance panel" mid-tournament
5. **Piggy Perch panel** — kids' division gets its own subsection. The human story the org under-promotes.
6. **Post-event photo essay** — magazine-style mosaic for the lifestyle/yacht/big-money recap

---

## NEW infrastructure to build (templates for all future tournaments)

### 1. `src/data/tournament-results.ts`
Per-tournament data layer. Manual entry initially.

```ts
interface Division {
  slug: string;
  name: string;        // "Offshore", "Junior Bay", etc.
  description: string;
  rules?: string;
  prize?: string;
}

interface LeaderboardEntry {
  rank: number;
  angler: string;
  boat?: string;
  species: string;
  weight?: string;     // "84.6 lbs"
  length?: string;     // tarpon and billfish are sometimes length-only
  time?: string;       // ISO of catch/weigh-in
  photo?: string;      // public/tournament/<slug>/<filename>.jpg
  notes?: string;
}

interface CaptainSpotlight {
  name: string;
  boat: string;
  homePort?: string;
  divisionsEntered: string[];
  bio: string;
  priorWins?: string[];
  photo?: string;
}

interface TournamentResults {
  eventSlug: string;             // "deep-sea-roundup-2026"
  divisions: Division[];
  leaderboards: Record<string, LeaderboardEntry[]>; // keyed by division slug
  captains: CaptainSpotlight[];
}
```

### 2. `LeaderboardTable.tsx` component
Renders one division's leaderboard. Mobile-friendly. Shows top 5 by default with "show all" expand. Last-updated timestamp at the top.

### 3. Extend `EventLogEntry` with `kind: "weigh-in"`
Already supports `kind` — just add the new value and a renderer that shows angler+boat+species+weight+photo as a richer card. Keeps the liveblog component reusable.

### 4. `CaptainSpotlight.tsx` component
Card rendering: photo, name, boat, home port, divisions, bio, prior wins. Pre-event content. Stays useful through the tournament.

### 5. `PhotoEssayMosaic.tsx` layout
Magazine-style — 1 hero photo, then asymmetric 2-3 col mosaic with captions. For the post-event recap.

### 6. `DivisionsPanel.tsx` component
Collapsible accordion of all divisions with rules and prize info. Static, but high information density.

---

## Editorial layer (the differentiator)

### Heritage piece — already shipped
Heritage #11 covers the lineage. No rewrite needed. The DSR page links here prominently as the "why this matters" anchor.

### Dispatch piece — NEW: "The Million-Dollar Game"
Working title. Investigative/lifestyle angle on the money behind a billfish tournament:
- Yachts in the harbor in tournament week, public dock photos, ballpark costs
- Calcutta purses (public), official prize purses (public)
- The economic ripple — fuel, charters, hotels, restaurants, crew
- The lifestyle: who fishes these tournaments, what their week looks like, where the wealth comes from
- Defensible because everything is public-record or observable from the docks
- This is the piece Winston flagged as the universal hook — people are fascinated by big-money stakes

**Sources to line up before writing:** Texas Triple Crown purse data, Calcutta posting from prior years, fuel/dock receipts (public), Coast Guard documentation lookups for visiting yachts (public registry), 2-3 captain interviews (warm intros via Collie's family network).

### Photo essay — post-event
"DSR 2026: The Boats, The Fish, The People." Pure visual storytelling, magazine layout. Submitted via the photo CTA we already built; curated by Collie.

### Heritage piece expansion candidate (not blocking)
"The Piggy Perch Origin" — when Heritage backlog opens up, the kids' division sub-story is its own piece.

---

## Day-of staffing (the honest constraint)

KiteFest is one day of light coverage. DSR is 4 days of intense coverage with multi-division leaderboards. Real labor investment.

### Minimum viable
- **At the docks:** 1 person with a phone during weigh-in windows (~5–8 PM each day). Photos + time + angler + species + weight. Texts to a dedicated number.
- **Processing on PAL:** 1 person at a laptop entering data into `tournament-results.ts`, posting to liveblog, uploading photos. ~1 hour per evening, can be remote.
- **Total:** 4 days, ~3 hrs/day at peak. ~12 hours total of focused work.

### Who
- Winston/Collie at the docks (they're already there for SandFest crowds and would be at DSR anyway)
- Claude on PAL doing the data entry / page updates / liveblog posting

### What gets us in trouble
- Misreporting weights or rankings — has to match the official board. We cite the official board, mark our updates "unofficial — pending official posting," and update when the board posts.
- Photographing without permission — public docks are fine, private boats are not. Stay on the public side of the rope.

---

## The "no permission, do it anyway" defense

Pre-emptive answers to the inevitable pushback:

| Question | Answer |
|----------|--------|
| "You can't post our leaderboard." | Tournament results are public information posted at a public weigh-in. We cite the official board. |
| "You can't use our name." | Editorial use of an event name is protected. We are a local outlet covering a public event. |
| "You can't be on the docks." | Public docks. We're not interfering with weigh-in operations. |
| "You're stealing our coverage." | We're adding coverage that didn't exist. Anyone who clicks our page also sees a link to the official site. |
| "We want a cut." | We don't take or pay sponsorship money on PAL. No-paid-placements is a hard rule. |

What we say YES to without hesitation:
- Linking to their official site, registration page, sponsor list
- Embedding our leaderboard in their site (we'd actually love this)
- Getting a captain interview from them
- Crediting their official photographer when we use their photos
- Pulling something down if it's factually wrong (with corrections shown)

---

## Build sequence (May–June)

| Week | Work |
|------|------|
| Week of Apr 27 | `tournament-results.ts` data layer + `LeaderboardTable` component |
| Week of May 4 | Extend `liveLog` for weigh-ins; `CaptainSpotlight` component |
| Week of May 11 | DSR page goes live in pre-event mode (schedule, divisions, history, captains TBD) |
| Week of May 18 | Dispatch "Million-Dollar Game" research; first captain spotlights filled |
| Week of May 25 | `PhotoEssayMosaic` layout (used for post-event); refine pre-event page |
| Week of June 1 | All captain spotlights filled; "boats to watch" published; pre-event SEO push |
| Week of June 8 | Dispatch "Million-Dollar Game" published — gets the page in front of audiences pre-tournament |
| Week of June 15–July 5 | Soft promo, live-music page cross-links, fishing-report page hooks |
| **July 9–12** | **Live coverage runs** — leaderboards, weigh-in liveblog, photo stream |
| July 13–17 | Recap content, photo essay, post-event Dispatch (winners + lifestyle) |

---

## Templating to TWAT + Texas Legends

Once DSR is built:
- `tournament-results.ts` adds `twat-2026` and `texas-legends-billfish-2026` entries
- `events.ts` adds two new entries with their slugs + ISO dates
- `event-content.ts` adds two new content entries (divisions, history, captains)
- The components (LeaderboardTable, WeighInEntry, CaptainSpotlight, PhotoEssayMosaic) all reuse
- Per-tournament work shrinks to filling in divisions, captain bios, and historical context. ~80% reuse.

**TWAT-specific angle:** all-women billfish format. Lean into personalities and the women's-only twist. Captain spotlights become particularly editorial.
**Texas Legends-specific angle:** Triple Crown leg, money + serious. Lean into the leaderboard and purse drama.

---

## Where Collie comes in

- **Heritage co-write** if she wants — Farley family lineage gives her natural authority on the origin-story angle
- **Photo curation** post-event — magazine-style mosaic needs her eye
- **Captain spotlights** — voice tuning so they read editorial, not promotional
- **Family-network intros** to captains for interviews (warm intros beat cold reach)

---

## Decision needed from Winston

Before building, sanity-check:

1. **Confirm the build sequence** — May 11 going-live target reasonable? Any reason to push earlier or later?
2. **Captain interview path** — go through Collie's family network, or go direct via published contacts? Both work; just pick.
3. **Day-of staffing** — confirm Winston/Collie can be at the docks Thursday–Sunday evenings July 9–12, or do we need to plan for proxy coverage?
4. **Dispatch tone on "Million-Dollar Game"** — celebrate the spectacle (Robb Report energy) or interrogate the spectacle (NYT Magazine energy)? Both work, different positioning.
5. **Should I pre-build the `tournament-results.ts` + `LeaderboardTable` infrastructure now while it's in my head?** Cheap to get the bones in place — content can fill in later.
