# Gully — Just Gully It
_Status: Live | Priority: High | Brand: "Just Gully It"_
_Last updated: 2026-04-12_

---

## What It Is

Gully is Port A Local's search engine. It searches everything — 140+ businesses, 17 heritage stories, ~405 menu items, and enriched tags — from one search bar. It's branded as "Just Gully It" — a verb, like "Google it", but for the island.

**"Gully"** — named after a Port A local landmark. Short, memorable, ownable.

---

## What's Built (Live)

### Unified Search Index (`src/lib/gullySearch.ts`)
- Single Fuse.js instance combining businesses + heritage stories
- Searchable fields: name, tagline, tags, menuItems, description, category
- Weighted: name (3x), tagline (2x), tags (2x), menuItems (1.5x), description (1x), category (1x)
- Threshold: 0.35, min 2 characters

### Gully Page (`/gully`)
- Full search page with hero, search input, category + Open Now filters
- Mixed results grid: BusinessCards for businesses, inline story cards for heritage
- "Heritage" filter chip when story results are present
- "Just Gully It" popular chips header
- 10 popular chips including Heritage and Farley Boats

### Cmd+K Command Palette (`GullyPalette.tsx`)
- Global overlay on every page, triggered by Cmd+K, Ctrl+K, or /
- Top 8 results inline with type-aware rendering
- Recent searches (localStorage, last 5) shown above popular chips
- "Gully it..." placeholder
- Enter → opens in full Gully page

### Homepage Section
- Dedicated "Just Gully It" section after Hero
- Dark navy background with search bar
- Example queries: fish tacos, happy hour, Farley, sunset, pet friendly

### Nav Search Pill
- Rounded pill in desktop nav: search icon + "Gully it..." + ⌘K hint
- Visually distinct from nav links, reads as a search trigger

### Data Enrichment (done)
- **Tag enrichment:** 732 tag instances, avg 5.7 per business
- Standardized tags: happy hour, live music, outdoor seating, pet friendly, sunset views, full bar, breakfast, locally owned, family friendly
- **Menu items:** 38 businesses with ~405 searchable dish names
- All popular chip searches return results

---

## What's Next

### Layer 1 — Community Tag Suggestions (V1 built)
"Know This Place?" form on every listing. Anonymous, no login. Users suggest tags, Winston approves.
- Component: `src/components/KnowThisPlace.tsx`
- API: `src/app/api/suggestions/route.ts`
- Admin: `src/app/admin/suggestions/page.tsx`
- Email notifications: wired when Resend is live

### Layer 2 — Community Tagging with Gamification
- User accounts
- Verified Local badge for approved contributors
- Approval queue with admin dashboard
- Needs Supabase

### Layer 3 — AI Search (V2)
- Claude API for natural language queries
- "What's open late on a Tuesday?"
- "Best place to watch the sunset with a drink?"
- Full business database as context
- Port A Local's personality: local, honest, opinionated

---

## Key Files
- `src/lib/gullySearch.ts` — unified search index + helpers
- `src/app/gully/page.tsx` — full search page
- `src/components/GullyPalette.tsx` — Cmd+K palette
- `src/components/KnowThisPlace.tsx` — tag suggestion form
- `src/app/api/suggestions/route.ts` — suggestion API
- `src/app/admin/suggestions/page.tsx` — admin review

---

## Why "Gully"?
Port Aransas has The Gully — a local landmark. The name is rooted in Port A culture, short, memorable, and ownable. "Just Gully It" turns search into a brand moment.
