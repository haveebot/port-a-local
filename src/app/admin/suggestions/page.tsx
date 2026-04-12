"use client";

import { useState, useEffect } from "react";

interface Suggestion {
  id: string;
  businessSlug: string;
  businessName: string;
  selectedTags: string[];
  customNote: string;
  timestamp: string;
  status: "pending" | "approved" | "dismissed";
}

export default function SuggestionsAdmin() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions");
      const data = await res.json();
      setSuggestions(data);
    } catch {
      console.error("Failed to fetch suggestions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const updateStatus = async (id: string, status: "approved" | "dismissed") => {
    try {
      await fetch("/api/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch {
      console.error("Failed to update suggestion");
    }
  };

  const filtered =
    filter === "pending"
      ? suggestions.filter((s) => s.status === "pending")
      : suggestions;

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-900">
              Tag Suggestions
            </h1>
            <p className="text-sm text-navy-400 mt-1">
              {pendingCount} pending review
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "pending"
                  ? "bg-coral-500 text-white"
                  : "bg-white text-navy-600 border border-sand-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-coral-500 text-white"
                  : "bg-white text-navy-600 border border-sand-200"
              }`}
            >
              All
            </button>
            <button
              onClick={fetchSuggestions}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-navy-600 border border-sand-200 hover:bg-sand-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-navy-400 text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🌊</span>
            <p className="text-navy-400 font-light">
              {filter === "pending"
                ? "No pending suggestions. Check back later."
                : "No suggestions yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl bg-white border p-5 ${
                  s.status === "pending"
                    ? "border-sand-200"
                    : s.status === "approved"
                      ? "border-green-200 bg-green-50/30"
                      : "border-sand-100 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-navy-900">
                      {s.businessName}
                    </p>
                    <p className="text-xs text-navy-400">
                      {new Date(s.timestamp).toLocaleString()} · {s.businessSlug}
                    </p>
                  </div>
                  {s.status !== "pending" && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-sand-100 text-navy-400"
                      }`}
                    >
                      {s.status}
                    </span>
                  )}
                </div>

                {s.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-coral-50 text-coral-600 border border-coral-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {s.customNote && (
                  <p className="text-sm text-navy-600 mb-3 bg-sand-50 rounded-lg p-3 font-light">
                    &ldquo;{s.customNote}&rdquo;
                  </p>
                )}

                {s.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(s.id, "approved")}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "dismissed")}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-sand-100 text-navy-500 hover:bg-sand-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
