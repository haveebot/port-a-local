"use client";

import { useState, useEffect } from "react";
import { addToTrip, removeFromTrip, isInTrip } from "@/lib/tripPlanner";
import type { TripItem } from "@/lib/tripPlanner";

interface Props {
  item: Omit<TripItem, "addedAt">;
  size?: "sm" | "md";
}

export default function SaveToTrip({ item, size = "sm" }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInTrip(item.type, item.slug));
    const onUpdate = () => setSaved(isInTrip(item.type, item.slug));
    window.addEventListener("trip-updated", onUpdate);
    return () => window.removeEventListener("trip-updated", onUpdate);
  }, [item.type, item.slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromTrip(item.type, item.slug);
    } else {
      addToTrip(item);
    }
  };

  const iconSize = size === "md" ? "w-6 h-6" : "w-5 h-5";
  const padding = size === "md" ? "p-2.5" : "p-2";

  return (
    <button
      onClick={toggle}
      title={saved ? "Remove from My Trip" : "Save to My Trip"}
      className={`${padding} rounded-full transition-all duration-200 ${
        saved
          ? "bg-coral-50 text-coral-500 hover:bg-coral-100"
          : "bg-white/80 text-navy-300 hover:text-coral-500 hover:bg-coral-50"
      } border border-sand-200 shadow-sm`}
    >
      <svg
        className={iconSize}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
