import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import LighthouseMark from "@/components/brand/LighthouseMark";
import EnablePushButton from "@/components/push/EnablePushButton";
import { cartVendors } from "@/data/cart-vendors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enable cart-rental alerts — PAL Carts",
  description:
    "Get an OS-level alert the second a new PAL cart booking lands. First to claim wins.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CartVendorNotifyPage({ params }: Props) {
  const { slug } = await params;
  const vendor = cartVendors.find((v) => v.slug === slug);
  if (!vendor) notFound();

  return (
    <main className="min-h-screen bg-sand-50">
      <Navigation />

      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/rent/vendor"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              PAL Carts · Vendor alerts
            </span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 leading-[1.1] tracking-tight">
            Instant cart-lead alerts
          </h1>
          <p className="mt-3 text-sand-200 text-base">
            For <span className="text-sand-50 font-semibold">{vendor.name}</span>
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
                  When a customer books through PAL,
                </span>{" "}
                every cart vendor with alerts on gets a push the same
                moment. First to reply / claim wins.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  Email still goes out
                </span>{" "}
                in parallel — push is the speed layer, email is the
                durable channel.
              </li>
              <li>
                <span className="font-semibold text-navy-900">
                  No commitment.
                </span>{" "}
                Claim what fits, ignore what doesn&apos;t. The rest
                rolls to the next vendor.
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
                  Install PAL on your phone:
                </span>{" "}
                tap your browser&apos;s Share button → <em>Add to Home
                Screen</em>. (iPhone needs Safari; Android works
                in Chrome.)
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
            </ol>
          </div>

          <EnablePushButton
            subscriberKind="cart-vendor"
            subscriberId={vendor.slug}
            enableLabel="Enable cart-lead alerts"
            onLabel="Cart-lead alerts on"
          />

          <p className="text-xs text-navy-500 leading-relaxed">
            Bookmark this page — re-open it on any phone where you
            want alerts. To turn alerts off, open your browser
            settings for theportalocal.com → Notifications → Block.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
