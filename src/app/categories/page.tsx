import type { Metadata } from "next";
import { getCategories } from "@/lib/dataset";
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
        {[...byType.entries()].map(([type, cats]) => (
          <div key={type} className="mt-8">
            <h2 className="pb-3 text-[15px] font-semibold">{type}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cats.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
