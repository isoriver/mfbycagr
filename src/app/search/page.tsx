import type { Metadata } from "next";
import { getAllFunds, sortFunds, parseSortKey, parseSortDir } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 86400;

const MAX_RESULTS = 100;

type SearchParams = { q?: string; sort?: string; dir?: string };

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
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

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (searchParams.q || "").trim();
  const q = raw.toLowerCase();

  const matches =
    q.length >= 2
      ? getAllFunds().filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.house.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q) ||
            String(f.code).includes(q),
        )
      : [];

  // Default ordering is relevance (name-start matches first, then 5Y CAGR), which mirrors
  // the header dropdown. Once the reader clicks a column header we honour that instead —
  // and we sort the full match set before slicing, so "top 100 by NAV" really is the top
  // 100 by NAV rather than a re-shuffle of the relevance top 100.
  const hasExplicitSort = typeof searchParams.sort === "string" && searchParams.sort !== "";
  const sortKey = parseSortKey(searchParams.sort);
  const sortDir = parseSortDir(searchParams.dir);

  const ordered = hasExplicitSort
    ? sortFunds(matches, sortKey, sortDir)
    : [...matches].sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStart !== bStart) return aStart - bStart;
        return (b.y5 ?? -1e9) - (a.y5 ?? -1e9);
      });
  const results = ordered.slice(0, MAX_RESULTS);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
  ];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-3 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">
          {raw ? `Search results for “${raw}”` : "Search mutual funds"}
        </h1>
        {raw && (
          <p className="mt-2 text-[13px] text-dim">
            {matches.length.toLocaleString("en-IN")} {matches.length === 1 ? "match" : "matches"}
            {matches.length > results.length ? ` — showing top ${results.length}` : ""} ·{" "}
            {hasExplicitSort
              ? `sorted by ${sortKey.toUpperCase()} ${sortDir === "desc" ? "high to low" : "low to high"}`
              : "sorted by relevance"}
            . Funds open in a new tab.
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <FundTable
          funds={results}
          highlight="y5"
          openInNewTab
          sortKey={hasExplicitSort ? sortKey : undefined}
          sortDir={sortDir}
          searchParams={searchParams as Record<string, string | undefined>}
        />
      ) : (
        raw && (
          <p className="mx-auto max-w-content px-4 pb-10 text-[13px] text-dim sm:px-5">
            No funds matched “{raw}”. Try a fund house (e.g. “HDFC”) or a category (e.g. “small
            cap”).
          </p>
        )
      )}
    </>
  );
}
