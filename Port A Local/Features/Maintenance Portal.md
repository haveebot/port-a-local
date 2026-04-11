# Maintenance Request Portal — Feature Spec

_Status: MVP in progress_
_Last updated: 2026-04-04_

---

## What It Is
A customer-facing maintenance request form on the Port A Local website that routes service requests to vetted local vendors — starting with Port A Maintenance Services (John Brown).

## Why It Matters
- Drives users to the site for a real, recurring need (property maintenance)
- Every request is a lead — we route it, we own the relationship
- John Brown gets a steady stream of qualified jobs
- Revenue model: referral fee or flat routing fee per submitted lead
- Foundation for a full vendor portal (phase 2)

---

## MVP Scope

### Customer Form Fields
- Full Name
- Phone Number
- Email Address
- Property Address (service location)
- Service Type (dropdown):
  - General Repair / Handyman
  - Carpentry / Woodworking
  - Painting
  - Plumbing
  - Electrical
  - HVAC / AC
  - Landscaping
  - Other
- Description of Issue (text area)
- Urgency:
  - Routine (within a week)
  - Urgent (within 48 hours)
  - Emergency (ASAP)
- Preferred Contact Method (Phone / Email / Either)

### On Submit
1. ✅ SMS to John Brown — quick summary + customer callback number
2. ✅ Email to John Brown — full request details
3. ✅ Confirmation email to customer
4. ✅ Lead logged (console/admin for now, full dashboard phase 2)

---

## Tech Stack
- **Form:** Next.js page at `/maintenance`
- **API:** Next.js API route at `/api/maintenance`
- **Email:** Resend (free tier — 3,000 emails/month)
- **SMS:** Twilio (pay-as-you-go ~$0.008/message)
- **Vendor:** Port A Maintenance Services — John Brown, (361) 455-8606

---

## Environment Variables Needed
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
JOHN_BROWN_PHONE=(361) 455-8606
JOHN_BROWN_EMAIL=
PORTAL_FROM_EMAIL=noreply@portalocal.com
```

---

## Phase 2 (Post-MVP)
- Vendor dashboard — John logs in, sees all requests, updates status
- Customer status tracking — "Your request is with our team"
- Multi-vendor routing — Sandollar for HVAC, Port Plumbing for plumbing
- Lead fee payment processing
- Mobile push notifications
