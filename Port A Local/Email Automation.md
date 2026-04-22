# Email Automation — PAL Workspace

Spec for Gmail filter rules, canned responses, and autoresponders across the three Google Workspace accounts. Layer 1 (UI-based, copy-paste-ready). Layer 2 (server-side inbound parsing for click-to-claim) lives in the cart marketplace buildout, separate track.

**Accounts:**
- `admin@theportalocal.com` — ops + all account logins (Stripe, Twilio, Resend, Vercel, GSC, etc.)
- `hello@theportalocal.com` — public contact, business inquiries
- `bookings@theportalocal.com` — Resend transactional sender

**Sign-off rule (all PAL email — autoresponders, templates, replies):**
> — The Port A Local

No trailing "team." No individual name. Em-dash. Entity-and-person voice. This rule also lives in workspace memory (`feedback_pal_email_signature.md`).

---

## hello@theportalocal.com — public inbox

### Autoresponder (Vacation responder)
Set a permanent vacation responder that fires on every incoming message during business hours. Toggle the "Only send to people in my Contacts" OFF — we want everyone.

**Subject:** Got it — we're on it
**Body:**
> Thanks for writing. We got your note and we'll respond within 24 hours.
>
> If it's urgent and about a current booking, reply to your confirmation email — those go straight to our team.
>
> — The Port A Local

### Filters / labels
Create labels first (click gear → "See all settings" → "Labels" → "Create new label"):
- `Listing Requests` — vendors wanting to be added
- `Listing Updates` — existing vendors asking for edits
- `Customer Inquiries` — booking questions from customers
- `Press` — media, podcast, newspaper reaches
- `Spam/Solicitation` — SEO agencies, cold outreach

Filter rules (gear → Settings → Filters and Blocked Addresses → Create a new filter):

| If message has | Action |
|---|---|
| Subject or body contains `list my` OR `add my business` OR `be in the directory` | Apply label `Listing Requests`, star it |
| Subject or body contains `update` AND (`hours` OR `address` OR `photos` OR `listing`) | Apply label `Listing Updates` |
| Subject or body contains `booking` OR `reservation` OR `my request` OR `maintenance` | Apply label `Customer Inquiries` |
| From contains `press@` OR `editor@` OR `reporter` OR `journalist` | Apply label `Press` |
| Subject contains `SEO` OR `marketing services` OR `rank higher` | Apply label `Spam/Solicitation`, skip inbox, mark as read |

### Canned responses (Templates)
Enable under Settings → Advanced → "Templates" (turn on). Then compose a message, ⋮ menu → Templates → Save draft as template.

**Template: Listing added (new vendor)**
Subject: You're in — Port A Local
```
[Name] — thanks for sending this over. [Business Name] is now live on theportalocal.com under [category link].

No fee, no contract, no hoops. If you want to update anything — hours, photos, direct booking, anything — just reply to this email.

— The Port A Local
```

**Template: Listing update confirmed**
Subject: Update applied — Port A Local
```
[Name] — update is live on theportalocal.com. You can refresh the listing to confirm.

If there's anything else you want tweaked, just reply.

— The Port A Local
```

**Template: Customer booking follow-up**
Subject: Re: Your Port A Local booking
```
Hi [Name],

Thanks for reaching out. I pulled up your booking — [details].

[Response to their question.]

Anything else you need, just reply here.

— The Port A Local
```

**Template: Press / media inquiry**
Subject: Re: Port A Local press inquiry
```
Thanks for reaching out. Happy to help where we can.

PAL is a local directory + editorial platform for Port Aransas, owned by Palm Family Ventures, LLC. We're happy to confirm basic facts, share quotes, or point you to sourced material from our Heritage and Dispatch sections.

What's the angle and what's your deadline?

— The Port A Local
```

**Template: Polite decline (solicitation)**
Subject: Re: [their subject]
```
Thanks for the note — we're not looking to add services right now. Appreciate you reaching out.

— The Port A Local
```

---

## admin@theportalocal.com — ops inbox

No autoresponder (internal account, don't want infra providers getting bounce-loops).

### Filters / labels
Create labels:
- `Stripe` — payouts, disputes, API notifications
- `Twilio` — A2P updates, campaign alerts, invoice
- `Resend` — bounces, domain verification, API alerts
- `Vercel` — deploys, errors, billing
- `GSC` — Search Console alerts, indexing issues
- `Workspace` — Google admin notifications
- `Vendor Claims` — cart vendors replying to claim a lead
- `Tag Queue` — Know This Place submissions (already wired via Resend)

Filter rules:

| If message has | Action |
|---|---|
| From contains `@stripe.com` | Apply `Stripe` |
| From contains `@twilio.com` OR subject contains `A2P` | Apply `Twilio`, star |
| From contains `@resend.com` OR subject contains `Resend` | Apply `Resend` |
| From contains `@vercel.com` | Apply `Vercel` |
| From contains `@google.com` AND subject contains `Search Console` | Apply `GSC` |
| Subject contains `I can take this` OR `I'll take` OR `Claiming` OR `Claim this lead` | Apply `Vendor Claims`, star, mark important |
| Subject contains `Know This Place` OR `tag suggestion` | Apply `Tag Queue` |

---

## bookings@theportalocal.com — Resend transactional sender

Used only for outbound (Resend sends from this address). Inbound handling:

### Option A (recommended): forward all inbound to hello@
- Settings → Forwarding and POP/IMAP → "Add a forwarding address" → `hello@theportalocal.com` → verify via click
- Enable: "Forward a copy of incoming mail to hello@theportalocal.com and archive the Port A Local copy"
- Then customer replies to transactional emails end up in hello@ where humans actually read them.

### Option B: autoresponder pointing to hello@
Only if Winston doesn't want forwarding. Vacation responder:
```
Thanks for writing back. This inbox is used for automated booking confirmations — for help with your booking, reply to hello@theportalocal.com and we'll get back within 24 hours.

— The Port A Local
```

### Filters (if forwarding): minimal
- Resend bounces → label `Bounces` (optional, for infra health tracking)

---

## Setup checklist (one-time, ~20 minutes total)

1. **hello@** — add vacation responder, create 5 labels, set 5 filter rules, save 5 canned-response templates.
2. **admin@** — create 8 labels, set ~8 filter rules. No responder.
3. **bookings@** — set forwarding to hello@ and verify. (Or use the Option B responder.)
4. Test each filter with a known-matching email from another account.
5. Spot-check hello@ vacation responder by emailing from a personal account.

## Layer 2 — server-side (future)

When the cart marketplace click-to-claim ships (Vercel KV), vendor replies to claim leads should fire a webhook to PAL's server that updates claim state and notifies the customer. Options:
- **Resend inbound** — route `claim@theportalocal.com` to a webhook that parses the reply and marks the lead claimed.
- **SendGrid Inbound Parse** — same pattern, different vendor.
- **Google Workspace API** — pull recent threads and parse (heavier).

This is part of the cart marketplace buildout, not Layer 1.
