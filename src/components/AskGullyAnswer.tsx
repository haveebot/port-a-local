"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GullyItem } from "@/lib/gullySearch";
import { getGullyHref } from "@/lib/gullySearch";

const DEBOUNCE_MS = 700;

interface CitedSlug {
  slug: string;
  name: string;
  type: string;
  category: string;
}

interface AskResponse {
  ok: boolean;
  answer?: string;
  citedSlugs?: CitedSlug[];
  reason?: string;
  skipped?: boolean;
}

/** Same heuristic as server (lib/gullyAsk.ts) — keep in sync. */
function looksLikeQuestion(q: string): boolean {
  const trimmed = q.trim().toLowerCase();
  if (trimmed.length < 4) return false;
  if (trimmed.endsWith("?")) return true;
  return /^(what|who|where|when|why|how|can|could|should|would|is|are|do|does|will|which|whose|tell me|find me|recommend|suggest|show me)\b/.test(
    trimmed,
  );
}

/**
 * Parse Claude's [Name](slug) markdown citations and render as Link
 * components routed through getGullyHref. Anything not matching the
 * pattern renders as plain text.
 */
function renderAnswerWithCitations(
  answer: string,
  citedSlugs: CitedSlug[],
): React.ReactNode[] {
  const slugMap = new Map(citedSlugs.map((c) => [c.slug, c]));
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      parts.push(answer.slice(lastIndex, match.index));
    }
    const [, label, slug] = match;
    const cited = slugMap.get(slug);
    if (cited) {
      const item: GullyItem = {
        type: cited.type as GullyItem["type"],
        slug: cited.slug,
        name: cited.name,
        tagline: "",
        description: "",
        tags: [],
        category: cited.category,
      };
      parts.push(
        <Link
          key={`cite-${key++}`}
          href={getGullyHref(item)}
          className="text-coral-700 underline decoration-coral-400/60 underline-offset-2 hover:decoration-coral-600 hover:text-coral-800 font-semibold"
        >
          {label}
        </Link>,
      );
    } else {
      // Slug not in citedSlugs — render plain text (Claude may have
      // referenced something that wasn't in top results)
      parts.push(<span key={`txt-${key++}`}>{label}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < answer.length) {
    parts.push(answer.slice(lastIndex));
  }
  return parts;
}

export default function AskGullyAnswer({ query }: { query: string }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [citedSlugs, setCitedSlugs] = useState<CitedSlug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedQuery, setResolvedQuery] = useState<string>("");

  useEffect(() => {
    const trimmed = query.trim();
    // Reset when query no longer looks like a question
    if (!looksLikeQuestion(trimmed)) {
      setAnswer(null);
      setCitedSlugs([]);
      setLoading(false);
      setError(null);
      setResolvedQuery("");
      return;
    }
    // If we already have an answer for this exact query, no-op
    if (resolvedQuery === trimmed && answer) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch("/api/gully/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });
        if (cancelled) return;
        const data = (await res.json()) as AskResponse;
        if (cancelled) return;
        if (!data.ok || !data.answer) {
          setAnswer(null);
          setCitedSlugs([]);
          setError(null);
          setResolvedQuery("");
        } else {
          setAnswer(data.answer);
          setCitedSlugs(data.citedSlugs ?? []);
          setResolvedQuery(trimmed);
        }
      } catch (err) {
        if (cancelled) return;
        setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, resolvedQuery, answer]);

  if (!looksLikeQuestion(query)) return null;
  if (!loading && !answer && !error) return null;

  return (
    <div className="bg-gradient-to-br from-coral-50 to-sand-50 border-2 border-coral-300/60 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-coral-700 font-bold font-mono">
          Ask Gully
        </span>
        <span className="text-[10px] text-navy-400 font-mono">
          · powered by Heye Lab
        </span>
        {loading && (
          <span className="text-[10px] text-coral-600 italic ml-auto">
            thinking…
          </span>
        )}
      </div>
      {answer ? (
        <p className="text-[15px] leading-relaxed text-navy-800">
          {renderAnswerWithCitations(answer, citedSlugs)}
        </p>
      ) : loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-coral-200/40 rounded animate-pulse w-full" />
          <div className="h-3 bg-coral-200/40 rounded animate-pulse w-4/5" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-coral-700">
          Couldn&apos;t reach Gully right now — scroll for the regular results.
        </p>
      ) : null}
    </div>
  );
}
