"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Drag-drop or click-to-upload zone at the top of the Bank page.
 * Posts to /api/wheelhouse/library (which writes to Blob + inserts
 * into pal_image_library catalog). Triggers router.refresh on success
 * so the new image appears in the grid below without a hard reload.
 */
export default function BankUploadZone() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/wheelhouse/library", {
      method: "POST",
      body: fd,
    });
    const data = (await res.json()) as { error?: string; detail?: string };
    if (!res.ok) {
      throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    let okCount = 0;
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      try {
        await uploadOne(file);
        okCount++;
      } catch (err) {
        errors.push(
          `${file.name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    if (okCount > 0) {
      setSuccess(`${okCount} image${okCount === 1 ? "" : "s"} added.`);
      router.refresh();
    }
    if (errors.length > 0) {
      setError(errors.join(" · "));
    }
    setBusy(false);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-coral-500 bg-coral-50"
            : busy
              ? "border-navy-300 bg-navy-50"
              : "border-sand-300 bg-sand-50 hover:border-coral-300 hover:bg-coral-50/40"
        }`}
      >
        <p className="text-sm text-navy-700 font-semibold mb-1">
          {busy ? "Uploading…" : "Drop images here"}
        </p>
        <p className="text-xs text-navy-500 mb-4">
          or
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50"
        >
          📤 Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={busy}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[10px] text-navy-400 mt-3">
          PNG / JPG / WEBP · ≤8MB each · multi-select supported
        </p>
      </div>
      {success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3">
          ✓ {success}
        </p>
      )}
      {error && (
        <p className="text-xs text-coral-700 bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mt-3 whitespace-pre-wrap">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
