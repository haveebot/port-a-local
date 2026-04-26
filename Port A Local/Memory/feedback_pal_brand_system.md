---
name: PAL brand system — voice, icons, lighthouse, emoji exceptions
description: Collie-authoritative rules for anything created in Port A Local's name. Point to /brand as source of truth.
type: feedback
originSessionId: 02fa516d-c6bf-42c6-b1e3-727a1cb3e023
---
**Rule:** When creating anything in PAL's name (copy, social posts, icons, logos, UI, email drafts), defer to Collie's authored rules. The `/brand` page at theportalocal.com/brand is the machine-readable source of truth — colors, taglines, icon library, typography, voice samples are all there.

**Why:** Collie is the designer + marketing lead. She authored these rules in her 2026-04-24 email (uid 156). Winston's directive has been "I love whatever she loves" — so ambiguity resolves in her favor. The `/brand` page was built to prevent re-litigation: instead of asking "what's our navy?" or "is this tagline on-brand?", the answer is the URL.

**How to apply:**

**Voice** (non-negotiable):
- Sound like: a knowledgeable local giving recommendations · a clean, well-designed tool · a curated guide built on real experience
- Do NOT sound like: a tourism board · a travel blog · a corporate directory
- Writing style: short, clear, minimal fluff, no hype, no exaggerated claims, no sales tone
- No ALL CAPS (except wordmarks PORT A LOCAL). No exclamation spam. No "amazing / must-see / incredible / MUST-TRY."

**Icons** (Collie's system):
- Style: simple coastal editorial line icons — minimal, clean, slightly friendly
- 24px legibility floor
- One color per use: navy on light backgrounds · coral on navy backgrounds · white only when needed on dark surfaces
- No gradients, shadows, outlines, or effects
- Maintain original proportions and spacing

**Emoji exceptions (LOCKED 2026-04-24, explicit Collie sign-off):**
- SMS text bodies stay emoji (plain-text channel, no SVG possible)
- Seasonal one-offs on /events (🎃🎄🎭🪁) stay emoji (rotating content, not worth dedicated silhouettes)
- Email subject lines stay emoji (HTML SVG in email clients is a minefield)
- Do NOT re-ask about these exceptions. They are settled.

**Colors (from /brand):**
- Primary: `#0b1120` (navy-950), `#111d35` (navy-900), `#e8656f` (coral-500), `#f08589` (coral-400)
- Supporting (use sparingly, max one per composition): `#faf8f4` (sand-50), `#f5f0e6` (sand-100), `#d4a843` (gold-500), `#0aa5ea` (ocean-500), `#10b981` (seafoam-500)
- Navy + coral do the heavy lifting; sand is the canvas

**Typography:**
- Display: Playfair Display (serif) — headlines, hero copy, editorial titles
- Body: Inter (sans-serif) — body text, buttons, nav, micro-copy
- Both free from Google Fonts. CSS vars: `--font-display`, `--font-sans`.

**Lighthouse mark:**
- Canonical as of 2026-04-24 (Collie's Illustrator design). Replaced prior Lydia Ann rendering.
- Component: `src/components/brand/LighthouseMark.tsx`
- 4 detail levels (`full` / `standard` / `simple` / `icon`) — step up when there's room, step down when there's not
- 3 variants (`dark` / `light` / `coral`) — dark = navy on light bg, light = sand on dark bg, coral = accent

**Sign-off on all PAL emails:** `— The Port A Local` (em-dash + capital T/P/L). See `feedback_pal_email_signature.md`.

**When Collie sends new brand assets:** See `feedback_pal_photo_to_feature.md` for the workflow.

**When making a brand-level decision (icon, color, tagline, voice):** Check /brand first. If the answer's there, apply it. If it's not there, flag to Winston + Collie before deciding.
