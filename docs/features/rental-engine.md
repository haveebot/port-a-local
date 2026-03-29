# Feature Spec: Rental Engine
_Status: Draft | Priority: High | Author: Winston + Havee_
_V1 Product: Golf Cart Rentals (expandable to all rental categories)_

---

## Summary
A rental booking engine that connects customers with local rental vendors through a tiered availability system. The platform collects a small reservation fee per day booked, the customer receives a vendor discount that more than offsets that fee, and the vendor receives a qualified booking cheaper than any marketing channel they could run themselves. Everyone wins.

---

## V1 Product: Golf Cart Rentals
Golf carts are the #1 way visitors get around Port Aransas. High demand, contained inventory, and a direct ownership stake in Tier 1 (JOY Cart Rentals) makes this the perfect product to build and test the rental engine before expanding to other categories.

---

## Customer Booking Flow

Customer selects:
1. **Pickup date & time**
2. **Return date & time**
3. **Cart size** — 4, 6, or 8 passenger
4. **Delivery or self-pickup**

All fields required. Clean, simple, no friction.

---

## Pricing Model

### Reservation Fee (platform revenue)
- Customer pays a per-day reservation fee at time of booking (e.g. ~$10/day)
- This is the platform's revenue — collected upfront, pure margin
- Displayed clearly as a reservation/booking fee

### Vendor Discount (customer benefit)
- Customer receives a discount on the vendor's rental price that exceeds the reservation fee
- Example: $10/day reservation fee → $20/day discount off vendor price
- Net result: customer saves money vs. booking direct, platform earns fee, vendor gets a sale
- **5-day example:**
  - Customer pays platform: $50 in reservation fees
  - Customer saves at vendor: $100 off rental price
  - Customer net savings: $50
  - Platform revenue: $50
  - Vendor cost of acquisition: less than any marketing alternative

### Vendor Payment
- Customer pays the vendor directly at time of cart pickup (minus their discount)
- Platform does not process the full rental payment — only the reservation fee
- Keeps payment infrastructure simple, reduces platform liability

---

## Inventory & Availability System

### Vendor Fleet Allotment
- Each vendor commits a set number of carts to the platform (e.g. JOY allocates 20 carts)
- Platform manages reservations against that allotment
- Vendor receives a ping for each confirmed reservation — no overbooking possible

### Tiered Vendor Routing
1. Reservation request comes in for requested dates + cart size
2. **Tier 1 vendor** (JOY Cart Rentals) checked first — if inventory available, they are pinged to confirm
3. If Tier 1 declines or has no inventory → **Tier 2 vendor** is automatically checked
4. Process continues down tier list until reservation is confirmed
5. Customer is notified once confirmed, with vendor first name and company name only — no direct contact info shared

### When All Inventory Is Exhausted
- **The Local Team takes over** — platform alerts Winston/Nick directly
- We work our network and make something happen — always
- Customer never sees "sorry, nothing available"
- Customer sees: "We're working on it — our local team is finding your cart"
- This guarantee is a core differentiator — no other platform can offer it

---

## Cancellation & Modification Policy

### Cancellations
- **Inside 72-hour window:** full reservation fee refund
- **Outside 72-hour window:** reservation fee is non-refundable
- Policy is clearly communicated at time of booking — tourists understand fair cancellation windows

### Date Changes
- Reservation fee is **transferrable to new dates** at any time within reason
- Goal: satisfy the customer and keep the booking in the ecosystem
- "Whatever we can do within our window" is the operating principle

---

## Confirmation & Communication

- Customer receives booking confirmation immediately after reservation fee is collected
- Vendor receives ping with full booking details (dates, cart size, pickup vs. delivery, customer first name)
- All customer ↔ vendor communication through in-app messaging only — no direct contact info shared
- Reminder notifications sent to customer before pickup date

---

## Job Lifecycle

```
CUSTOMER SELECTS DATES/CART → RESERVATION FEE COLLECTED
        ↓
TIERED ROUTING → VENDOR CONFIRMS AVAILABILITY
        ↓
BOOKING CONFIRMED → CUSTOMER & VENDOR NOTIFIED
        ↓
CUSTOMER PICKS UP CART → PAYS VENDOR DIRECTLY (minus discount)
        ↓
RENTAL PERIOD
        ↓
CART RETURNED → BOOKING CLOSED
        ↓
REVIEW PROMPTED (both parties)
```

---

## Review & Rating System
- Customer rates vendor after return (1-5 stars + written review)
- Vendor can rate customer (internal only)
- Ratings inform tier placement over time

---

## Admin Dashboard Requirements
- View all active/upcoming/completed reservations
- Monitor vendor inventory allotments and availability
- Override routing manually when needed
- Receive alert when all tiers are exhausted (Local Team escalation)
- Cancellation and refund management
- Revenue tracking (reservation fees collected by day/week/month)

---

## Vendor App Requirements
- Set and update fleet allotment for the platform
- Receive push notification for new reservations
- Accept / Decline reservation
- View upcoming reservation calendar
- View booking history and platform-generated revenue

---

## Customer App Requirements
- Search availability by dates and cart size
- Complete booking and pay reservation fee
- View and manage upcoming reservations
- Modify dates or cancel within policy window
- Receive reminders before pickup
- Leave review after return

---

## Future Rental Categories
The engine is built once and expanded. Future products:
- Beach equipment (umbrellas, chairs, tents)
- Bikes & e-bikes
- Watersports equipment (kayaks, paddleboards)
- Vacation rentals / beach houses
- Boat charters

---

## Notes for Nick
- Reservation fee payment processing via Stripe (simple single charge, not the full authorize/capture flow used in maintenance portal)
- Vendor allotment system needs real-time inventory tracking — prevent double-booking across tiers
- Consider calendar sync (Google Calendar / iCal) for vendor convenience
- Local Team escalation = push alert to Winston & Nick's phones when all tiers exhausted
- _Nick — please review and add technical thoughts. Winston has signed off._

---
_Last updated: 2026-03-29_
