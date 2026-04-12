"use client";

import { useState } from "react";

const suggestedTags = [
  "dog friendly",
  "great sunset",
  "live music",
  "outdoor seating",
  "happy hour",
  "cash only",
  "kid friendly",
  "good for groups",
  "late night",
  "locally owned",
  "waterfront views",
  "great cocktails",
  "reservations recommended",
  "walk-in friendly",
  "good for date night",
  "tourist friendly",
];

interface Props {
  businessSlug: string;
  businessName: string;
}

export default function KnowThisPlace({ businessSlug, businessName }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0 && customNote.trim().length === 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          businessName,
          selectedTags,
          customNote: customNote.trim(),
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-10 rounded-2xl bg-sand-50 border border-sand-200 p-6 text-center">
        <span className="text-2xl block mb-2">🤙</span>
        <p className="font-display text-lg font-bold text-navy-900 mb-1">
          Thanks for sharing!
        </p>
        <p className="text-sm text-navy-400 font-light">
          We&apos;ll review your suggestion and update the listing if it checks out.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-10">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl bg-sand-50 border border-sand-200 p-6 text-center card-hover group cursor-pointer"
        >
          <span className="text-2xl block mb-2">🏝️</span>
          <p className="font-display text-lg font-bold text-navy-900 group-hover:text-coral-600 transition-colors mb-1">
            Know this place?
          </p>
          <p className="text-sm text-navy-400 font-light">
            Help us make this listing better. No account needed.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl bg-sand-50 border border-sand-200 p-6">
      <div className="mb-4">
        <p className="font-display text-lg font-bold text-navy-900 mb-1">
          What should people know about {businessName}?
        </p>
        <p className="text-sm text-navy-400 font-light">
          Pick any that apply, or write your own. No account needed.
        </p>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {suggestedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
              selectedTags.includes(tag)
                ? "bg-coral-500 text-white border-coral-500"
                : "bg-white text-navy-600 border-sand-200 hover:border-coral-300 hover:text-coral-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Custom note */}
      <textarea
        value={customNote}
        onChange={(e) => setCustomNote(e.target.value)}
        placeholder="Anything else? Best dish, parking tips, insider knowledge..."
        rows={3}
        className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none mb-4"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setOpen(false);
            setSelectedTags([]);
            setCustomNote("");
          }}
          className="text-sm text-navy-400 hover:text-navy-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            status === "loading" ||
            (selectedTags.length === 0 && customNote.trim().length === 0)
          }
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl btn-coral text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Submit"}
        </button>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-500">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
