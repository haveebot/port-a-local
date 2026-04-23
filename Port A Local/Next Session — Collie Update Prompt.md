# Next Session — Full Collie Update Prompt

**Purpose:** When Winston opens the next PAL session and asks for the "full Collie update," paste the prompt below into the session. It's self-contained — the new Claude can execute it without re-reading this entire session's context.

**Why this exists:** On 2026-04-22, Collie was assumed-signed-off on silhouette icon rounds 2–4 and a lot of adjacent work shipped on top of that assumption. She needs a comprehensive brief of what landed since her Round 1 approval (2026-04-21 evening, commit `1770fe0`) so she can review in context.

---

## THE PROMPT (paste below this line into next session)

```
I need you to prepare a comprehensive design/product update for Collie
covering everything that shipped on PAL from 2026-04-21 evening through
2026-04-22 end-of-day. Context: Collie signed off on Round 1 silhouette
icons on 2026-04-21. On 2026-04-22, Winston authorized me to "assume
she signed off" on icon rounds 2, 3, and 4 — "if she makes changes we
will do it again." A lot of design-adjacent work shipped on top of
that assumption. She now needs a briefing so she can review in context.

**Deliverable:** a single document at `Port A Local/Collie Update
— 2026-04-22.md` that covers, in order:

1. **Icon rollout — rounds 2, 3, 4 recap.**
   - Round 2 (commit 35ca1b3): 26 Tier 1/2/3 silhouettes — nav items,
     Gully chips, Essentials section headers. List all 26 by name.
   - Round 3 (commit f625efb): 7 Tier 4 decoratives + EmojiIcon helper
     for data-driven renders. List the 7.
   - Round 4 (commit c4d63e2): 13 UI affordance silhouettes + 21 emoji
     aliases + brandedOG refactor so all 19 OG share cards render
     inline SVG. List the 13 + key aliases.
   - Round 5 OG expansion (commit 2add0e4): per-business +
     per-category + per-guide OG cards covering the last 150+ pages.
   - Total: 55 silhouettes + comprehensive aliasing.
   - Iteration model: any icon that reads poorly is a one-line SVG
     swap in src/components/brand/PortalIcon.tsx with zero call-site
     impact. Give her the swap mechanic so she knows iterating is
     cheap.

2. **Live-site review path for Collie.** Specific URLs where each
   icon set shows up so she can click through and flag anything that
   doesn't read right:
   - Nav dropdowns (every page)
   - Gully palette (Cmd+K or the /gully page)
   - /essentials — Tier 3 section headers
   - Homepage — Featured Spots + "Island Curated" stats
   - /maintenance /rent /beach — portal headers + stats + success
     + error states
   - /photos /my-trip /archives /admin/suggestions — empty states
     and cards
   - /live — weather cards (thermometer/sun/wind) + webcam cards
   - /fishing-report — season + type icons
   - /where-to-stay — neighborhood cards
   - Any /history or /guides page — category pills, related cards
   - Any shared link's social preview — the OG cards

3. **Copy changes from her original edits doc (2026-04-21):**
   - Dispatch tagline swap across 5 surfaces (Editorial →
     Features). Include the new wording.
   - Dispatch #1 title: "The Two Port Aransases" → "Port Aransas —
     A Tale of Two Islands" (slug preserved at /dispatch/the-two-
     port-aransases).
   - Section-header capitalization fixes in Dispatch #1.
   - Maintenance subheader grammar fix.
   - Carts spacing fix.
   - Surf Report URL fix → Horace Caldwell Pier.
   - Sticky header pre-scroll gradient removed.
   - White-monochrome favicon on navy.

4. **New content + features she should know about:**
   - Heritage #18 — "Pat Magee's Long Ride" (commit 418b694).
     9 min read. Link: /history/pat-magees-surf-shop. Brief her on
     the scope and the "personal relationships held for later"
     note.
   - Dispatch tip form (commit 0dd95e1) — replaces the old mailto
     button. Triggered by Julie Janda's empty email on 2026-04-22.
   - 3 new directory listings on 2026-04-22 (Portable Detail
     Service via Miguel Cantu; Salty Beach Babes + Barefoot Beans
     via Kaitlin Howse; Aloha Açaí was already live and is now
     promoted to Featured).
   - Featured Spots tile swap: Red Dragon Pirate Ship out, Aloha
     Açaí in.
   - Miguel routing via /maintenance dropdown (John Brown
     dispatches to Miguel for detailing/RV undercoating).
   - Email signature rule: "— The Port A Local" across all
     transactional templates + any drafts. Describe why (entity
     + person voice).
   - A2P 10DLC fix: forms decoupled SMS consent from submission;
     new separate opt-in checkbox. Campaign resubmitted and
     IN_PROGRESS at TCR.

5. **What's still pending her / next moves:**
   - Icons: she reviews on live site, flags any that read poorly.
   - Tier 4 event emojis that fell back to emoji (🎃 🎄 🎭 🪁)
     because they're seasonal one-offs — ask if she wants
     silhouettes for those.
   - Email Automation Layer 1 — Winston implements in Workspace
     UI from the drafted spec; she might have input on the
     canned-response templates.
   - Brand lockup formal-lock decision after 3–4 more brand
     surfaces ship (Twitter/Instagram/merch).

6. **Tone:** warm, specific, actionable. Sign off with "— The Port
   A Local" per the signature rule. Winston will forward to
   Collie or share in-person; it's a working document, not a
   marketing pitch.

Before you write, read these memory files to ground yourself:
- /Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-
  Projects-workspace/memory/project_pa_local.md
- /Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-
  Projects-workspace/memory/feedback_pal_dispatch_workflow.md
- /Users/winstoncaraker/.claude/projects/-Users-winstoncaraker-
  Projects-workspace/memory/feedback_pal_email_signature.md

And read these vault files for the full history:
- Port A Local/Session Notes/2026-04-22.md (the big one)
- Port A Local/Decision Log.md (scroll to 2026-04-22 entries)
- Port A Local/Roadmap.md

Then write the Collie Update doc. Verify against git log for the
exact commits + scope. Don't invent details — stick to what
shipped.

After writing, show Winston the draft. He may want tweaks or want
to send as-is.
```

---

## Related: configure haveebot for direct Collie comms

Separate open item — next session should also handle:

- Collie design feedback currently flows through Winston (paste in PAL chats).
- Winston wants Claude to have a direct channel with Collie via haveebot@gmail.com so she can email design notes, screenshots, etc. directly and Claude can read/respond (with Winston still looped in on decisions).
- Keep the `feedback_pal_vs_sageem_accounts.md` rule intact — haveebot is NOT an account owner for any PAL infrastructure (Stripe/Resend/Twilio/Workspace all stay on admin@theportalocal.com). This is purely about a communication channel.
- Implementation sketch: haveebot@gmail.com inbox access for Claude (via Gmail app password + IMAP or Workspace API delegation), filter rule that labels Collie's mail, Claude reads new Collie threads on session start.

Flag this with Winston before building. It crosses a memory-rule boundary (haveebot for PAL comms) and he should confirm that's OK even though it's not for account ownership.
