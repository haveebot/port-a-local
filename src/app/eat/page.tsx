import { redirect } from "next/navigation";

/**
 * /eat now redirects to /deliver — the new unified food encyclopedia
 * (every restaurant on the island, with state-based affordances:
 * 🚀 Order through PAL · 📞 Call direct · 🪑 Reservations).
 *
 * Old /eat URL is preserved as a 308 (permanent) redirect so SEO
 * authority + bookmarks + back-links still land on the right page.
 * The original CategoryPage view of editorial-curated restaurants is
 * superseded by /deliver's denser encyclopedia layout.
 */
export default function EatPage() {
  redirect("/deliver");
}
