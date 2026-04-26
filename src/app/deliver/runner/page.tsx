import type { Metadata } from "next";
import Link from "next/link";
import RunnerSignupForm from "./RunnerSignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drive for PAL Delivery — make money during your beach day",
  description:
    "Independent runner spots open in Port Aransas. Pickup at restaurants, deliver to vacation rentals. Set your own hours. 100% of tip yours.",
};

export default function RunnerSignup() {
  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-[10px] tracking-widest uppercase text-coral-300 mb-1">
            Port A Local · Delivery
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Drive for PAL Delivery.
          </h1>
          <p className="text-sand-300 font-light mt-3 max-w-2xl text-sm sm:text-base">
            Local runners only. Pick up at restaurants, deliver to beach
            rentals. We send you the job, you tap to claim, you keep 100% of
            the tip plus a per-delivery fee. Set your own hours.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
            How it works
          </h2>
          <ol className="space-y-3 text-sm text-navy-700 font-light">
            <li>
              <strong className="text-navy-900">1. Sign up below.</strong> We
              call you, run a quick fit check, send you a unique driver link.
            </li>
            <li>
              <strong className="text-navy-900">2. Get the ping.</strong> When
              a new order comes in, every active runner gets a text + email
              with the pickup, drop, and what you&apos;d earn.
            </li>
            <li>
              <strong className="text-navy-900">3. Tap to claim.</strong> First
              runner to tap wins. No bidding, no surge games.
            </li>
            <li>
              <strong className="text-navy-900">4. Pick up + deliver.</strong>{" "}
              We pay the restaurant from PAL&apos;s card-on-file at pickup. You
              just drive and drop.
            </li>
            <li>
              <strong className="text-navy-900">5. Get paid daily.</strong>{" "}
              Venmo each evening. Tips go straight to you.
            </li>
          </ol>

          <h3 className="font-display text-base font-bold text-navy-900 mt-8 mb-2">
            What we&apos;re looking for
          </h3>
          <ul className="space-y-1 text-sm text-navy-700 font-light list-disc list-inside">
            <li>You actually live in or around Port A</li>
            <li>Reliable vehicle (car, truck, golf cart — your call)</li>
            <li>A smartphone you actually answer</li>
            <li>You can read a vibe — these are vacation deliveries, not Uber Eats</li>
          </ul>

          <p className="text-xs text-navy-500 font-light mt-6">
            We&apos;re intentionally small at first. A handful of runners we
            trust, then we grow as PAL Delivery does. No app to download.
          </p>
        </div>

        <div>
          <RunnerSignupForm />
        </div>
      </div>
    </main>
  );
}
