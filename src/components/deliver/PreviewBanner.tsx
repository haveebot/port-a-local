/**
 * Beta-mode banner shown on /deliver/* whenever DELIVER_PUBLIC_LAUNCH !== "true".
 * Honest framing: real menus, real interest collection, but order *requests*
 * route to admin@ as email (no charge) instead of triggering Stripe + dispatch.
 */
export default function PreviewBanner() {
  return (
    <div className="bg-amber-400 text-navy-900 border-b border-amber-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 text-center text-xs sm:text-sm font-semibold">
        <span className="font-bold tracking-widest uppercase text-[10px] mr-2">
          Beta
        </span>
        Order requests come straight to us. No charge yet — we&apos;ll text you
        once a driver claims it. Help us shape the launch.
      </div>
    </div>
  );
}
