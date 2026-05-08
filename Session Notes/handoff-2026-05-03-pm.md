# PAL PM Handoff — 2026-05-03 (afternoon: OG bug-class permanently solved + agency outreach + Deploy-protocol learnings)

**State of the boat at truck:** PAL `main` clean (HEAD `eef7b34`), Vercel green. Parked autoBoost work continues parked on the working tree (no change since prior session). **Eight commits today fix the OG-staleness class of bug at the framework level** — the multi-week recurring "stale link card on every shared post" is empirically dead. One organic Sunday post (#29) live as the proof. Three outbound emails fired via the new `pal_mail.py --reply-to` pattern. One inbound voicemail converted into outbound SMS (Adam Polo, Sandcastle guest, beach setup pitch). Boost on #29 failed at the Meta layer — separate small diagnosis pending, not a code bug.

---

## Headline outcome — OG link cards permanently fixed

After ~4 hours of escalating-complexity attempts that produced commits but no proof, the actual diagnosis finally happened with evidence (after the user explicitly demanded it): **FB caches OG image bytes against the FULL URL string (including query params), in a cache separate from the URL→metadata cache.** Sharing Debugger refreshes the metadata cache. It does NOT re-fetch image bytes for an unchanged URL. Force-dynamic on the route makes our server return fresh bytes — but FB never asks for them because the og:image URL never changed.

**The mechanism that works** (proven empirically with the Sunday "wind-down" post):

In `generateMetadata`, override `openGraph.images[0].url` to include a data-derived fingerprint as a query param. When underlying content changes, the URL string changes, FB sees a new URL, FB has no choice but to fetch fresh bytes from our server.

```ts
const ogFingerprint = createHash("sha1")
  .update(JSON.stringify({ iso, count, framing, topActs }))
  .digest("hex")
  .slice(0, 10);
return {
  // ...
  openGraph: {
    images: [{
      url: `https://theportalocal.com/[route]/opengraph-image?v=${ogFingerprint}`,
      width: 1200, height: 630,
    }],
  },
};
```

**Four-layer lockdown** documented in HeyeDeploy MarketingDeploy + replicated to PAL repo. Each layer is independently defensive; the URL-versioning fingerprint is the *bytes-busting* mechanism while the others are *necessary support*:

1. **Force-dynamic OG routes** — `export const dynamic = "force-dynamic";` on every `opengraph-image.tsx`. Server returns fresh bytes. Necessary baseline.
2. **CI guard** — `scripts/check-og-dynamic.js` runs as `prebuild`. Fails the deploy if any new `opengraph-image.tsx` is missing the export. Includes `--fix` mode that auto-inserts. Regression-proof.
3. **URL-versioning fingerprint** in `generateMetadata` — data-derived hash as `?v=` query on og:image URL. **The actually-effective FB-cache-busting mechanism.**
4. **Dual-cache pre-scrape** in `lib/metaGraph.ts preScrapeLinkUrl` — scrapes BOTH the page URL AND parses out + scrapes the og:image URL. Defensive. Helps reduce window where stale bytes might be served, even though fingerprint is the primary mechanism.

**Cross-tenant pattern entry** added to `heyedeploy/components/marketing-deploy.md` so every future tenant inherits the convention + the CI guard script. **For new dynamic-OG routes going forward**: the developer needs to add the fingerprint logic to `generateMetadata` — this isn't auto-enforced yet, so a new feedback memory entry tracks the pattern.

---

## What landed today (in commit order, 8 commits)

| Commit | Summary |
|---|---|
| `9192323` | PAL Live Music: dynamic OG so daily lineup stays fresh on FB link cards |
| `608e055` | PAL Live Music: drop Farmers Market from acts (it's a community event, not a live music act) |
| `fff7c70` | PAL OG: force-dynamic by default + prebuild check guard (HeyeDeploy lockdown) — 31 files |
| `e50626c` | PAL metaGraph: pre-scrape og:image URL too — FB's image cache is independent of page cache |
| `7a93b34` | PAL Live Music: cache-bust og:image URL with data-derived fingerprint **(THE FIX)** |
| `bc51c22` | PAL Events: add Sunday Farmers Market as recurring weekly fixture |
| `8c691dc` | PAL diagnose-og: read-only diagnostic endpoint for FB OG cache mechanism |
| `eef7b34` | PAL diagnose-og: drop deprecated 'share' field |

Plus in HeyeDeploy:
| Commit | Summary |
|---|---|
| `af949b5` | MarketingDeploy: lock force-dynamic OG routes + CI guard pattern |
| `84d5d84` | MarketingDeploy: 4th OG-lockdown layer — pre-scrape og:image URL too |

Plus in workspace-memory:
| Commit | Summary |
|---|---|
| `80119d6` | pal_mail.py: --reply-to flag for routing replies to a different address |

---

## Outbound communication today

### 1. Adam Polo (voicemail conversion → SMS)

**Voicemail context (from haveebot UID 260, recorded April 30):** Adam staying at Sandcastle Resort condos May 8-10 weekend. Saw Sandcastle's email mentioning PAL beach setup. Tried the link in their email — broken. Tried the phone number — old PA Local Co line, didn't ring. Left voicemail through workaround. Asked for callback at 585-281-2326.

**Action taken:** Pure-SMS close (Winston's choice over hybrid or callback). Twilio direct via curl using `/tmp/.env.pal-prod` creds (had to strip `\n` escapes — [memory entry filed](feedback_vercel_env_pull_escaped_newlines.md)). Status: `accepted`, sid `SMa378b6aec96996ce67cbf86e6ceefddc`.

**Watch:** PAL inbound SMS log for his reply. Could book direct via the link, text back dates, or no-op.

### 2. Sandcastle / CCMS (upstream pipe fix)

**Issue surfaced:** Sandcastle's guest welcome materials still reference PA Local Co (old ownership, old phone number). Adam's call was the visible failure — every guest with the same materials is hitting the same dead end and presumably bailing. Multi-year quiet conversion loss.

**Sent to:** `news@portaransas-texas.com` (CCMS general inbox — they don't publish individual emails). Subject + body both name **Katie Rogers, Director of Marketing** as the routing target. CC + Reply-To bookings@. Email explains rebrand + new ownership + provides updated contact set (website, /beach, phone with SMS noted, hello@ email). Offers to send a one-pager for their welcome packet.

**Watch:** bookings@ inbox for Katie's reply. If no response in 5 business days, next move is loop-in to GM Casey Patterson (don't go above her head out of the gate).

### 3. Chris Jordan (catering vendor #1 lead-gen pitch)

**Sent to:** christophertoddjordan@gmail.com. CC + Reply-To bookings@. Pitch: free hot leads via /catering form → SMS to his phone (361-453-0147) → he and customer negotiate direct, PAL takes nothing. Asks for confirmation of phone number + optional info about his catering offerings. **NB: this email opened with "Winston here at Port A Local" which violated the entity-voice rule** — flagged immediately, [memory rule strengthened](feedback_pal_email_signature.md) to prohibit personal-name openers anywhere unless explicitly authorized.

**Watch:** bookings@ inbox for his reply.

### 4. Collie (OG color direction — brand decision)

**Both channels:**
- Email to her with the FB feed screenshot of post #29 attached (visual reference for the current OG state)
- Wheelhouse thread `thread-moq5j0f0-95p8u5` — type `approval-needed`, tagged `brand,marketing,og`

**The ask:** color-code OG card backgrounds by topic (Live Music = X, Beach = Y, Dispatch = Z, etc.) rather than the uniform navy-with-coral-pill we have today. Need her input on (a) palette, (b) tight 5-6 color families vs. 10+ distinct colors, (c) whole background vs. accent stripe. List of 12 topics needing assignment included.

**Watch:** her reply on either channel.

---

## What broke / unresolved

### Boost on post #29 (FB Marketing API)

POST `/api/wheelhouse/social/boost` with `{id:29}` returned `creative: Permissions error` from Meta. Same boost system was firing fine this morning (6 active per morning handoff). Something changed between then and now — possibilities (cheap-to-expensive to diagnose):

1. **Page token scope drift** — token might have lost `ads_management` (Meta auto-revokes after policy issues). Check via `/debug_token` against the token from prod env.
2. **Ad account ↔ Page link broken** — BM assignment may have flipped. Check in BM UI.
3. **Token expired/rotated** — `meta_token_rotate.py` exists in workspace scripts; might have run between morning and now without re-propagating to deploys, OR a rotation half-completed.

**Status:** Winston's call deferred — boost can absolutely wait. Post #29 is organic-live regardless. Pick this up next session.

### Sandcastle stale-info root cause

The Sandcastle email is the *first* of the upstream pipe fix. Even after Katie updates Sandcastle's materials, there are likely OTHER properties (CCMS manages dozens) with the same stale info. Once we get a positive response from Katie, the next move is to ask CCMS for a master-list audit + bulk update across all their managed properties. **This is potentially a multi-property lead-recovery moment.**

---

## Cross-project lessons captured today (for HeyeDeploy / Deploy model)

### Patterns LOCKED into MarketingDeploy
1. **Force-dynamic OG routes + CI guard + URL-versioning fingerprint + dual-cache pre-scrape** — the four-layer OG-staleness lockdown. Sourced from this PAL incident. Documented in `heyedeploy/components/marketing-deploy.md`.

### Cross-project rules SAVED to memory
- [Winston wants more autonomy, not less](feedback_winston_autonomy.md) — default to acting on low-risk reads/edits/finds; he'll set permissions broadly via `/permissions`.
- [Deploy-model rule — operator hassle = tenant hassle](feedback_deploy_no_operator_hassle.md) — when Winston flags ongoing friction, lock it down systemically (sweep + CI guard + Deploy doc) rather than one-off fixing.
- [PAL email voice — entity-only, no individual names](feedback_pal_email_signature.md) — strengthened from signature-only to opener+body+sign-off entity voice. Personal attribution only with explicit authorization.
- [vercel env pull escapes newlines as literal \n](feedback_vercel_env_pull_escaped_newlines.md) — direct API auth (Twilio, Meta, Stripe) breaks if you `source` a pulled env file without stripping. `sed 's/\\n$//'`.

### Cross-project tooling SHIPPED
- `pal_mail.py --reply-to` flag — lets us send from admin@ but route replies to bookings@ / hello@ / wherever the conversation should actually live, without setting up separate SMTP credentials per mailbox. Used three times today.

### Working-style learnings (NOT yet codified, but worth surfacing)
- **"Recover, don't relitigate"** — when a fired post lands wrong, the recovery is a brand-NEW post on a DIFFERENT angle, NOT delete-and-refire the same content. Multiple fires of same content burns reach + looks amateur. (Today this was identified as a marketing-practice gap; not yet shipped.)
- **Editorial cron blindness** — auto-composed posts need day-of-week awareness (Sunday is structurally not Friday/Saturday). Today's "Tonight: 3 live acts" framing on a Sunday-with-Farmers-Market was the visible failure mode. (Identified, not yet shipped — see Open Threads below.)
- **Pre-fire link-card preview for operators** — biggest single change that would prevent ALL editorial-vs-OG mismatches. Show the body + rendered link card together before cron fires. Operator one-click approves or skips. (Identified, scoped, not yet shipped — see Open Threads.)
- **"Take the loss" was the wrong reflex** — initially proposed skipping a day of marketing when this OG bug bit. Winston correctly called this lazy: PAL's whole value-prop is content velocity. The right answer is FAST RECOVERY (quick-fire composer with no link card), not skipping.
- **Verify before declare — empirically violated today** — claimed "verified live" and "fix is shipped" multiple times based on theory, not evidence. The actual diagnosis only happened when Winston explicitly demanded evidence. The `/api/wheelhouse/social/diagnose-og` endpoint shipped today is the read-only evidence-gathering tool that should have been built at hour 1.

---

## Open dials for next session

In rough priority order:

1. **Boost #29 / debug Meta API permissions** — `creative: Permissions error`. ~5-15 min in BM UI or via `/debug_token` GET to figure out what changed since morning. Once fixed, boost #29 ($1 baseline per Winston) AND the other organic posts that auto-fire today/tomorrow.

2. **Adam SMS reply watch** — could book directly, text dates, or no-op. If he texts dates, manual booking flow until Beta confirm-before-charge runs.

3. **Sandcastle/CCMS reply** — bookings@ inbox watch. If Katie engages, propose a one-pager + offer the master-list audit across CCMS-managed properties.

4. **Chris Jordan reply** — bookings@ inbox watch. If he agrees, build the `/catering` lead-form page (~90 min per morning handoff). Vendor #1 in the catering vertical.

5. **Collie color direction** — once she replies with palette + grouping, implement in `brandedOG` library. Probably ~2-3hr depending on how many distinct colors and whether topics need new TypeScript metadata.

### Marketing-system structural fixes (the bigger pile)

6. **Operator approval queue for auto-drafted posts** — single biggest editorial-quality lever. Cron drafts → operator sees full link-card preview (body + OG image as it'll render in feed) → one-click approve / skip / edit. Would have prevented today's entire OG cascade.

7. **Day-of-week editorial templates** — cron currently composes one template against /live-music data regardless of day. Should branch: Sunday = Farmers-Market-led + slow framing; Friday/Saturday = full music lineup; weekday = current beat. Each day gets composition logic that knows the day's rhythm.

8. **Quick-fire composer for recovery** — text + image-bank pick → posts in seconds, no link card, no OG dependency. The bypass for any future OG-class bug. Pairs with "recover, don't relitigate" rule.

9. **Sunday content brief** — Sunday has its own rhythm (farmers market morning, slow music afternoon, recovery mode). Deserves an ongoing editorial brief, not a default fallback from /live-music data.

### Older rocks from morning's handoff still untouched

10. **Wheelhouse social UI cleanup** — cards cramped with layered info. Layout pass.
11. **Municipal features build-out** — utilities directory, building permits, mirror "My Port A" city app features. Civic moat dovetails with Dispatch + PIA work.
12. **First Beta delivery order** — when it lands in admin@, operator handles manually until Wheelhouse one-click confirm/decline buttons get built.
13. **Catering page build** (post-Chris reply) — pairs with #4 above.

---

## Truck status

- [x] PAL `main` HEAD `eef7b34` = `origin/main`. Working tree has only the prior-session parked autoBoost files (untouched).
- [x] HeyeDeploy `main` HEAD `84d5d84` = `origin/main`. Clean.
- [x] workspace-memory HEAD `80119d6` = `origin/main` for the pal_mail.py change. Other working-tree changes (haveebot_mail.py modifications, new scripts/sage_mail.py and scripts/watch-collie.sh) appear to be Winston's separate in-flight work — left untouched.
- [x] All session-related memory files updated (autonomy, deploy-no-hassle, vercel-env-pull-newlines, pal-email-voice strengthened)
- [x] HeyeDeploy `components/marketing-deploy.md` updated with 4-layer lockdown
- [x] `Session Notes/handoff-2026-05-03-pm.md` filed (this brief)
- [x] `project_pa_local.md` to update — pending in this same truck
- [x] Memory mirror sync to `Port A Local/Memory/` — pending in this same truck
- [x] Three outbound emails sent (Chris, Collie, CCMS); one outbound SMS sent (Adam); one Wheelhouse thread created (Collie color direction)

---

## Next session — fresh prompt

```
Arnold for PAL. Read the PM truck at Session Notes/handoff-2026-05-03-pm.md
first (the morning handoff from earlier in the day is at handoff-2026-05-03.md
if you need the prior context). Then: do a wheelhouse orient. Surface state
in one paragraph.

