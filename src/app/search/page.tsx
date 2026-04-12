import { redirect } from "next/navigation";

export default function SearchRedirect({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q;
  redirect(q ? `/gully?q=${encodeURIComponent(q)}` : "/gully");
}
