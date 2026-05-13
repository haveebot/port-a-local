"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BankPicker from "./BankPicker";

/**
 * "Write it yourself" composer — direct-create path. Operator types the
 * caption (and optional link / image / auto-send time) directly into the
 * pending queue. No LLM mediation; this is the bypass for Ask Havee.
 *
 * Lives next to AskHavee at the top of /wheelhouse/social, gated by the
 * sibling tab switcher in SocialComposerTabs. On successful submit we
 * router.refresh() so the new draft pops up in the pending queue below
 * without a full page reload.
 *
 * Image handling matches SocialPostCard: pick from Bank, upload a new
 * image, or post with no image (FB auto OG link card from the URL).
 */
export default function DirectPostForm() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [autoSendAt, setAutoSendAt] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number } | null>(null);

  function resetForm() {
    setCaption("");
    setLinkUrl("");
    setImageUrl(null);
    setAutoSendAt("");
    setError(null);
  }

  async function onUploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/wheelhouse/social/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      }
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    if (!caption.trim() || busy) return;
    setBusy(true);
    setError(null);
    setSuccess(null);

    // Convert naive local datetime → ISO. Matches isoToLocalInput inverse
    // in SocialPostCard so the timestamp arrives in the same format the
    // existing schedule action sends.
    let autoSendIso: string | null = null;
    if (autoSendAt) {
      const t = new Date(autoSendAt).getTime();
      if (Number.isNaN(t)) {
        setError("Auto-send time is unparseable — try picking again");
        setBusy(false);
        return;
      }
      if (t < Date.now() - 60_000) {
        setError("Auto-send time is in the past");
        setBusy(false);
        return;
      }
      autoSendIso = new Date(t).toISOString();
    }

    try {
      const res = await fetch("/api/wheelhouse/social/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          linkUrl: linkUrl.trim() || null,
          imageUrl,
          autoSendAt: autoSendIso,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: number;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.ok || !data.id) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      }
      setSuccess({ id: data.id });
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-navy-600 mb-3 leading-relaxed">
        Write your own caption — no Havee in the middle. Drops into the
        queue below for review (or auto-fires if you set a time).
      </p>

      {/* CAPTION */}
      <label className="block mb-3">
        <span className="block text-[11px] uppercase tracking-wider font-semibold text-navy-700 mb-1">
          Caption <span className="text-coral-600">*</span>
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
          disabled={busy}
          rows={5}
          placeholder="What do you want to say?"
          className="w-full text-sm bg-white border border-sand-300 rounded-lg px-3 py-2 leading-relaxed focus:outline-none focus:ring-2 focus:ring-coral-300 disabled:opacity-50"
        />
        <span className="block text-[10px] text-navy-400 mt-1">
          {caption.length.toLocaleString()} chars
        </span>
      </label>

      {/* LINK URL */}
      <label className="block mb-3">
        <span className="block text-[11px] uppercase tracking-wider font-semibold text-navy-700 mb-1">
          Link URL <span className="text-navy-400 font-normal normal-case">(optional)</span>
        </span>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          disabled={busy}
          placeholder="https://theportalocal.com/…"
          className="w-full text-sm bg-white border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral-300 disabled:opacity-50"
        />
      </label>

      {/* IMAGE — pick from Bank, upload, or none */}
      <div className="mb-3 p-3 rounded-lg bg-sand-100 border border-sand-200">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-navy-700 mb-2">
          Image <span className="text-navy-400 font-normal normal-case">(optional)</span>
        </p>
        {imageUrl ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="selected"
              className="w-24 h-24 object-cover rounded-md border border-sand-300 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-700 font-semibold mb-1">
                📷 Photo mode
              </p>
              <p className="text-[11px] text-navy-500 leading-relaxed mb-2">
                Posts as a photo. Link still appears in caption text.
              </p>
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                disabled={busy}
                className="text-[11px] font-semibold text-coral-700 hover:text-coral-900 disabled:opacity-50"
              >
                Remove image (use OG instead)
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-700 font-semibold mb-0.5">
                🔗 Link mode (auto OG preview)
              </p>
              <p className="text-[11px] text-navy-500 leading-relaxed">
                FB will pull the link card from the URL above (or post
                caption-only if no link).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={busy || uploading}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  busy || uploading
                    ? "border-sand-300 text-navy-400 cursor-not-allowed"
                    : "border-coral-300 text-coral-700 hover:bg-coral-50"
                }`}
              >
                📚 Pick from Bank
              </button>
              <label
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  busy || uploading
                    ? "border-sand-300 text-navy-400 cursor-not-allowed"
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {uploading ? "Uploading…" : "📤 Upload"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={busy || uploading}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        )}
        <p className="text-[10px] text-navy-400 mt-2">
          PNG / JPG / WEBP · ≤8MB · 1200×630 best for FB · 1080×1080 best for IG
        </p>
      </div>

      {/* AUTO-SEND-AT */}
      <label className="block mb-4">
        <span className="block text-[11px] uppercase tracking-wider font-semibold text-navy-700 mb-1">
          Auto-send at{" "}
          <span className="text-navy-400 font-normal normal-case">
            (optional — leave blank for stockpile / manual-fire)
          </span>
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="datetime-local"
            value={autoSendAt}
            onChange={(e) => setAutoSendAt(e.target.value)}
            disabled={busy}
            className="text-sm bg-white border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral-300 disabled:opacity-50"
          />
          {autoSendAt && (
            <button
              type="button"
              onClick={() => setAutoSendAt("")}
              disabled={busy}
              className="text-[11px] font-semibold text-navy-500 hover:text-coral-700 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </label>

      {/* SUBMIT */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-navy-400">
          ⌘/Ctrl + Enter to send · drops into the queue below
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || !caption.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Saving…" : "📝 Drop in queue"}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <p className="font-bold mb-1">
            ✅ Drafted post #{success.id} — added to queue
          </p>
          <p className="text-emerald-700 leading-relaxed">
            Scroll down to review, tweak if needed, and send when ready.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-coral-100 border border-coral-300 text-xs text-coral-900">
          <p className="font-bold mb-1">⚠️ Couldn&apos;t save:</p>
          <p className="leading-relaxed font-mono">{error}</p>
        </div>
      )}

      <BankPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => setImageUrl(url)}
      />
    </div>
  );
}
