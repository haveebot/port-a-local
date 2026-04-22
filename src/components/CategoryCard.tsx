import Link from "next/link";
import type { Category } from "@/data/categories";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group block p-4 sm:p-6 rounded-2xl bg-white border border-sand-200 card-hover relative overflow-hidden"
    >
      {/* Coral accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-coral-400 to-coral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <PortalIcon name={category.slug as PortalIconName} className="w-12 h-12 mb-4 text-navy-900 group-hover:text-coral-500 transition-colors" />
      <h3 className="font-display text-xl font-bold text-navy-900 group-hover:text-coral-600 transition-colors mb-2">
        {category.name}
      </h3>
      <p className="text-sm text-navy-400 leading-relaxed">
        {category.description}
      </p>
      <div className="mt-4 inline-flex items-center text-sm font-medium text-coral-500 group-hover:text-coral-600 group-hover:gap-2 transition-all">
        Browse
        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
