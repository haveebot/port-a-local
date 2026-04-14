import Link from "next/link";
import { categories } from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white pt-20 pb-8 relative">
      {/* Top coral line */}
      <div className="absolute top-0 left-0 right-0 coral-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="block mb-5">
              <span className="font-display text-2xl font-bold text-coral-400 tracking-wide">
                PORT A LOCAL
              </span>
              <span className="block text-[10px] text-navy-500 font-medium tracking-[0.3em] uppercase mt-0.5">
                Port Aransas, TX
              </span>
            </Link>
            <p className="text-navy-300 leading-relaxed max-w-xs text-sm font-light">
              A community-driven guide to Port Aransas. Every business is
              vetted by locals. No paid placements, no corporate sponsors.
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
                    className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-coral-400 mb-5">
              Features
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/gully"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  🔍 Gully Search
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  📖 Port A Heritage
                </Link>
              </li>
              <li>
                <Link
                  href="/rent"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  🛺 Golf Cart Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/beach"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  🏖️ Beach Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/maintenance"
                  className="text-navy-300 hover:text-coral-300 transition-colors text-sm"
                >
                  🔧 Maintenance
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
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-500">
            &copy; {new Date().getFullYear()} Port A Local. Made on the island.
          </p>
          <div className="flex items-center gap-6 text-xs text-navy-500">
            <a href="mailto:hello@theportalocal.com" className="hover:text-coral-400 transition-colors">Contact</a>
            <Link href="/privacy" className="hover:text-coral-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-coral-400 transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