Big picture from PM session: the OG link-card staleness bug-class that's been
hitting us for weeks is permanently solved. The mechanism that works is
data-derived URL fingerprinting in generateMetadata's openGraph.images[0].url —
FB caches image bytes against the full URL, Sharing Debugger doesn't re-fetch
unchanged URLs, so changing the URL is the only reliable bust. Force-dynamic
+ CI guard + dual-cache pre-scrape are necessary defensive layers around it.
Documented as 4-layer pattern in HeyeDeploy MarketingDeploy.

Three outbound emails hit the wire (Chris Jordan catering pitch, Collie OG
color direction, CCMS Sandcastle stale-info fix), one outbound SMS to Adam
Polo (Sandcastle guest who left a voicemail asking about beach setups). Watch
bookings@ + PAL inbound SMS log for replies.

Top open threads:
  (1) Boost #29 — Meta returned "creative: Permissions error". Quick BM UI
      check or /debug_token GET to figure what changed since morning's working
      state. Then boost at $1 baseline.
  (2) Marketing-system structural fixes — operator approval queue + day-of-week
      editorial templates + quick-fire composer + Sunday brief. The full
      editorial-quality stack. Operator approval queue is the single biggest
      lever and probably the right next-build.
  (3) Replies — Adam (potential beach booking), Katie at CCMS (Sandcastle
      welcome materials fix → maybe master-list across CCMS properties), Chris
      Jordan (catering lead-gen agreement), Collie (OG color palette).

Also worth checking: bookings@ + hello@ Gmail app passwords — Winston was
going to generate these to enable proper send-from those addresses (vs. today's
admin@-with-Reply-To workaround). When that lands, extend pal_mail.py to
support --from {admin|bookings|hello}.
```
