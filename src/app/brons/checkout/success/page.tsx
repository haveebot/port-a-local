import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Bron's Beach Rentals — checkout success page.
 * Customer lands here after completing Stripe checkout.
 */
export default function BronsSuccessPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-6">🏖</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
        You're set up.
      </h1>
      <p className="text-lg text-[#1a3a52]/80 mb-2">
        Your reservation is confirmed. We just sent your confirmation by
        email.
      </p>
      <p className="text-sm text-[#1a3a52]/70 mb-10">
        Our crew will text you the morning of your rental with the exact
        setup time. If you need to reach us before then — text the same
        number we'll text from.
      </p>

      <div className="bg-white rounded-2xl border border-[#1a3a52]/10 p-6 mb-8 text-left">
        <p className="text-xs uppercase tracking-widest text-[#1a3a52]/60 mb-2">
          What's next
        </p>
        <ul className="space-y-3 text-sm text-[#1a3a52]/85">
          <li>
            <strong>Morning of:</strong> Crew texts you the setup time
            window. Usually within an hour of sunrise.
          </li>
          <li>
            <strong>At your spot:</strong> They set everything up exactly
            where you asked. You don't need to be there for the setup —
            we know where to find you.
          </li>
          <li>
            <strong>End of day:</strong> Crew swings back and breaks it
            down. You don't haul anything home.
          </li>
          <li>
            <strong>Need to change something:</strong> Text us. We're
            flexible — wind shifts, plans change.
          </li>
        </ul>
      </div>

      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-full bg-[#1a3a52] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#2a4a63]"
      >
        ← Back to Bron's
      </Link>
    </main>
  );
}
