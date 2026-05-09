---
name: Meta API "Invalid parameter" errors — real diagnostic is in error_user_msg
description: Meta's top-level error messages are meta-vague (literally "Invalid parameter"). Always inspect error_user_title + error_user_msg fields in the response payload — that's where the actual reason lives.
type: feedback
originSessionId: 59dd841c-d711-4ace-abb0-99da9ad6938a
---
**Cross-project rule.** When the Meta Graph API or Marketing API returns an error with `"message": "Invalid parameter"` (HTTP 400, code 100), the top-level message is essentially useless. The actual diagnostic is in two sibling fields on the error object:

- **`error_user_title`** — short human-readable title (e.g. "Campaign Schedule Is Too Short")
- **`error_user_msg`** — the actual instructive sentence (e.g. "Ad sets using a daily budget must be scheduled to run for at least 24 hours")

Plus `error_subcode` — a numeric ID that's stable across versions; useful for grep-finding the same error if it recurs.

## Standard debug pattern

When our code surfaces an error like `campaign: Invalid parameter` or `adset: Invalid parameter`, the wrapper has stripped the actual diagnostic. Reproduce the same call directly via curl/Python with the same payload + access token, then `python3 -m json.tool` the response to see the full error envelope. The real reason will be in `error.error_user_msg`.

```bash
curl -s -X POST "https://graph.facebook.com/v21.0/act_ID/campaigns" \
  --data-urlencode "name=Test" \
  --data-urlencode "objective=OUTCOME_TRAFFIC" \
  --data-urlencode "..." \
  --data-urlencode "access_token=$TOKEN" | python3 -m json.tool
```

The output will include both the vague top-level message AND the useful `error_user_msg`. Read the latter; ignore the former.

## Examples PAL hit during the 2026-05-02 boost build

These are illustrative of how meta-vague Meta's errors are without diving into the user_msg:

| Top-level | error_user_title | error_user_msg | Fix |
|---|---|---|---|
| Invalid parameter (subcode 4834011) | "Must specify True or False in is_adset_budget_sharing_enabled field" | Field required when not using campaign-level budget | Add `is_adset_budget_sharing_enabled=false` to campaign payload |
| Invalid parameter (subcode 1487793) | "Campaign Schedule Is Too Short" | Daily budget requires schedule >= 24 hours; exactly 24h is rejected | Switch from `daily_budget` to `lifetime_budget` (no minimum-duration restriction) |

Both took ~5 minutes to debug once we hit the API directly. Without the curl-debug step, "Invalid parameter" alone would have been guess-and-check for hours.

## How to apply (Claude session behavior)

1. When a Meta API call from our code surfaces "Invalid parameter" or any short generic error message, **don't speculate about the cause** — reproduce the call via curl with the same payload + token and read the full response.
2. Extract `error.error_user_msg` from the JSON. That's the answer 95% of the time.
3. If `error_user_msg` is also vague, fall back to `error_subcode` and search Meta's developer forum / Stack Overflow for that specific number. Subcodes are versioned and persistent.
4. **Never accept "Invalid parameter" as the diagnostic** — it's the placeholder, not the answer.

## Wrapper code implication

When writing future Meta API wrappers, propagate **all** error fields up the call stack — at minimum `message`, `error_user_title`, `error_user_msg`, `error_subcode`. Don't truncate to just `message`. PAL's metaAds.ts currently only surfaces `message`; this is debt — when our boost endpoint reports back to the UI, the operator sees "campaign: Invalid parameter" instead of "campaign: Campaign Schedule Is Too Short — extend the schedule."

(Pattern doc TBD: when we have a second tenant integrating Meta APIs, add a HeyeDeploy template "Meta API error envelope propagation" with the standard 4-field surface contract.)

## Filed: 2026-05-02

After the PAL boost build hit two consecutive "Invalid parameter" errors in 30 minutes — first at campaign create, then at adset create. Both took ~5 minutes each to resolve once we hit the API directly with curl + jq. Filing so this doesn't cost the same time on the next tenant's boost build.

## Update 2026-05-06 — "creative: Permissions error" → check **billing first, scopes second**

