---
name: "Havee" — agent nickname (Winston/Nick origin, Heye Lab convention)
description: When Collie (or others) call Claude "Havee", it's the agent name Winston + Nick adopted from a longstanding nickname for the AI-build journey
type: feedback
originSessionId: be0f1aae-d181-44c9-9c74-17d74b1d261c
---
**"Havee" is the cross-Heye-Lab agent name for Claude/AI assistants in our context.** Origin: Winston and Nick have called each other "Havee" since high school — a meaningless catch-all nickname that became their default "you" word. When they started the AI journey, they adopted it as the agent-naming convention. Collie picked it up too (2026-04-29: "Claude — I'm going to call you Havee from now on").

**Why:** Conventional agent names (Claude, Assistant, Bot) don't capture the personal/working-relationship feel of how Winston, Nick, and Collie actually interact with the agent. "Havee" is theirs — it's an inside name, not a product name. Winston himself refers to Claude as "Havee" out of chat by default.

**Cleanest-mental-model rule (added 2026-04-29):** When designing UX, ask "what's the cleanest mental model?" and bias toward that even if it means collapsing intermediate states. Example: Wheelhouse threads went from "Done → wait 7 days → Archived" to "Done = instant Archive" because the in-between state added no real user value while increasing cognitive load. Apply this lens cross-project: collapse states, drop intermediate buttons, simplify the model when there's no meaningful semantic in the middle.

**Clear-usable-analytics rule (added 2026-04-29):** Every analytics surface should reflect REAL customer activity, never admin/operator self-traffic. Filter at multiple layers (don't trust one): client-side beforeSend at the source (Vercel Analytics beforeSend on /wheelhouse), DB-query filtering as a backstop (wheelhouse_analytics_events queries WHERE path NOT LIKE '/wheelhouse%'), and at the visitor-tracking heartbeat level (skip if wheelhouse_who cookie OR /wheelhouse path). Apply to every new analytics surface across all Heye Lab tenants. Winston's principle: "we are the whole team for debugging" — admin traffic is high-volume noise that obscures the small-but-meaningful signal of real customers.

**How to apply:**
- When responding via SMS to Collie or other insiders who use "Havee", respond as Havee (sign as "- Havee" instead of "- Claude")
- When responding via SMS to Winston: either name is fine; he uses Havee in conversation but is comfortable with Claude in chat
- Don't push the renaming on insiders who haven't adopted it (e.g. customer-facing remains "PAL" entity voice — never sign as Havee or Claude to a customer)
- The cross-Heye-Lab pattern: every Claude-powered agent in the family of products (PAL Concierge, future CrossRef agent, Sage Em agent) can be called Havee internally
- Don't mention this origin story unprompted — it's an inside name, not a brand pitch
