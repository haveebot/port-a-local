"use client";

import { useState, useEffect } from "react";
import type { LibraryImage } from "@/data/image-library-store";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (imageUrl: string) => void;
}

/**
 * Modal grid of Bank images. Click one → calls onPick(url) → parent
 * sets image_url on the post. Filename search input for narrowing
 * once the Bank gets large.
 *
 * Loaded fresh on each open (no client cache) so newly-added images
 * appear without a refresh.
 */
export default function BankPicker({ open, onClose, onPick }: Props) {
  const [images, setImages] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setImages(null);
    setError(null);
    fetch("/api/wheelhouse/library")
      .then((r) => r.json())
      .then((d: { images?: LibraryImage[]; error?: string }) => {
        if (d.images) setImages(d.images);
        else setError(d.error ?? "Failed to load Bank");
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [open]);

  if (!open) return null;

  const filtered = images?.filter((img) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      img.filename.toLowerCase().includes(q) ||
      (img.altText ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-navy-900/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden"
      >
        <div className="bg-navy-900 text-sand-100 px-5 py-4 flex items-center justify-between gap-4">
          <h3 className="font-display font-bold">📚 Pick from the Bank</h3>
          <button
            onClick={onClose}
            className="text-navy-300 hover:text-coral-300 text-xs"
          >
            ✕ Close
          </button>
        </div>
        <div className="p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or alt text…"
            className="w-full mb-4 text-sm bg-sand-50 border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral-300"
          />
          {error && (
            <p className="text-xs text-coral-700 bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}
          {!images ? (
            <p className="text-sm text-navy-500 italic text-center py-8">
              Loading…
            </p>
          ) : filtered && filtered.length === 0 ? (
            <p className="text-sm text-navy-500 italic text-center py-8">
              {search
                ? "No matches. Try a different filename or alt text."
                : "Bank is empty. Upload one from this card or visit /wheelhouse/social/bank."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
              {filtered?.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    onPick(img.url);
                    onClose();
                  }}
                  className="group rounded-lg overflow-hidden border border-sand-300 hover:border-coral-500 hover:ring-2 hover:ring-coral-300 transition-all text-left"
                >
                  <div className="aspect-square bg-sand-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.altText ?? img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="px-2 py-1.5 text-[10px] text-navy-600">
                    <p className="truncate font-mono" title={img.filename}>
                      {img.filename}
                    </p>
                    {img.usageCount > 0 && (
                      <p className="text-emerald-700 font-semibold">
                        used {img.usageCount}×
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
