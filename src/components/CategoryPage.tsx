"use client";

import { useState } from "react";
import Navigation from "./Navigation";
import BusinessCard from "./BusinessCard";
import SearchBar from "./SearchBar";
import Footer from "./Footer";
import Badge from "./Badge";
import type { Category } from "@/data/categories";
import type { Business } from "@/data/businesses";

function isOpenNow(business: Business): boolean {
  if (!business.hoursOfOperation) return false;
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[now.getDay()];
  const todayHours = business.hoursOfOperation[todayName];
  if (!todayHours || todayHours === "Closed") return false;

  // Parse "10:00 AM – 9:00 PM" or "10AM-9PM" style strings
  const clean = todayHours.replace(/\s*–\s*/g, "-").replace(/\s*-\s*/g, "-");
  const match = clean.match(/(\d+(?::\d+)?)\s*(AM|PM)?-(\d+(?::\d+)?)\s*(AM|PM)?/i);
  if (!match) return false;

  function toMinutes(time: string, meridiem: string): number {
    const [h, m = "0"] = time.split(":");
    let hours = parseInt(h);
    const mins = parseInt(m);
    meridiem = meridiem?.toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  const openMin = toMinutes(match[1], match[2] || match[4]);
  const closeMin = toMinutes(match[3], match[4] || match[2]);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return nowMin >= openMin && nowMin < closeMin;
}

export default function CategoryPage({
  category,
  businesses,
}: {
  category: Category;
  businesses: Business[];
}) {
  const [query, setQuery] = useState("");
  const [openNow, setOpenNow] = useState(false);

  const hasOpenNowData = businesses.some((b) => b.hoursOfOperation);

  const filtered = businesses.filter((b) => {
    const matchesQuery = query
      ? b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.tagline.toLowerCase().includes(query.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      : true;
    const matchesOpen = openNow ? isOpenNow(b) : true;
    return matchesQuery && matchesOpen;
  });

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              {category.name}
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 mb-8 max-w-2xl font-light">
            {category.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              onSearch={setQuery}
              placeholder={`Search ${category.name.toLowerCase()}...`}
            />
            {hasOpenNowData && (
              <button
                onClick={() => setOpenNow(!openNow)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  openNow
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white/10 text-sand-200 border-white/20 hover:bg-white/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-white" : "bg-green-400"}`} />
                Open Now
              </button>
            )}
            <Badge size="lg" />
          </div>

          <p className="text-sm text-navy-300 mt-4">
            {filtered.length} locally vetted {filtered.length === 1 ? "business" : "businesses"} in Port Aransas
            {openNow && ", open right now"}
          </p>
        </div>
      </section>

      {/* Listings */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-navy-300">
                {openNow && !query
                  ? `No ${category.name.toLowerCase()} spots with hours data are open right now.`
                  : `No businesses match "${query}"`}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
