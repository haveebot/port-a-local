---
name: Meta Graph API v21+ deprecates organic post insights — go paid or use own analytics
description: As of v21+ (late 2024/early 2026), `/insights` for organic page posts returns empty. Meta funnels everyone to Business Suite UI or paid Marketing API. Build for that reality from day one.
type: feedback
originSessionId: 59dd841c-d711-4ace-abb0-99da9ad6938a
---
**Cross-project rule.** Any Heye Lab tenant integrating with Facebook Graph API for Page posting MUST assume that organic-post insights (`post_impressions`, `post_impressions_unique`, `post_clicks`, `post_engaged_users`, etc.) will return **empty data** when called via the API. The metric names are still accepted by the endpoint — the response is HTTP 200 with `"data": []`. Same story for many page-level metrics.

**Why:** Meta has progressively deprecated organic-content analytics access via API since 2018, accelerating in v17-v21. Their stated goal: funnel page operators into Meta Business Suite UI (manual, eyeball-only) or Marketing API (paid promotions only). External-link posts get the worst treatment — Meta has been openly hostile to traffic-off-platform posts since 2018, both in algorithmic distribution AND in API-exposed metrics.

**How to apply:**

1. **Don't waste time building features that pull post-level reach/impressions via Graph API for organic content.** It will return empty. PAL learned this 2026-05-01 the hard way — built the inspect endpoint expecting reactions/insights, hit `(#10)` errors that were misdirected diagnostic noise, then found the metrics return empty even with proper scopes.

2. **Use the tenant's own analytics for click-through data.** Every tenant's Vercel Analytics + custom analytics events table captures the **referrer** field on each pageview. Joining queue (post → linkUrl) to analytics events (page hits + referrer ILIKE '%facebook.com%') gives a *stronger* signal than impressions: click-throughs = "someone acted," impressions = "someone scrolled past." For directory/dispatch sites this is the metric that matters anyway. See PAL's `feedback_heyedeploy_pattern_thinking.md` template "Per-post traffic dashboard via own analytics."

3. **For real reach/impression data, the only paths are:**
   - **Meta Business Suite UI** — manual, eyeball-only (good for occasional review, bad for programmatic dashboards)
   - **Boost the post (paid)** — even $1/24hr makes it a "paid promoted post" and unlocks the full Marketing API insights flow (reach, impressions, clicks, demographics, CTR, spend). PAL ships the boost wrapper as `src/lib/metaAds.ts` — see "Paid boost auto-fire" template.
   - **Internal "did it post" verification** — `/{post_id}?fields=is_published,is_hidden,privacy,targeting,feed_targeting,permalink_url` STILL works (proves the post is live and unrestricted). Just no engagement counts.

4. **What still works on a token with `pages_read_engagement` (no Marketing API needed):**
   - Page basics: `name`, `fan_count`, `about` ✅
   - Post existence + content: `id`, `message`, `created_time`, `permalink_url`, `is_published`, `privacy` ✅
   - Page feed listing: `/{page_id}/posts` ✅
   - Detect deleted posts (returns "Object does not exist") ✅

5. **What does NOT work even with `pages_read_engagement`:**
   - `reactions.summary(true)` / `comments.summary(true)` / `shares` — needs **`pages_read_user_content`** (separate permission, also App-Review-gated)
   - All `/insights` metrics for organic posts — return empty

**Verification:** when in doubt, hit `/{post_id}/insights?metric=<metric>&period=lifetime` directly with the candidate token. If you get HTTP 200 with `data: []`, the metric is dead-by-design and no scope addition will revive it.

**Filed:** 2026-05-01 by Winston after the PAL inspect-endpoint expedition. Cost: ~2hr of "wait, why is the data empty even though the token has the scope?" before pivoting to own-analytics.

Pairs with:
- `feedback_oauth_scope_layers.md` (the App vs Token scope distinction we tripped on same session)
- HeyeDeploy templates "Per-post traffic dashboard via own analytics" + "Paid boost auto-fire"
