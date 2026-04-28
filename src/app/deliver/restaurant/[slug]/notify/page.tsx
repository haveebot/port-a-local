import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import LighthouseMark from "@/components/brand/LighthouseMark";
import EnablePushButton from "@/components/push/EnablePushButton";
import { getRestaurant } from "@/data/delivery-restaurants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enable order alerts — PAL Delivery",
  description:
    "Get an OS-level alert the second a new PAL Delivery order pays out. Start prep before the runner pulls up.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantNotifyPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();

  return (
    <main className="min-h-screen bg-sand-50">
      <Navigation />

      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/deliver/restaurant"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              PAL Delivery · Restaurant alerts
            </span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 leading-[1.1] tracking-tight">
            Instant order alerts
          </h1>
          <p className="mt-3 text-sand-200 text-base">
            For{" "}
            <span className="text-sand-50 font-semibold">
              {restaurant.name}
            </span>
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">
              How it works
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-navy-700 leading-relaxed">
              <li>
                <span className="font-semibold text-navy-900">
                  When a customer pays for a PAL order from your kitchen,
                </span>{" "}
                anyone subscribed gets a push the same moment.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  The push shows item count + total
                </span>{" "}
                so you can start prep without opening anything else.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  Tap the alert
                </span>{" "}
                to open the full order detail (items, notes,
                pickup-ready window).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">
              Set it up (one-time)
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-navy-700 leading-relaxed list-decimal pl-5">
              <li>
                <span className="font-semibold text-navy-900">
                  Install PAL on the kitchen tablet/phone:
                </span>{" "}
                tap your browser&apos;s Share button → <em>Add to Home
                Screen</em>. (iPhone needs Safari; Android works in
                Chrome.)
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  Open PAL from the new home-screen icon
                </span>{" "}
                — not the browser tab.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  Tap the button below
                </span>{" "}
                and accept the notifications prompt.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  Repeat on every device
                </span>{" "}
                you want alerts on (counter tablet, line phone, GM
                phone — all of them get the alert in parallel).
              </li>
            </ol>
          </div>

          <EnablePushButton
            subscriberKind="restaurant"
            subscriberId={restaurant.id}
            enableLabel="Enable order alerts"
            onLabel="Order alerts on"
          />

          <p className="text-xs text-navy-500 leading-relaxed">
            Bookmark this page on each device. To turn alerts off,
            open your browser settings for theportalocal.com →
            Notifications → Block.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
