import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds } from "@/lib/dataset";
import { ReturnPill } from "@/components/ReturnPill";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 86400;

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  const q = (searchParams.q || "").trim();
  return {
    ...pageMetadata({
      title: q ? `Search results for “${q}”` : "Search mutual funds",
      description: "Search Indian mutual funds by name, fund house or category.",
      path: "/search",
    }),
    robots: { index: false, follow: true },
  };
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim().toLowerCase();
  const results = q.length >= 2
    ? getAllFunds()
        .filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.house.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q),
        )
        .slice(0, 100)
    : [];

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
  ];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-10 pt-2">
        <h1 className="text-[24px] font-bold">
          {q ? `Search results for “${searchParams.q}”` : "Search mutual funds"}
        </h1>
        {q && (
          <p className="mt-2 text-[13px] text-dim">
            {results.length} {results.length === 1 ? "match" : "matches"}.
          </p>
        )}
        <ul className="mt-6 divide-y divide-border">
          {results.map((f) => (
            <li key={f.code} className="flex items-center justify-between gap-4 py-3">
              <Link href={`/funds/${f.code}`} className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink hover:text-link">{f.name}</span>
                <span className="text-[12px] text-faint">
                  {f.house} · {f.category}
                </span>
              </Link>
              <span className="shrink-0 text-[12px] text-dim">
                5Y <ReturnPill value={f.y5} />
              </span>
            </li>
          ))}
        </ul>
        {q && results.length === 0 && <p className="mt-6 text-[13px] text-dim">No funds matched your search.</p>}
      </div>
    </>
  );
}
