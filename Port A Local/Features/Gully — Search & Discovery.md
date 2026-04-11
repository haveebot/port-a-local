# Gully — Search & Discovery
_Status: Concept | Priority: High | Author: Winston + Havee_

---

## The Idea

Port A Local's search today filters by name, tagline, and tags within a single category. That's a lookup tool, not a discovery tool. Gully is the upgrade — a named, personality-driven search experience that knows Port Aransas the way a local does.

**"Gully"** — a Port A Local original. Like Siri, Alexa, or Claude, but for the island. The name is a working concept — open to refinement.

---

## Three Layers (build in order)

### Layer 1 — Enriched Category Search (foundation)
What exists today searches name, tagline, and basic tags. Enriched search adds:
- Menu items / offerings (e.g. "fried shrimp", "fish tacos", "live music")
- Vibe keywords ("waterfront", "dog friendly", "late night", "cash only", "BYOB", "family friendly")
- Full business descriptions
- User-contributed tags (see Layer 3)

This alone makes the existing search bar on category pages genuinely useful for discovery.

### Layer 2 — Site-Wide Search
One search bar that searches everything — not filtered to a category. Accessible from:
- **Homepage** — prominent placement, the feature front and center
- **Nav bar** — persistent, accessible from any page

User types "live music" → gets results from Drink, Do, Eat, wherever it exists across all categories. Results show category context so user knows where they're landing.

Possible nav treatment: a search icon in the nav that expands to a full-width bar on click, or a dedicated search page at `/search`.

### Layer 3 — Gully (AI/smart search persona)
Not just a search bar — a named local knowledge assistant. Natural language queries:
- "What's open late on a Tuesday?"
- "Best place to watch the sunset with a drink?"
- "Where can I take my dog?"
- "Something cheap for the whole family"

**V1:** Can be smart keyword/tag matching with good copy — doesn't require AI. Feels intelligent through good data and good UX.
**V2:** Actual AI layer (likely Claude API) with Port A Local's full business database as context. Gully knows every listing, every tag, every community contribution.

Gully lives at `/gully` or as a modal/overlay. Has a name, maybe a small icon/avatar. Port A Local's personality.

---

## Crowdsourced Data — Community Tagging

The smartest way to enrich 138+ business profiles is to let the community do it.

### Mechanisms
- **Tag suggestions** — "Add a tag" button on every listing. User suggests a tag (free text or chip selection). Winston reviews and approves before going live.
- **"Have you been here?"** — Simple prompt on a listing page. "Tell us one thing about [Business]." Free text or multiple-choice chips (vibe selectors).
- **Verified Local badge** — Users who contribute approved tags earn a badge on their profile/contributions. Small gamification, big incentive.

### Why This Works
- Yelp, Google Maps, and Waze all scaled this way — users build the data
- Port A Local stays curated — nothing goes live without approval, keeping quality high
- Out-of-towners and fake reviews are filtered by the vetting layer
- Feeds directly into Gully — more community data = smarter search

### Data review flow (simple v1)
Suggested tags land in an admin queue → Winston approves/rejects → approved tags go live on the listing and into search index immediately.

---

## Why "Gully"?
Port Aransas has The Gully — a beloved local landmark and gathering spot. A name rooted in Port A culture, short, memorable, and ownable. Open to other Port A-rooted names if something better surfaces.

---

## Build Order
1. Enrich business data (tags, descriptions, offerings) — manual first pass
2. Upgrade category search to use enriched data
3. Build site-wide search (`/search` or nav expansion)
4. Launch crowdsourced tagging (community enrichment)
5. Brand the experience as Gully, refine UX
6. Add AI layer (Claude API) for natural language queries

---
_Last updated: 2026-04-10_
