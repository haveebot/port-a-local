# Draft Reply — Live Music (uid 153)

**Context:** Winston sent the South Jetty's "Live Music Tonight" photo to haveebot on 2026-04-23 at 21:11 and said:

> "Example of a feature we could add via simple emails with screenshots or content. Tell C what you would need from us to execute efficiently with minimal manual effort and input. Think like - do it - if we don't like it then it changes or is removed - it can't be too bad or we would not have sent the idea."

Winston follow-ups (via chat):
- PA only (filter mainland)
- `/live-music` is the route
- Show cover and age info where applicable
- The photo trigger can also pull from the venue's website or other available data if it would benefit the result
- "c will also need an email review of this" → then clarified: she doesn't need to review the feature itself, she needs a review of the **process** + a **summary** of what we did

**Audience:** reply-to-all — Winston (winstonciv@) + Collie (collie.breah@). cc admin@theportalocal.com for the record.

**Subject:** `Re: Site Additions - Email to Add — Live Music shipped + new process`

---

Winston, Collie,

Live — https://theportalocal.com/live-music. Nav pills it under Explore.

## What shipped from one photo

Winston's phone snap of the South Jetty's "LIVE MUSIC TONIGHT" sheet got turned into a standing feature in one evening:

- **Tonight** section pinned to today's date (Central Time), highlighted.
- **The rest of the week** — Thu Apr 23 through Wed Apr 29, day by day.
- **Coming Up — Next Week & Beyond** — Apr 30 / May 1 / May 2 acts the print sheet listed ahead.
- **Venue cross-links into our directory** for The Gaff, Shorty's, Bron's Backyard, Treasure Island, VFW Post 8967, Salty Dog. Sip Yard is in the sheet but not yet in our directory — it renders as plain text for now and is a good candidate to add.
- **Mainland filtered out** — the same printed sheet lists Brewster Street, Executive Surf Club, Rockit's, Blackbeard's, Perrin's, Fifth & Elm Portland, Harbor Listening Room Fulton. All stripped. PAL is Port Aransas only.
- Its own branded OG share card, in the sitemap, revalidating hourly so "tonight" stays right between deploys.
- The Events page already had a "Live Music Nightly" recurring entry that pointed to `portaransas.org/portalive` for the schedule. Rewired it to point at our own page.

## The process we're putting in place

One loop, three steps, minimum possible effort from either of you:

1. **You send one photo a week.** Either one of you can send. To `haveebot@gmail.com`, subject prefix `Live Music — Week of MMM DD` (the subject's how I'll know it replaces the prior week, not an addition). Mid-week change? Reply to the same thread with one line ("Thursday: Brad Brown cancelled, Mantle Jennings subbing") and I patch the same day.

2. **I do the rest.** Transcribe the sheet, filter to PA only, optionally pull cover charges / age restrictions / set times from each venue's website or socials if the print sheet doesn't carry them, cross-link into our directory, rebuild the page, push live. No approval step unless something looks weird — which is the whole "do it and iterate" posture.

3. **You correct when you see something off.** Email, text, pasted screenshot, whatever. I don't need a structured bug report — a one-liner is fine.

## What we don't yet have but could pull per-venue on future photos

This first drop only used what the print sheet gave us — artist + date + venue. Winston asked about auto-enriching from venue sites; here's what's realistic:

- **Cover charges + set times** — some venues post these on Facebook event pages or their own sites. Others don't. I'll attempt enrichment on each weekly refresh and just leave fields blank where nothing's authoritative.
- **Age restrictions** — VFW Post 8967 is members-and-guests, Bron's is 21+ after a certain hour on some nights, Shorty's has family hours. These will fill in as I verify per venue; not all at once.
- **Artist links** — if someone has a clear public page (Spotify, Bandcamp, their own site), link it. Again case by case; I won't manufacture links.

If a venue isn't publishing that info anywhere public, the field stays blank. The printed sheet is the floor, not the ceiling.

## Collie — where you fit

The tightest loop for you: nothing's asked of you unless you want to weigh in on
- **Design of the page itself.** It follows the existing nav + hero + card conventions. If the "Tonight" emphasis treatment (coral border, bigger card) reads wrong at phone size, say so.
- **A dedicated `music` icon.** Right now the nav uses our existing `art` silhouette (paint palette) as a placeholder. A proper music mark — microphone, or a clean four-line staff/note — would be a one-file edit to `PortalIcon.tsx` when you have a minute. Low priority, not blocking.
- **Voice on edge cases.** E.g., how to phrase "No shows listed tonight" on a quiet Monday. Right now it's just "No shows listed tonight." — dry, factual. If you want it to read more island, flag it.

The recurring ask from you on any future feature like this is the same: review when it's live, flag anything off, say nothing if it reads right. No formal approval gate.

## What I need from Winston now

Nothing blocking. If you want Sip Yard added to the directory (it's getting listed on the Live Music page but not clickable), a few lines of tagline + address + phone from you and it's in. Otherwise this is deployed and self-sustaining on a weekly photo.

— The Port A Local
