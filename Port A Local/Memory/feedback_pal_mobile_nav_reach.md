---
name: PAL mobile nav — verify reach when adding menu items
description: Mobile nav drawer was unreachable below the fold for months due to 100vh vs visible viewport mismatch; always test on real mobile after touching Navigation.tsx
type: feedback
originSessionId: f632ff08-e828-4b24-93c4-8aa50ebe4ceb
---
When adding entries to PAL's mobile nav drawer (`src/components/Navigation.tsx`), test on a real mobile browser (iOS Safari + Chrome Android) — don't trust desktop devtools "responsive mode."

**Why:** A long-standing bug had the drawer using `max-h-[calc(100vh-4.5rem)]` which on mobile Chrome resolves to the *full* viewport (address bar hidden). The drawer extended past the visible fold, so the bottom half of the menu was physically unreachable. Items affected included Island Pulse, Map, Photos, Saved Spots, Beach Rentals, Rent a Cart, Maintenance — basically everything below Essentials. Winston discovered it 2026-04-25 only when the new Delivery / Drive-for-PAL items also fell into the dead zone. Fixed with `100dvh` (dynamic viewport height).

**How to apply:**
- After any Navigation.tsx change that adds or reorders mobile drawer items, ask Winston to spot-check on his Chrome app
- The drawer must use `100dvh` (or `100svh`) — never `100vh` — for any height/max-height calc on mobile
- If we add 5+ more menu items, consider grouping into collapsible sections rather than a single long scroll
- Same lesson applies to any future fixed-position overlays on mobile (modals, drawers, sheets)
