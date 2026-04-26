import Link from "next/link";
import { categories } from "@/data/categories";
import LighthouseMark from "@/components/brand/LighthouseMark";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white pt-20 pb-8 relative overflow-hidden">
      {/* Top coral line */}
      <div className="absolute top-0 left-0 right-0 coral-line" />

      {/* Watermark lighthouse in the corner */}
      <div className="absolute -bottom-20 -right-16 opacity-[0.05] pointer-events-none hidden sm:block">
        <LighthouseMark size={420} variant="light" detail="full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <LighthouseMark size={40} variant="light" detail="standard" />
              <span className="flex flex-col">
                <span className="font-display text-xl font-bold text-coral-400 tracking-wide leading-none">
                  PORT A LOCAL
                </span>
                <span className="block text-[10px] text-navy-500 font-medium tracking-[0.3em] uppercase mt-1">
                  Port Aransas, TX
                </span>
              </span>
            </Link>
            <p className="text-navy-300 leading-relaxed max-w-xs text-sm font-light">
              A community-driven guide to Port Aransas. Every business vetted
              by locals. No paid placements, no corporate sponsors.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-coral-400 mb-5">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                  >
                    <PortalIcon name={cat.slug as PortalIconName} className="w-3.5 h-3.5 text-coral-400 shrink-0" /> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-coral-400 mb-5">
              Discover
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/gully"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="search" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Gully Search
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="heritage" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Heritage
                </Link>
              </li>
              <li>
                <Link
                  href="/dispatch"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="dispatch" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Dispatch
                </Link>
              </li>
              <li>
                <Link
                  href="/archives"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="archives" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Archives
                </Link>
              </li>
              <li>
                <Link
                  href="/deliver"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="eat" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/deliver/runner"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="services" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Drive for PAL
                </Link>
              </li>
              <li>
                <Link
                  href="/locals"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="services" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Locals (rent + hire)
                </Link>
              </li>
              <li>
                <Link
                  href="/locals/offer"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="services" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> List on Locals
                </Link>
              </li>
              <li>
                <Link
                  href="/rent"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="cart" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Golf Cart Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/beach"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="beach" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Beach Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/maintenance"
                  className="inline-flex items-center gap-2 text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  <PortalIcon name="maintenance" className="w-3.5 h-3.5 text-coral-400 shrink-0" /> Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-coral-400 mb-5">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/#about"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@theportalocal.com"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@theportalocal.com?subject=Get%20Listed%20on%20Port%20A%20Local"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  Get Listed
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@theportalocal.com?subject=Dispatch%20Tip"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  Send a Tip
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Coordinates masthead strip */}
        <div className="pt-8 pb-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.15em] text-navy-500">
            <span>27°50′N</span>
            <span className="w-1 h-1 rounded-full bg-coral-500" />
            <span>97°03′W</span>
            <span className="w-1 h-1 rounded-full bg-coral-500" />
            <span className="uppercase">Mustang Island</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.15em] text-navy-500 uppercase">
            <span>Est. 2026</span>
            <span className="w-1 h-1 rounded-full bg-coral-500" />
            <span>Palm Family Ventures, LLC</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-500">
            &copy; {new Date().getFullYear()} Port A Local. Made on the island.
          </p>
          <div className="flex items-center gap-6 text-xs text-navy-500">
            <a
              href="mailto:hello@theportalocal.com"
              className="hover:text-coral-400 transition-colors"
            >
              Contact
            </a>
            <Link
              href="/privacy"
              className="hover:text-coral-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-coral-400 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
