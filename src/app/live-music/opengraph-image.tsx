import { brandedOG, ogSize, ogContentType } from "@/lib/brandedOG";
import { liveMusicHeadline } from "@/data/live-music";

export const alt = "Live Music in Port Aransas";
export const size = ogSize;
export const contentType = ogContentType;
// liveMusicHeadline() is sync; without this Next.js statically optimizes the
// PNG at build time and serves yesterday's lineup forever. Match dispatch/[slug]
// + events/[slug] which use the same flag.
export const dynamic = "force-dynamic";

export default function Image() {
  const h = liveMusicHeadline();
  return brandedOG({
    where: "Discover",
    what: "Live Music",
    pngIcon: "music-note",
    title: h.title,
    subtitle: h.ogSubtitle,
    body: "Seven days · seven spots",
    path: "/live-music",
    category: "live-music",
  });
}
