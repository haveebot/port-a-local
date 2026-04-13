"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const photoTags = [
  "Sunset",
  "Beach",
  "Fishing",
  "Wildlife",
  "Downtown",
  "Ferry",
  "Jetties",
  "Boats",
  "Food",
  "Heritage",
  "Storm",
  "Family",
];

export default function PhotosPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submittedBy, setSubmittedBy] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!caption.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          tags: selectedTags,
          submittedBy: submittedBy.trim() || "Anonymous",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setCaption("");
        setSelectedTags([]);
        setSubmittedBy("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Community Gallery
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Port A Through Your Eyes
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto mb-8">
            The best photos of Port Aransas come from the people who love it. Share yours — no account needed.
          </p>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold"
          >
            {showUpload ? "Close" : "Share a Photo"}
          </button>
        </div>
      </section>

      {/* Upload Form */}
      {showUpload && (
        <section className="py-12 bg-sand-50 border-b border-sand-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            {status === "success" ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">🤙</span>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-2">
                  Thanks for sharing!
                </h3>
                <p className="text-sm text-navy-400 font-light">
                  We&apos;ll review your submission and add it to the gallery if it fits. Appreciate you making Port A Local better.
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setShowUpload(false);
                  }}
                  className="mt-4 text-sm text-coral-500 hover:text-coral-600 font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-1">
                  Share Your Port A Photo
                </h3>
                <p className="text-sm text-navy-400 font-light mb-6">
                  Describe your photo and tag it. We&apos;ll review and add it to the gallery. No account needed.
                </p>

                {/* Caption */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Caption <span className="text-coral-400">*</span>
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Sunset from the south jetty, caught a 28-inch red, dolphins at the ferry..."
                    rows={3}
                    className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {photoTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          selectedTags.includes(tag)
                            ? "bg-coral-500 text-white border-coral-500"
                            : "bg-white text-navy-600 border-sand-200 hover:border-coral-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Your name <span className="text-navy-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-coral-400"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="text-sm text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading" || !caption.trim()}
                    className="btn-coral px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending..." : "Submit Photo"}
                  </button>
                </div>

                {status === "error" && (
                  <p className="mt-3 text-sm text-red-500">Something went wrong. Please try again.</p>
                )}

                <p className="mt-4 text-xs text-navy-300 font-light">
                  By submitting, you confirm this is your photo and give Port A Local permission to display it.
                  We review all submissions before publishing.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery placeholder — will populate as photos are approved */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Gallery
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Community Photos
            </h2>
            <p className="text-navy-400 font-light">
              Photos shared by visitors and locals. This gallery grows with every submission.
            </p>
          </div>

          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📸</span>
            <h3 className="font-display text-xl font-bold text-navy-900 mb-3">
              Be the First to Share
            </h3>
            <p className="text-navy-400 font-light max-w-md mx-auto mb-6">
              We just launched the community gallery. Your photo could be the first one here. Sunsets, catches, dolphins, downtown — anything that says Port Aransas.
            </p>
            <button
              onClick={() => {
                setShowUpload(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold"
            >
              Share a Photo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
