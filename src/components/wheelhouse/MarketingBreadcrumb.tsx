import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  /**
   * Trail of locations leading to (but not including) the current page.
   * Renders as 🏠 Marketing  ›  Social Queue  ›  📚 Bank
   * The last crumb is current — no link, just label.
   */
  crumbs: Crumb[];
  /** Current page label (last crumb, not linked) */
  current: string;
  /** Optional right-side action (e.g. a quick-link button) */
  right?: React.ReactNode;
}

/**
 * Persistent breadcrumb header for marketing-scoped pages. Replaces
 * the single "← Wheelhouse" back-arrow pattern with a full trail —
 * one tap home from any depth. Designed for non-technical operators
 * (Collie) who think in destinations not directory paths.
 *
 * Usage:
 *   <MarketingBreadcrumb
 *     crumbs={[{ label: "🏠 Marketing", href: "/wheelhouse/marketing" }]}
 *     current="📱 Social Queue"
 *   />
 */
export default function MarketingBreadcrumb({ crumbs, current, right }: Props) {
  return (
    <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs flex-wrap min-w-0">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {c.href ? (
                <Link
                  href={c.href}
                  className="text-navy-300 hover:text-coral-300 transition-colors whitespace-nowrap"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="text-navy-400 whitespace-nowrap">{c.label}</span>
              )}
              <span className="text-navy-500">›</span>
            </span>
          ))}
          <span className="font-display font-bold text-sand-50 whitespace-nowrap truncate">
            {current}
          </span>
        </nav>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
