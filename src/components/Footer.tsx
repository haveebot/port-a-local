import Link from "next/link";
import { categories } from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-palm-950 text-white pt-20 pb-8 relative">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 gold-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-2xl font-bold text-gold-400 tracking-wide">
                PORT A LOCAL
              </span>
              <span className="text-gold-500/60 text-xs font-medium tracking-[0.2em] uppercase">
                co
              </span>
            </div>
            <p className="text-sand-400 leading-relaxed max-w-md mb-6 font-light">
              A community-driven guide to Port Aransas, Texas. Every business is
              vetted by locals, for locals and visitors alike. No paid placements,
              no corporate sponsors — just honest recommendations.
            </p>
            <p className="text-sm text-sand-600">
              Port Aransas, TX 78373
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-sm tracking-[0.15em] uppercase text-gold-400 mb-5">
              Explore
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sand-400 hover:text-gold-300 transition-colors text-sm"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-semibold text-sm tracking-[0.15em] uppercase text-gold-400 mb-5">
              For Businesses
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sand-400 hover:text-gold-300 transition-colors text-sm"
                >
                  Get Listed
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sand-400 hover:text-gold-300 transition-colors text-sm"
                >
                  Claim Your Business
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sand-400 hover:text-gold-300 transition-colors text-sm"
                >
                  Advertising
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sand-400 hover:text-gold-300 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-palm-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sand-600">
            &copy; {new Date().getFullYear()} Port A Local Co. Made on the island.
          </p>
          <div className="flex items-center gap-6 text-sm text-sand-600">
            <Link href="#" className="hover:text-gold-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gold-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gold-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