PAL boost #29 failed mid-day Sunday with `creative: Permissions error` and stayed broken for 5 days silently — every subsequent boost create hit the same wall. We initially assumed scope drift or token issues. **Wrong diagnosis path.**

The actual cause: **`account_status = 3` (UNSETTLED)** on the ad account. Meta tried to bill the funding source (Stripe Issuing card "PAL · FB Ads") for an outstanding $3.16 balance, the charge declined, the account flipped to UNSETTLED, and every subsequent ad-create hit the vague `creative: Permissions error`.

### The new diagnostic order for "creative: Permissions error" or any vague-perms-error from Meta Marketing API

1. **First — check ad account billing**, not scopes. Hit `/api/wheelhouse/social/boost/debug-perms` (PAL endpoint shipped 2026-05-06). Look at `ad_account.account_status`:
   - `1` = Active (good)
   - `2` = Disabled
   - **`3` = UNSETTLED** (most common — payment didn't go through)
   - `7` = Pending Risk Review
   - `9` = Grace Period
   - `100` = Pending Closure
   - `101` = Closed
2. **Second — check the funding source**. If the card is a Stripe Issuing virtual card, look at Stripe Issuing → authorization log for declines from Meta/Facebook. Common decline reasons for new cards: AVS mismatch, 3DS not completed, spending control triggered, BIN block.
3. **Third — check page tasks + token scopes**. Only after 1+2 are clean. The token rarely loses scopes silently; billing failures are the common drift.

### Specific Stripe Issuing on Meta gotcha — funding-balance mechanism

**Root cause confirmed 2026-05-07 (Winston operator-side):** Stripe Issuing cards are not credit lines — they **draw from the connected Stripe account's available Issuing balance**. If the operational account has $0 issuing balance, every authorization declines for `insufficient_funds` regardless of the spending-control cap. The card looks valid in Meta's UI (Mastercard *5656, accepted as funding source) but every charge fails at auth.

PAL incident chain:
1. Stripe Issuing card created and linked to Meta ad account 2026-05-02 — but operational Stripe account had no funded Issuing balance
2. First six boosts ran on Meta credit (accumulating $3.16 net-30 invoice)
3. Meta tried to settle the $3.16 → card declined for insufficient_funds → ad account flipped to UNSETTLED
4. All subsequent boost creates hit `creative: Permissions error` for 5 days until operator paid the $3.16 manually with a different method

**Other possible decline reasons** (less common in PAL's case but worth checking on first incident): AVS mismatch on freshly-issued cards, 3DS not completed, spending control triggered by Meta's $1 pre-auth pattern, BIN block.

Recovery steps (operator-side):
- Stripe Dashboard → Issuing → card → Authorizations → find declined Meta charge → read `decline_reason` (`insufficient_funds` is the most likely answer)
- If `insufficient_funds`: top up the operational Stripe account's Issuing balance (transfer from connected account / payouts), OR pay Meta's outstanding balance from a different method
- Meta Ads Manager → Billing → "Pay now" the outstanding balance manually with a different method (fastest unblock)
- After settling, account_status returns to 1 within ~minutes

**Prevention pattern:** When linking a Stripe Issuing card to any external billing system (Meta, Google Ads, etc.), pre-fund the Issuing balance with at least one month of expected spend BEFORE linking. The card's `spending_controls` cap is a ceiling, not a floor — it doesn't guarantee the auth will succeed.

### Companion diagnostic endpoints PAL ships

- `/api/wheelhouse/social/boost/debug-perms` — token + perms + page tasks + ad_account.account_status
- `/api/wheelhouse/social/boost/spend-breakdown?days=30` — per-ad spend totals + daily curve
- `/api/wheelhouse/social/boost/diagnose?id=N` — per-post boost state + insights triangulation (existing, pre-2026-05-06)

Pairs with:
- `feedback_meta_api_organic_deprecation.md` (the orgs-insights gap that drove us to build paid boost in the first place)
- `feedback_oauth_scope_layers.md` (App-vs-Token scope distinction)
- `feedback_vercel_env_pull_escaped_newlines.md` (token-handling sibling)
