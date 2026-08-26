import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, ASSET_TYPES } from "@/lib/dataset";
import { CategoryCard } from "@/components/CategoryCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Mutual Fund Categories",
  description:
    "Browse Indian mutual funds by category — large cap, mid cap, small cap, flexi cap, ELSS, debt, hybrid and more — each ranked by CAGR.",
  path: "/categories",
});

export default function CategoriesPage() {
  const categories = getCategories();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
  ];

  const byType = new Map<string, typeof categories>();
  for (const c of categories) {
    const arr = byType.get(c.type) || [];
    arr.push(c);
    byType.set(c.type, arr);
  }
  // Fixed display order: Equity, Debt, Hybrid, Other, Solution Oriented (then any extras).
  const orderedTypes = [
    ...ASSET_TYPES.filter((t) => byType.has(t)),
    ...[...byType.keys()].filter((t) => !ASSET_TYPES.includes(t as never)),
  ];

  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-10 pt-2">
        <h1 className="text-[24px] font-bold">Mutual Fund Categories</h1>
        <p className="mt-2 text-[13px] text-dim">
          {categories.length} categories across the tracked universe. Pick a category to see its funds
          ranked by CAGR.
        </p>
        {orderedTypes.map((type) => {
          const cats = byType.get(type) ?? [];
          const total = cats.reduce((sum, c) => sum + c.count, 0);
          return (
            <div key={type} className="mt-8">
              <div className="flex items-baseline justify-between pb-3">
                <h2 className="text-[15px] font-semibold">{type}</h2>
                <Link
                  href={`/?type=${encodeURIComponent(type)}`}
                  className="text-[12.5px] text-link hover:underline"
                >
                  View all {total.toLocaleString("en-IN")} {type} funds →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {cats.map((c) => (
                  <CategoryCard key={c.slug} category={c} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
