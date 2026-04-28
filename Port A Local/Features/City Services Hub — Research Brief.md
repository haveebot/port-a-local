# City Services Hub — Research Brief

_Researched 2026-04-27. Surfaces what the City of Port Aransas exposes digitally and how PAL's "city tool" ambition sits next to the city's newly launched **My Port A App**._

---

## A. My Port A App — what it is

- **Name:** My Port A
- **Vendor:** **GOGov, Inc.** (`GOGovApps, Inc` on Play Store) — a white-label municipal-app-as-a-service used by 600+ small/mid US cities. Same template ships as "My La Quinta," "My Barnstable," "My Niskayuna," "My Eastvale," etc. — Port Aransas is one of dozens of near-identical instances.
- **Released:** **2026-02-09** (iOS), version 5.56.x. Listed under Utilities / Productivity. Free.
- **iOS:** [apps.apple.com/us/app/my-port-a/id6758670250](https://apps.apple.com/us/app/my-port-a/id6758670250) — 5.0 stars / **1 rating**
- **Android:** [play.google.com/store/apps/details?id=com.govoutreach.portaransascitytx](https://play.google.com/store/apps/details?id=com.govoutreach.portaransascitytx) — listed at ~600 install-count tier
- **What it does (per app store copy):** "Tap right into your City with My Port A!" Push notifications for road closures, weather alerts, events; quick-link tiles to existing city web pages; optional account so users can pick which topics to follow.
- **What it does NOT do:** No transactions. No bill payment, no permit purchase, no in-app forms. It's a notification + bookmark wrapper around `cityofportaransas.org`. GOGov sells a 311 / Citizen Request module but Port Aransas appears not to have bought it (the city's "Report a Concern" is still a custom WordPress form).
- **Cost signal:** GOGov entry pricing is publicly cited at ~$2,500/yr. Small spend — not "significant money." Multi-year + 311 add-on could push it higher. Worth a public-records request to confirm.

**Bottom line:** thin shell. Its only moat is push notifications + the city's name on it.

---

## B. City service inventory

| Service | Current digital home | Vendor | API / scrape feasibility | Refresh | Value to PAL |
|---|---|---|---|---|---|
| **Emergency / weather alerts** | [portal.civicplus.com/TX-PortAransas/notifications](https://portal.civicplus.com/TX-PortAransas/notifications?tab=alerts), text COPA to 38276, AlertSense app | CivicPlus Mass Notification | No public API; CivicPlus has a partner API but gated. Could subscribe-and-relay from a PAL-controlled phone/email. | Real-time | **HIGH** |
| **Utility billing (water/gas/sewer)** | [municipalonlinepayments.com/portaransastx/utilities](https://www.municipalonlinepayments.com/portaransastx/utilities) | Municipal Online Payments | Auth-walled. No public API. | n/a | LOW (transactional, deep-link only) |
| **Beach parking permit** | [/beach-parking-permit-information](https://cityofportaransas.org/departments/parks-and-recreation/port-aransas-beach/beach-parking-permit-information/) | None — physical sticker, $12, sold at City Hall, Chamber, grocery/convenience stores | No online purchase. Static info page, scrapeable. | Static | **HIGH** (info + "where to buy near me" map = real PAL value) |
| **Building permits** | [portaransastx.portal.opengov.com](https://portaransastx.portal.opengov.com/) | OpenGov | OpenGov has read APIs for permit data (often public). Worth probing. | Daily | MED (interesting public-data overlay) |
| **Short-term rental registration** | [portaransas.munirevs.com](https://portaransas.munirevs.com) | MUNIRevs (Avenu) | Auth-walled portal. No public registry visible. | n/a | MED (public-registry would be GOLD if accessible) |
| **Council agendas + minutes** | [cityofportaransas.civicweb.net/Portal](https://cityofportaransas.civicweb.net/Portal/) | CivicWeb (iCompass / Diligent) | HTML stable, scrapeable. CivicWeb often exposes RSS-like feeds; needs probing. Email-subscribe exists. | Per-meeting | **HIGH** (digestable summaries beat raw PDFs) |
| **Code of ordinances** | [library.municode.com/tx/port_aransas](https://library.municode.com/tx/port_aransas/codes/code_of_ordinances) | MuniCode | Stable URLs; scrapeable. Heavy. | Annual | LOW |
| **Public notices (RFPs, hearings)** | [/public-notices](https://cityofportaransas.org/public-notices/) | Self-hosted WP | Pure HTML scrape. No RSS. | Weekly | LOW–MED |
| **Parks & Rec events / programs** | [porta.recdesk.com/Community/Calendar](https://porta.recdesk.com/Community/Calendar) | RecDesk | RecDesk usually exposes iCal export; needs verification. Scrapeable. | Daily | **HIGH** |
| **Job postings** | recruiting.paylocity.com | Paylocity | No public RSS/JSON. Scrapeable list page. | Weekly | LOW |
| **Code enforcement / report a concern** | [/i-want-to/report-a-concern-complaint](https://cityofportaransas.org/i-want-to/report-a-concern-complaint/) | Custom WP form | Form-only, no public ticket data. | n/a | LOW (transactional) |
| **Beach flag status / closures** | Not on city site (handled by Texas Beach Watch / county) | — | beachwatch.tamu.edu has bacterial advisories with public data | Daily | **HIGH** |
| **Garbage / recycling** | No portal. Schedule lives in PDFs / FAQ. | — | Static | Static | LOW–MED |
| **Park reservations (civic center, marina pavilions)** | [/civic-center-rental](https://cityofportaransas.org/departments/facilities/civic-center-rental/) etc. | Email/phone-based | n/a | n/a | LOW |
| **Property tax** | Nueces County Appraisal District, [nuecescad.net](https://www.nuecescad.net) | True Automation / TrueRoll | Public parcel data, scrapeable | Annual | LOW |
| **Voting / elections** | Nueces County Clerk + TX SOS | — | Public, scrapeable | Episodic | LOW–MED |
| **Library** | [ellismemorial.biblionix.com](https://ellismemorial.biblionix.com/) | Biblionix | Auth-walled | n/a | LOW |

---

## C. HIGH-VALUE integration candidates (top 5)

1. **Emergency + weather alerts as a PAL banner.** Subscribe a PAL-owned phone/email to CivicPlus, parse, fan back out as an always-visible site banner. My Port A's push is its single best feature; matching it on the web (no app install required) is PAL's highest-leverage move.
2. **Council meeting digests.** Scrape CivicWeb weekly, summarize agendas/minutes in PAL voice, link the official PDF. Nobody reads 80-page packets — a 200-word "what just got decided" wins. Editorial muscle GOGov can't ship.
3. **Beach permit "where to buy" map.** Permits are physical, sold at scattered private retailers. PAL's Business Directory already knows which stores are open; tagging "sells beach permits" makes a PAL page the canonical answer. The city's page just says "various vendors."
4. **Calendar unification.** RecDesk + library + marina + chamber feeds = one PAL `/calendar`. RecDesk likely exposes iCal. My Port A only links out to each separately.
5. **Beach conditions widget.** Texas Beach Watch advisories + NOAA tide/wind + (in-season) flag status. None of this exists in My Port A. Whoever owns "what's the beach like right now" owns the local mobile market.

---

## D. Open questions / partnership angles

- **What did the city pay GOGov, multi-year?** Public-records request. $2.5–5K/yr = no story. $15K+/yr = there's a story.
- **Did they buy GOGov's 311 add-on?** Watch for "Report a Concern" rebranding — that's the tell.
- **CivicWeb RSS:** does Port A's instance expose a feed for new agenda postings? Most do. One-line probe.
- **OpenGov public data:** the building-permit portal may expose issued-permit data publicly. If so, "new permits this week" is free PAL content.
- **Partnership pitch:** PAL hosts the richer hub (permits-near-me, meeting digests, unified calendar) and **deep-links to city portals for the transaction** (pay bill → MunicipalOnline; permit → OpenGov; STR → MUNIRevs). City keeps the system-of-record + the app. PAL becomes the discovery layer. "We send you traffic, you don't pay us" — easy yes.
- **Push-notification gap:** GOGov has push, web doesn't. Pair the alert banner with optional **SMS/email subscribe** (Resend + Twilio, both already in stack) — parity-matches My Port A on alerts while beating it elsewhere.

---

## E. Source URLs

- City of Port Aransas: [cityofportaransas.org](https://cityofportaransas.org/)
- Online services: [cityofportaransas.org/online-services](https://cityofportaransas.org/online-services/)
- My Port A (iOS): [apps.apple.com/us/app/my-port-a/id6758670250](https://apps.apple.com/us/app/my-port-a/id6758670250)
- My Port A (Android): [play.google.com/store/apps/details?id=com.govoutreach.portaransascitytx](https://play.google.com/store/apps/details?id=com.govoutreach.portaransascitytx)
- GOGov vendor: [gogovapps.com](https://www.gogovapps.com/)
- CivicWeb agendas: [cityofportaransas.civicweb.net/Portal](https://cityofportaransas.civicweb.net/Portal/)
- CivicPlus alerts: [portal.civicplus.com/TX-PortAransas/notifications](https://portal.civicplus.com/TX-PortAransas/notifications?tab=alerts)
- Utility payments: [municipalonlinepayments.com/portaransastx/utilities](https://www.municipalonlinepayments.com/portaransastx/utilities)
- Building permits (OpenGov): [portaransastx.portal.opengov.com](https://portaransastx.portal.opengov.com/)
- STR registration (MUNIRevs): [portaransas.munirevs.com](https://portaransas.munirevs.com)
- Parks & Rec calendar (RecDesk): [porta.recdesk.com/Community/Calendar](https://porta.recdesk.com/Community/Calendar)
- Code of ordinances: [library.municode.com/tx/port_aransas](https://library.municode.com/tx/port_aransas/codes/code_of_ordinances)
- Jobs (Paylocity): recruiting.paylocity.com (city-specific subpath)
- Public notices: [cityofportaransas.org/public-notices](https://cityofportaransas.org/public-notices/)
- Report a concern: [cityofportaransas.org/i-want-to/report-a-concern-complaint](https://cityofportaransas.org/i-want-to/report-a-concern-complaint/)
- Beach permits: [cityofportaransas.org/.../beach-parking-permit-information](https://cityofportaransas.org/departments/parks-and-recreation/port-aransas-beach/beach-parking-permit-information/)
- Texas Beach Watch (advisories): [beachwatch.tamu.edu](https://beachwatch.tamu.edu)
