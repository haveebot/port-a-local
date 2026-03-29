"use client";

import { useState } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Search businesses, activities, restaurants...",
}: {
  onSearch?: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="relative max-w-xl w-full">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-palm-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch?.(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-sand-200 text-palm-900 placeholder:text-palm-300 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all"
      />
    </div>
  );
}
