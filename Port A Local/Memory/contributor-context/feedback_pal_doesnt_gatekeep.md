# PAL doesn't gatekeep

_Brand principle | Articulated 2026-04-26 by Winston | North-star for product decisions_

---

## The principle

**PAL doesn't gatekeep. The market sorts conversion, not us.**

When deciding whether PAL should require, restrict, or filter something
from a vendor / runner / lister / local, the default answer is **let
them in**. We provide the platform; we don't provide the judgment about
what's "good enough" to participate.

If quality matters (and it does), PAL's role is to **make the cost of
low quality visible** — not to bar low-quality from existing.

## The pattern in practice

| Concept | Gatekeeper version (NOT PAL) | PAL version |
|---------|-------------------------------|-------------|
| Listings without photos | Hidden from customers | Live; they just convert worse. The lister's choice. |
| New runners pre-Stripe-onboarding | Blocked from running | Can run; PAL backfills payouts when Stripe lands |
| Restaurants we're not sure about | "Apply, we'll review" | If they're real, list them. Real customers sort the rest. |
| Reviews / ratings | Curate, suppress, manipulate | Don't have them. (Maybe ever.) |
| Vendor pricing | "Must charge $X" / cap rates | Vendor sets their own; market self-corrects |
| Editorial decisions on Heritage | Tourism-Bureau-style sanitization | Tell the actual story, even when uncomfortable |
| Service categories | Predetermined fixed taxonomy | "Other" exists; vendor describes what they do |

## Why this is differentiating

Every other local marketplace gatekeeps. Yelp filters reviews. Google
suppresses listings. Airbnb has host-requirement quotas. DoorDash hides
restaurants below a rating threshold. Tourism Bureaus curate their own
narrative.

PAL's anti-gatekeeping stance is what makes it feel like a public utility
for the town instead of an arbiter. It pairs with:
- **No paid placements** (locked-in 2026-04-12, Heritage)
- **100% to locals** (10% fee on customer side, never deducted)
- **PAL is an entity, not a person** (no "Winston Says" framing)
- **Anti-Bureau positioning** (locked-in 2026-04-14, Dispatch #1)

Together: PAL's the platform that LETS the town be the town. Not a
filtered version. Not a sanitized version. Not a paid-promotion version.
The actual town, with all its texture.

## Application checklist (for future product decisions)

When evaluating whether to add a restriction, requirement, or filter:

1. **Is this protecting the customer from real harm?** (Fraud, illegality, spam.) → Yes, gatekeep here.
2. **Is this protecting PAL's brand?** → Probably gatekeep, but think hard.
3. **Is this PAL deciding what "quality" means for a lister?** → Don't gatekeep. Surface the cost of low quality instead (e.g., "listings with photos convert better").
4. **Is this PAL filtering for what customers "should" want?** → Don't gatekeep. The customer can read; let them decide.
5. **Is this convenience for PAL operators (us)?** → Lean against gatekeeping. Our convenience isn't worth fewer locals participating.

## Where this came from

2026-04-26 evening session, late in the locals-offer approval flow build.
Earlier draft made photos a hard gate before listings could go live —
"Verified ≠ Live, photos required." Winston caught it: *"i guess
technically we will let people list anything - they just have a better
shot at making money with good pics - agreed?"*

Reframed: **Verify = live. Photos = optional optimization.** Then
Winston: *"PAL doesn't gatekeep — so fucking good."*

The principle articulated itself out of that one product decision.
Shipped in commit `5de4072`.

## Tagline candidate

**"PAL doesn't gatekeep."** Could land as a brand line, social bio,
about-page anchor. Owned by Collie for the brand-system call (per
existing brand workflow); flagged here for her review.

Versions worth testing:
- "PAL doesn't gatekeep."
- "We don't gatekeep the town."
- "Real Port A. Unfiltered."

## Pickup-here

When this thread comes back:
- [ ] Run by Collie for brand approval — could become a tagline or
      anchor line on /about / footer
- [ ] Audit existing PAL surfaces for places we're accidentally
      gatekeeping (listing requirements, signup gates, content filters)
- [ ] Apply to CityDeploy framing — anti-gatekeeping is a positioning
      lever vs Yelp / Google / Airbnb-style competitors when selling
      the platform to other towns
