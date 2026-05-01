"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryImage } from "@/data/image-library-store";

interface Props {
  image: LibraryImage;
}

/**
 * One card in the Bank grid. Click to expand inline editor:
 * alt text edit + soft-delete toggle. Shows usage stats so Collie
 * can see what's been deployed and what's sitting unused.
 */
export default function BankImageCard({ image }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [altText, setAltText] = useState(image.altText ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: { altText?: string | null; hidden?: boolean }) {
    const res = await fetch(`/api/wheelhouse/library/${image.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  }

  async function onSaveAlt() {
    setBusy(true);
    setError(null);
    try {
      await patch({ altText: altText || null });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onToggleHidden() {
    if (
      !image.hidden &&
      !confirm(
        `Hide this image from the Bank + picker? FB posts that already used it stay live (URL keeps working). You can restore it later.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await patch({ hidden: !image.hidden });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const sizeKb = Math.round(image.sizeBytes / 1024);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        image.hidden
          ? "border-navy-300 bg-navy-50/50 opacity-60"
          : "border-sand-300 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="block w-full aspect-square bg-sand-100 overflow-hidden focus:outline-none focus:ring-2 focus:ring-coral-300"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.altText ?? image.filename}
          className="w-full h-full object-cover"
        />
      </button>
      <div className="px-3 py-2 text-[11px] text-navy-600">
        <p className="truncate font-mono" title={image.filename}>
          {image.filename}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-navy-400">{sizeKb} KB</span>
          {image.usageCount > 0 ? (
            <span className="text-emerald-700 font-semibold">
              used {image.usageCount}×
            </span>
          ) : (
            <span className="text-navy-400 italic">unused</span>
          )}
        </div>
        {image.hidden && (
          <p className="text-[10px] text-coral-700 font-bold mt-1">HIDDEN</p>
        )}
      </div>
      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-sand-200 bg-sand-50/50 space-y-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-navy-500">
              Alt text
            </span>
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image (boosts IG + accessibility)"
              rows={2}
              className="w-full mt-1 text-xs bg-white border border-sand-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-coral-300"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveAlt}
              disabled={busy}
              className="px-3 py-1 rounded-md text-[11px] font-semibold bg-navy-900 text-sand-50 hover:bg-navy-800 disabled:opacity-50"
            >
              {busy ? "…" : "Save"}
            </button>
            <button
              onClick={onToggleHidden}
              disabled={busy}
              className="px-3 py-1 rounded-md text-[11px] font-semibold border border-sand-300 text-navy-600 hover:bg-coral-50 hover:text-coral-700 disabled:opacity-50 ml-auto"
            >
              {image.hidden ? "↺ Restore" : "✕ Hide"}
            </button>
          </div>
          {error && (
            <p className="text-[10px] text-coral-700">{error}</p>
          )}
          <p className="text-[10px] text-navy-400 font-mono break-all">
            {image.url}
          </p>
        </div>
      )}
    </div>
  );
}
