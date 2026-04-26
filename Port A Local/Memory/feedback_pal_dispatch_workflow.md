---
name: PAL Dispatch editorial workflow
description: Validated pattern for writing and shipping PAL Dispatch pieces — the media-outlet side of Port A Local
type: feedback
originSessionId: 6a58dea9-275f-4704-a429-95965ae3c9bc
---
For PAL Dispatch (editorial/journalism, distinct from Heritage), this workflow landed cleanly with Winston and should be repeated:

1. **Push back on the brief first.** Before writing, review the user's framing and flag what needs verification. Sonic-as-local-signal needed national-chain-closure context. Housing "way down" needed disambiguation (volume vs. price). Tourism Bureau critique needed methodology specificity. Winston preferred the pushback over a fast first draft.

2. **Verify every factual claim publicly before writing.** Web-search Comptroller sales tax data, South Jetty coverage, developer press releases, school enrollment, planner/architect connections. If a claim doesn't survive a Google search, it doesn't go in the piece.

3. **Hold back unverifiable claims for follow-ups, not omissions.** When Winston fed claims with no public record (Cutler/Business Center rent doubling), the right move was to *name the held-back piece as a separate follow-up* rather than either (a) writing around them vaguely or (b) dropping them. The landlord piece is now a planned follow-up waiting on tenant sourcing.

4. **Critique roles, not people.** Stawar has a job; the Tourism Bureau has a structural role. Piece critiques the *institutional limit* of what a chamber-and-bureau is designed to measure. This is how we stay defensible while still making the argument land.

5. **Ship directly to the live site when authorized.** Winston explicitly said "put it directly on the site, I can review there" — and he meant it. For PAL (low traffic, owner-operated, author is also publisher), shipping-then-reviewing is the right cadence. Don't ask for re-confirmation after explicit authorization.

6. **Build architecture, not just content.** First dispatch got its own section (`/dispatch`), data layer (`dispatches.ts` + `dispatch-content.ts`), NewsArticle schema, nav integration, sitemap entries, and Gully indexing — mirroring the heritage pattern. Dispatch #2 slots in by adding two data entries. That scales.

**Why:** Winston wants PAL to be a legitimate media outlet. "Shareable, marketable, ours." That means defensible sourcing, sharp analytical spine, not agitating locals who are *"some of us,"* and a platform that grows instead of a one-off post. Editorial capability tested and validated 2026-04-14 with "The Two Port Aransases."

**How to apply:** Default to this six-step pattern for any Dispatch request. For Heritage, the pattern is different (preservation-first, less adversarial, see existing heritage pieces).
