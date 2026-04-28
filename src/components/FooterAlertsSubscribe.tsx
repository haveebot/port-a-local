"use client";

/**
 * Footer alerts subscribe row — global opt-in surface.
 *
 * One subscribe call covers BOTH alert surfaces:
 *   - site banner (warning / critical via /wheelhouse/alerts)
 *   - emergency events (every event + update via /wheelhouse/emergency)
 *
 * Both fire to the same customer-topic / 'emergencies' subscription
 * pool, so a visitor who taps once is covered for everything PAL
 * pushes. Info-tier banners (fireworks, graduations) intentionally
 * skip push — they show on-site only.
 *
 * Lives in the global Footer so opt-in is reachable from every page,
 * not just /emergency. Calm, low-friction framing — the "subscribe"
 * surface should be there before the next storm, not introduced
 * mid-crisis.
 */
import EnablePushButton from "@/components/push/EnablePushButton";

export default function FooterAlertsSubscribe() {
  return (
    <div className="border-t border-navy-800 pt-8 pb-2 mb-2">
      <div className="flex items-start gap-4 max-w-2xl mx-auto sm:mx-0 flex-wrap sm:flex-nowrap">
        <div className="text-2xl shrink-0" aria-hidden>
          🔔
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-bold text-sand-50">
            Get an alert when it matters.
          </p>
          <p className="text-xs text-navy-300 font-light leading-relaxed mt-1 max-w-md">
            Hurricane warnings, evacuation orders, road closures, water
            advisories — pushed to your phone the moment they land. No
            account, no spam. Community announcements show on the site
            but won&apos;t buzz your phone.
          </p>
          <div className="mt-3 max-w-xs">
            <EnablePushButton
              subscriberKind="customer-topic"
              subscriberId="emergencies"
              enableLabel="Enable PAL alerts"
              onLabel="Alerts on"
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
