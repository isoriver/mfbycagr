import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getFundsByCategory,
  getCategories,
  getCategoryBySlug,
  getSubcategories,
  sortFunds,
  paginate,
  parseSortKey,
  parseSortDir,
  parsePage,
  isNonCanonicalListView,
  DEFAULT_SORT,
  DEFAULT_DIR,
} from "@/lib/dataset";
import type { SortKey, SortDir } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Pagination } from "@/components/Pagination";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { ListingIntro, ListingFaq } from "@/components/ListingIntro";
import { categoryStats, categoryIntro, categoryFaqs } from "@/content/listingCopy";
import { listPageMetadata, breadcrumbJsonLd, itemListJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

const PAGE_SIZE = 50;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};
  const page = parsePage(searchParams.page);
  return listPageMetadata({
    title: `Best ${cat.name} Mutual Funds by CAGR`,
    description: `Compare all ${cat.count} ${cat.name} mutual funds in India ranked by CAGR (1Y, 3Y, 5Y, 10Y). NAV, returns and 30-day trend computed from official history, updated daily.`,
    path: `/category/${params.slug}`,
    page,
    noindex: isNonCanonicalListView(searchParams),
  });
}

// Quick "rank by" tabs map a return period to its sort key.
const PERIOD_TABS: { key: SortKey; label: string }[] = [
  { key: "y1", label: "1Y" },
  { key: "y3", label: "3Y" },
  { key: "y5", label: "5Y" },
  { key: "y10", label: "10Y" },
];

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const cat = getCategoryBySlug(params.slug);
  const funds = getFundsByCategory(params.slug);
  if (!cat || funds.length === 0) notFound();
  const name = cat.name;

  const page = parsePage(searchParams.page);
  const sortKey = parseSortKey(searchParams.sort);
  const sortDir: SortDir = parseSortDir(searchParams.dir);

  const sorted = sortFunds(funds, sortKey, sortDir);
  const pageData = paginate(sorted, page, PAGE_SIZE);

  const stats = categoryStats(funds);
  const intro = categoryIntro(name, stats);
  const faqs = categoryFaqs(name, stats);

  // Sibling categories in the same asset type — real internal links to related pages.
  const siblings = getSubcategories(cat.type)
    .filter((c) => c.slug !== cat.slug)
    .slice(0, 12);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name, path: `/category/${params.slug}` },
  ];

  function buildHref(overrides: Record<string, string | undefined>): string {
    const sp = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      sort: sortKey === DEFAULT_SORT ? undefined : sortKey,
      dir: sortDir === DEFAULT_DIR ? undefined : sortDir,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const qs = sp.toString();
    return qs ? `/category/${params.slug}?${qs}` : `/category/${params.slug}`;
  }

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(`Best ${name} funds by CAGR`, pageData.items),
          faqJsonLd(faqs),
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-2 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">Best {name} Mutual Funds</h1>
        <ListingIntro paragraphs={intro} />
        <p className="mt-2 text-[12.5px] text-faint">
          Showing {pageData.items.length} of {stats.count.toLocaleString("en-IN")} schemes · sorted
          by {sortKey.toUpperCase()} {sortDir === "desc" ? "high to low" : "low to high"} · page{" "}
          {pageData.page} of {pageData.totalPages}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-dim">Rank by</span>
          {PERIOD_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={buildHref({ sort: tab.key, dir: undefined, page: undefined })}
              rel="nofollow"
              className={`rounded-full border px-4 py-1.5 text-[12.5px] ${
                sortKey === tab.key
                  ? "border-ink bg-ink text-white"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {tab.label} CAGR
            </Link>
          ))}
        </div>
      </div>

      <FundTable
        funds={pageData.items}
        startRank={(pageData.page - 1) * PAGE_SIZE + 1}
        sortKey={sortKey}
        sortDir={sortDir}
        searchParams={searchParams}
      />

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        buildHref={(p) => buildHref({ page: p > 1 ? String(p) : undefined })}
      />

      {siblings.length > 0 && (
        <nav
          aria-label="Related categories"
          className="mx-auto max-w-content px-4 pb-8 sm:px-5"
        >
          <h2 className="mb-2 text-[15px] font-semibold">Other {cat.type} categories</h2>
          <ul className="flex flex-wrap gap-1.5">
            {siblings.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="inline-block rounded-full border border-border px-3 py-1 text-[12px] text-dim transition-colors hover:border-accent hover:text-ink"
                >
                  {c.name}
                  <span className="ml-1 text-[10.5px] text-faint">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ListingFaq faqs={faqs} heading={`${name} funds — frequently asked questions`} />
    </>
  );
}
