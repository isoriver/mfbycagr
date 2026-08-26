import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllFunds,
  getCategories,
  getSubcategories,
  rankByPeriod,
  sortFunds,
  paginate,
  parseSortKey,
  parseSortDir,
  parsePage,
  isNonCanonicalListView,
  ASSET_TYPES,
  DEFAULT_SORT,
  DEFAULT_DIR,
} from "@/lib/dataset";
import type { SortKey, SortDir } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Pagination } from "@/components/Pagination";
import { StructuredData } from "@/components/StructuredData";
import { CategoryCloud } from "@/components/CategoryCloud";
import { itemListJsonLd, absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

const PAGE_SIZE = 50;

/**
 * The homepage owns exactly one indexable URL: "/".
 *
 * Every other view here is a duplicate of something that already has a better home —
 * `?page=2…92` of the default 5Y ordering is the same list as /rankings/5y (which is
 * indexable and self-canonicalising), `?type=` duplicates the category pages, and `?sort=`
 * is just a re-ordering. All of them are therefore `noindex, follow`: crawlers still walk
 * the links and reach every fund, but only one URL competes for the homepage's terms.
 */
export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const page = parsePage(searchParams.page);
  const noindex = page > 1 || isNonCanonicalListView(searchParams);
  return {
    alternates: { canonical: absoluteUrl("/") },
    ...(page > 1 && { title: `Indian Mutual Funds Ranked by CAGR — Page ${page}` }),
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

// `key` ties each chip to the sort column, so the chip matching the table's current
// ordering is highlighted — 5Y by default, since that is the homepage's default sort.
const PERIOD_RANKING_LINKS: { slug: string; label: string; key: SortKey }[] = [
  { slug: "1y", label: "1 Year", key: "y1" },
  { slug: "3y", label: "3 Years", key: "y3" },
  { slug: "5y", label: "5 Years", key: "y5" },
  { slug: "10y", label: "10 Years", key: "y10" },
];

export default function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const funds = getAllFunds();

  // ── parse search params ─────────────────────────────────────────────────────
  const page = parsePage(searchParams.page);
  const sortKey = parseSortKey(searchParams.sort);
  const sortDir: SortDir = parseSortDir(searchParams.dir);

  const activeType = typeof searchParams.type === "string" ? searchParams.type : "";
  const activeCat = typeof searchParams.cat === "string" ? searchParams.cat : "";

  // ── filter ──────────────────────────────────────────────────────────────────
  let filtered = funds;
  if (activeType) filtered = filtered.filter((f) => f.type === activeType);
  if (activeCat) filtered = filtered.filter((f) => f.categorySlug === activeCat);

  // ── sort ────────────────────────────────────────────────────────────────────
  const sorted = sortFunds(filtered, sortKey, sortDir);
  const pageData = paginate(sorted, page, PAGE_SIZE);

  // ── category / subcategory cloud data ───────────────────────────────────────
  const allCategories = getCategories();
  // Count by type (from the full fund set, not filtered)
  const typeCounts = Object.fromEntries(
    ASSET_TYPES.map((t) => [t, funds.filter((f) => f.type === t).length]),
  );
  // Subcategories for the active type
  const subcategories = activeType ? getSubcategories(activeType) : [];

  // ── structured data (top 15 by 5Y for SEO) ──────────────────────────────────
  const top15 = rankByPeriod(funds, "y5").slice(0, 15);

  // ── helpers to build filter hrefs ───────────────────────────────────────────
  // Omit any value that equals the default, so the canonical view is reachable at "/"
  // rather than at "/?sort=y5&dir=desc" — two URLs for byte-identical content.
  function buildHref(overrides: Record<string, string | undefined>): string {
    const sp = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      sort: sortKey === DEFAULT_SORT ? undefined : sortKey,
      dir: sortDir === DEFAULT_DIR ? undefined : sortDir,
      type: activeType || undefined,
      cat: activeCat || undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : "/";
  }

  return (
    <>
      <StructuredData data={itemListJsonLd("Top Indian mutual funds by 5-year CAGR", top15)} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-4 pb-3 pt-6 text-center sm:px-5">
        <h1 className="text-[24px] font-bold leading-tight md:text-[30px]">
          Indian Mutual Funds Ranked by CAGR
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[13.5px] leading-relaxed text-dim">
          <strong className="text-ink">{funds.length.toLocaleString("en-IN")}</strong> direct-plan
          schemes ranked by compound annual growth over 1, 3, 5 and 10 years — computed from official
          daily NAV history and refreshed every day.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {PERIOD_RANKING_LINKS.map((p) => {
            const isCurrentOrdering = p.key === sortKey;
            return (
              <Link
                key={p.slug}
                href={`/rankings/${p.slug}`}
                title={
                  isCurrentOrdering
                    ? `The table below is ranked by ${p.label} CAGR — open the full ranking`
                    : `Open the full ${p.label} CAGR ranking`
                }
                className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                  isCurrentOrdering
                    ? "border-ink bg-ink font-medium text-white"
                    : "border-border text-dim hover:border-accent hover:text-ink"
                }`}
              >
                Top by {p.label}
                {isCurrentOrdering && <span className="sr-only"> (current ranking)</span>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Asset-type filter + category disclosure ──────────────────────────── */}
      <section className="mx-auto max-w-content border-t border-border px-4 pt-3 sm:px-5">
        {/* Heading kept for structure/AT but hidden: the labelled chips below are
            self-explanatory, and dropping the visual row keeps the page compact. */}
        <h2 className="sr-only">Filter funds by asset type</h2>
        <div className="flex flex-wrap gap-1.5">
          {/* "All" chip */}
          <Link
            href={buildHref({ type: undefined, cat: undefined, page: undefined })}
            className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
              !activeType
                ? "border-ink bg-ink text-white"
                : "border-border text-dim hover:border-accent hover:text-ink"
            }`}
          >
            All
            <span className="ml-1.5 text-[11px] opacity-70">
              {funds.length.toLocaleString("en-IN")}
            </span>
          </Link>

          {ASSET_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0).map((t) => (
            <Link
              key={t}
              href={buildHref({ type: t, cat: undefined, page: undefined })}
              rel="nofollow"
              className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
                activeType === t
                  ? "border-ink bg-ink text-white"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {t}
              <span className="ml-1.5 text-[11px] opacity-70">
                {(typeCounts[t] ?? 0).toLocaleString("en-IN")}
              </span>
            </Link>
          ))}
        </div>

        {/* One collapsed category list, never two. With an asset type selected it shows
            that type's categories; on the unfiltered "All" view it shows every category.
            Links stay in the HTML while collapsed (server-rendered <details>). */}
        {activeType ? (
          <CategoryCloud
            label={`Browse ${subcategories.length} ${activeType} categories`}
            categories={subcategories}
          />
        ) : (
          <CategoryCloud
            label={`Browse all ${allCategories.length} fund categories`}
            categories={allCategories}
            allHref="/categories"
            allLabel="Category index"
          />
        )}
      </section>

      {/* ── Fund table ───────────────────────────────────────────────────────── */}
      <section className="pt-3">
        <div className="mx-auto flex max-w-content items-baseline gap-2 px-4 pb-2 sm:px-5">
          <h2 className="text-[15px] font-semibold">
            {activeCat
              ? allCategories.find((c) => c.slug === activeCat)?.name ?? "Funds"
              : activeType
              ? `${activeType} funds`
              : "All funds"}
          </h2>
          <span className="text-[12.5px] text-faint">
            {pageData.total.toLocaleString("en-IN")} total · page {pageData.page} of{" "}
            {pageData.totalPages}
          </span>
        </div>

        <FundTable
          funds={pageData.items}
          startRank={(pageData.page - 1) * PAGE_SIZE + 1}
          highlight="y5"
          sortKey={sortKey}
          sortDir={sortDir}
          searchParams={searchParams as Record<string, string | undefined>}
        />

        <Pagination
          page={pageData.page}
          totalPages={pageData.totalPages}
          buildHref={(p) => {
            const sp = new URLSearchParams();
            if (sortKey !== DEFAULT_SORT) sp.set("sort", sortKey);
            if (sortDir !== DEFAULT_DIR) sp.set("dir", sortDir);
            if (activeType) sp.set("type", activeType);
            if (activeCat) sp.set("cat", activeCat);
            if (p > 1) sp.set("page", String(p));
            const qs = sp.toString();
            return qs ? `?${qs}` : "/";
          }}
        />
      </section>
    </>
  );
}
