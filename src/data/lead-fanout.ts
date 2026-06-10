/**
 * Global switch for AUTOMATIC new-booking vendor fan-out.
 *
 * While true, NO vendor is auto-notified of new bookings — no beach lead
 * blasts, no cart first-look windows, no open blasts (SMS or email). Every
 * new booking lands UNASSIGNED; the operator ping + booking email still
 * fire, and the operator routes each job manually via the rentals tool.
 *
 * Comms on bookings already assigned to a vendor are unaffected: day-before
 * crew reminders, claim confirmations, operator Send-updates, and manual
 * reassignment all keep working.
 *
 * Set 2026-06-10 (operator direction: "we will receive the rentals and
 * decide where they go independently for now"). Flip to false to restore
 * automatic fan-out — the per-vendor `leadBlasts` flags still apply
 * underneath.
 */
export const NEW_LEAD_FANOUT_PAUSED = true;
