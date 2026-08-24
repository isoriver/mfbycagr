import Link from "next/link";
import type { CategoryInfo } from "@/lib/dataset";

export function CategoryCard({ category }: { category: CategoryInfo }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block rounded-lg border border-border p-4 transition-colors hover:border-accent"
    >
      <div className="text-[11px] uppercase tracking-wide text-faint">{category.type}</div>
      <div className="mt-1 text-[14px] font-semibold text-ink">{category.name}</div>
      <div className="mt-2 text-[12px] text-dim">
        {category.count} {category.count === 1 ? "fund" : "funds"}
      </div>
    </Link>
  );
}
