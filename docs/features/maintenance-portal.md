# Feature Spec: Maintenance Request Portal
_Status: Draft | Priority: High | Author: Winston + Havee_

---

## Summary
A maintenance request portal that connects vacation rental owners on the island with trusted local vendors. Customers submit jobs, the system automatically routes to tiered vendors, and everything — acceptance, completion, payment, and reviews — happens within the platform ecosystem.

---

## Who It's For

**Primary:** Vacation rental owners (often off-island) who need reliable, fast maintenance on their properties.
**Future:** Guests/visitors staying at a property who need something fixed mid-stay.

---

## Customer Request Flow

When a customer submits a maintenance request they provide:

1. **Property address**
2. **Type of work** — category selection (plumbing, electrical, general repair, cleaning, HVAC, etc.)
3. **Urgency** — Emergency / Within 24hrs / Scheduled
4. **Description** — free text description of the issue
5. **Photos** — one or more photos of the issue (required)
6. **Preferred date/time** — for non-emergency jobs

All fields are required. No shortcuts — complete intake is what makes the service reliable.

---

## Vendor Routing — Tiered Dispatch System

Once a request is submitted, the system automatically routes it. Customers never see the tier system — they only know their job is being handled.

### How it works:
1. Request is submitted → system identifies matching vendor category(s)
2. **Tier 1 vendor** is pinged immediately (e.g. Port A Maintenance / John Brown)
3. Tier 1 has **30 minutes** to accept, decline, or let it expire
4. If no response → **Tier 2 vendor** is automatically pinged
5. Process continues down the tier list until the job is accepted
6. Customer receives a notification when their job is accepted, including vendor **first name and company name only** — no direct contact info (phone, email) is ever shared with the customer
7. All customer ↔ vendor communication happens exclusively through in-app messaging — the platform is the only contact channel, always

### Vendor tiers are:
- Set by platform admins (Winston/Nick)
- Based on relationship, reliability, and category coverage
- Never visible to customers
- Configurable per job category (e.g. plumber tier list is separate from general handyman)

---

## Job Lifecycle

```
SUBMITTED → ROUTED → ACCEPTED → IN PROGRESS → VENDOR CONFIRMS COMPLETE → CUSTOMER APPROVES → CLOSED
```

- **Vendor confirms complete** — vendor marks job done in their app, uploads completion notes/photos
- **Customer approves** — customer confirms work is satisfactory in their app
- **Both actions are logged** — full job history kept within the platform
- **Review triggered** — after customer approval, both parties are prompted to leave a rating/review

---

## Review & Rating System

- Customer rates vendor (1-5 stars + written review)
- Vendor can rate customer (internal only — helps flag problem customers)
- Reviews are visible on vendor profiles within the platform
- Rating history informs tier placement over time — great vendors move up, unreliable ones move down

---

## Revenue Model

### Layer 1 — Customer Side (no cost to vendors at base level)
- **One-time job fee** — flat fee or percentage per job, baked into customer pricing
- **Subscription plan** — monthly/annual membership that reduces per-job fees ("subscribe and save")
- Vendors at the base tier receive jobs at no cost — this is a core recruiting pitch

### Layer 2 — Vendor Enterprise (optional paid tier)
- Priority routing position
- Enhanced profile / featured placement in directory
- Analytics dashboard (jobs received, acceptance rate, revenue)
- Booking tools and calendar management
- This is separate from base directory listing — directory listings remain free and unbiased

### Core Value Props:
- Customers: "One place to get anything handled on your property"
- Vendors: "We send you work, it costs you nothing to start"
- Platform credibility: listings and routing are merit-based, not pay-to-play

---

## Admin Portal Requirements

- View all active/pending/completed jobs
- Manage vendor tiers per category
- Override routing manually if needed
- View full job history and audit trail
- Configure response window (default 30 min, adjustable per tier)
- Receive alerts for jobs that exhaust all tiers without acceptance

---

## Vendor App Requirements

- Receive push notification for new job leads
- View job details (address, category, description, photos, urgency)
- Accept / Decline with one tap
- Mark job in progress
- Mark job complete (with notes + completion photos)
- View job history and earnings
- View ratings received

---

## Customer App Requirements

- Submit maintenance requests (form + photo upload)
- Track job status in real time
- Receive push notification when job is accepted
- Approve job completion
- Leave rating/review
- View full property job history

---

## Decisions & Notes

- **In-app messaging** — YES, include in v1 at minimum for testing. Customer ↔ vendor communication stays inside the ecosystem.
- **Emergency response window** — 30 minutes for v1. Once efficiency is proven, tighten the window and use it as a marketing differentiator ("guaranteed response in X minutes").
- **Payment processing** — to be fully specced (see payment-processing.md). This is a major revenue source — platform handles end-to-end payment, not settled outside the app.
- **Future:** expand customer base to guests/visitors, not just property owners
- _Nick — please review and add any technical thoughts. Winston has signed off on the above._

---
_Last updated: 2026-03-29_
