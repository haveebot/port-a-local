# John Brown — Port A Maintenance Services
_Last updated: 2026-04-10_

## Who He Is
Owner of Port A Maintenance Services. Port Aransas local. Our anchor vendor for the [[Maintenance Portal]].

## Contact
- **Phone:** (361) 455-8606
- **Email:** configured via `JOHN_BROWN_EMAIL` env var on Vercel

## Relationship
- Tier 1 vendor for all maintenance requests submitted through `/maintenance`
- Receives SMS + email notification for every new request
- Handles: General Repair, Carpentry, Painting, Plumbing, Electrical, HVAC, Landscaping
- Customers contact him directly after we route the lead

## What He Knows About Us
- We route maintenance requests to him through Port A Local
- He is our exclusive maintenance vendor (for now)

## Notes
- Env vars: `JOHN_BROWN_PHONE`, `JOHN_BROWN_EMAIL` set in Vercel
- SMS via Twilio (pending 361 local number upgrade)
- Email via Resend

## Open Items
- [ ] Confirm he has received test submissions
- [ ] Discuss exclusivity terms as volume grows
- [ ] Get his email address into Vercel env vars
