---
name: OAuth scope layers — App-level config vs Token-level grant are separate
description: Adding a permission to a Meta App in App Review doesn't propagate to existing tokens. Tokens are frozen with whichever scopes were granted at OAuth-mint time. Always re-mint after scope changes.
type: feedback
originSessionId: 59dd841c-d711-4ace-abb0-99da9ad6938a
---
**Cross-project rule.** Any time a Heye Lab project integrates with an OAuth provider (Meta, Google Workspace, Reddit, Slack, etc.), distinguish between two layers — they're not the same and conflating them will burn time:

## Layer 1 — App-level permissions
*"What permissions can this APP request from users?"*

Configured once on the provider's App Dashboard. For Meta: App Review → Permissions and Features. For Google: OAuth Consent Screen scopes. For Reddit: app's allowed scope list.

Standard Access (auto-granted to admins/devs/testers) vs Advanced Access (post-review, available to any user) is a SUB-distinction *within* Layer 1.

## Layer 2 — Token-level scopes
*"What permissions does THIS specific token carry?"*

Frozen on each individual token at OAuth-mint time. When OAuth runs, the app *requests* a subset of its Layer-1 permissions in the consent dialog; the user *approves* (or deny-and-continue) some subset of those; the resulting access token carries exactly the approved set.

**Critical:** Once minted, a token's scopes are immutable. Adding a permission at Layer 1 *after* a token is issued does NOT propagate to that token. The token remains frozen with whatever was approved at its specific OAuth event.

## Why this matters

When someone says "we configured the app to have X permission," ask:
- Layer 1 question: was X added to the App Review permissions list?
- Layer 2 question: was the *current production token* minted *after* X was added, with X actually ticked in the consent dialog?

Both must be true for X to be exercisable in production. The most common failure mode is Layer 1 done correctly + token re-mint forgotten or done with X not selected.

## How to verify Layer 2 (the one that actually matters)

For Meta tokens:
```
GET /debug_token?input_token={token}&access_token={token}
```
Returns `data.scopes` (legacy flat list) AND `data.granular_scopes` (with target_ids per scope). If a scope you expect isn't there, the token doesn't carry it — re-mint required.

For Google: token introspection endpoint. For Reddit: `/api/v1/me/prefs` requires the scope, so a 403 indicates missing.

## How to re-mint cleanly (Meta example)

PAL canonical implementation: `~/Projects/workspace/scripts/meta_token_rotate.py`. Takes short-lived USER token from Graph Explorer + App Secret, exchanges to long-lived USER token via `fb_exchange_token`, fetches permanent PAGE token via `/me/accounts`, writes to Vercel as `META_PAGE_ACCESS_TOKEN`, redeploys. Includes Step 0 fail-fast credential check (caught a one-digit App ID typo on first run).

## When a re-mint is needed
- Adding a NEW scope (not yet granted at any layer)
- Adding a previously-revoked scope
- Standard → Advanced Access transition (only matters for non-admin users; admins always get Advanced)
- After App Secret rotation (existing tokens still work, but new token-derivation flows need the new secret)

## When a re-mint is NOT needed
- App Secret rotation alone (existing tokens unaffected — they're cryptographically signed with the secret at mint time, but ongoing API calls don't require the secret)
- App display-name change, icon change, business verification status — none of these touch tokens

## Filed: 2026-05-01

Filed by Winston during the PAL Live-mode → read-scope expedition. Yesterday (2026-04-30) we configured `pages_read_engagement` at Layer 1 (added to "Manage everything on your Page" use case) and minted the token. Today's read attempts failed because either:
- (a) The OAuth consent at mint time didn't actually request `pages_read_engagement`, OR
- (b) The page-token derivation step (`/me/accounts`) dropped scopes that the user-token had but the Page didn't have at the time

Either way: the token in production was frozen without the read scope, even though Layer 1 was correctly configured. Re-minting fixed it cleanly.

Lesson: when a scope-related call fails, the debug question is *not* "is Layer 1 correct" but "what does `/debug_token` show on the actual production token."

Pairs with:
- `feedback_meta_api_organic_deprecation.md` (the OTHER thing we tripped on same session)
- `meta_token_rotate.py` (the canonical fix)
