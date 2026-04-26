/**
 * Sitewide banner shown on /locals/*. The Locals marketplace launches
 * with no listings — providers come in via /locals/offer. This banner
 * sets honest expectations until supply density grows.
 */
export default function LocalsBetaBanner() {
  return (
    <div className="bg-amber-400 text-navy-900 border-b border-amber-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 text-center text-xs sm:text-sm font-semibold">
        <span className="font-bold tracking-widest uppercase text-[10px] mr-2">
          New
        </span>
        Brand-new marketplace — listings fill in as locals sign up. Want
        what you don&apos;t see? Tell us, we&apos;ll find it.
      </div>
    </div>
  );
}
