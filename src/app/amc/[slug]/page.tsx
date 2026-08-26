import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getFundsByHouse,
  getHouses,
  getHouseBySlug,
  sortFunds,
  paginate,
  parseSortKey,
  parseSortDir,
  parsePage,
  isNonCanonicalListView,
  DEFAULT_SORT,
  DEFAULT_DIR,
} from "@/lib/dataset";
import type { SortDir } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Pagination } from "@/components/Pagination";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { ListingIntro, ListingFaq } from "@/components/ListingIntro";
import { houseIntro, houseFaqs } from "@/content/listingCopy";
import { listPageMetadata, breadcrumbJsonLd, itemListJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

const PAGE_SIZE = 50;

export function generateStaticParams() {
  return getHouses().map((h) => ({ slug: h.slug }));
}

export function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const house = getHouseBySlug(params.slug);
  if (!house) return {};
  const page = parsePage(searchParams.page);
  return listPageMetadata({
    title: `${house.name} Mutual Funds — All ${house.count} Schemes Ranked by CAGR`,
    description: `Every ${house.name} mutual fund scheme ranked by CAGR (1Y, 3Y, 5Y, 10Y), with NAV and 30-day trend. Compare all ${house.count} direct-plan schemes, updated daily.`,
    path: `/amc/${params.slug}`,
    page,
    noindex: isNonCanonicalListView(searchParams),
  });
}

export default function AmcPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const house = getHouseBySlug(params.slug);
  const funds = getFundsByHouse(params.slug);
  if (!house || funds.length === 0) notFound();
  const name = house.name;

  const page = parsePage(searchParams.page);
  const sortKey = parseSortKey(searchParams.sort);
  const sortDir: SortDir = parseSortDir(searchParams.dir);

  const sorted = sortFunds(funds, sortKey, sortDir);
  const pageData = paginate(sorted, page, PAGE_SIZE);

  const intro = houseIntro(name, funds);
  const faqs = houseFaqs(name, funds);

  // Other large fund houses — gives every AMC page outbound links to sibling AMCs.
  const otherHouses = getHouses()
    .filter((h) => h.slug !== house.slug)
    .slice(0, 12);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Fund Houses", path: "/amcs" },
    { name, path: `/amc/${params.slug}` },
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
    return qs ? `/amc/${params.slug}?${qs}` : `/amc/${params.slug}`;
  }

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(`${name} mutual funds`, pageData.items),
          faqJsonLd(faqs),
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-2 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">{name} Mutual Funds</h1>
        <ListingIntro paragraphs={intro} />
        <p className="mt-2 text-[12.5px] text-faint">
          Showing {pageData.items.length} of {funds.length.toLocaleString("en-IN")} schemes · sorted
          by {sortKey.toUpperCase()} {sortDir === "desc" ? "high to low" : "low to high"} · page{" "}
          {pageData.page} of {pageData.totalPages}
        </p>
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

      {otherHouses.length > 0 && (
        <nav aria-label="Other fund houses" className="mx-auto max-w-content px-4 pb-8 sm:px-5">
          <h2 className="mb-2 text-[15px] font-semibold">Compare other fund houses</h2>
          <ul className="flex flex-wrap gap-1.5">
            {otherHouses.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/amc/${h.slug}`}
                  className="inline-block rounded-full border border-border px-3 py-1 text-[12px] text-dim transition-colors hover:border-accent hover:text-ink"
                >
                  {h.name}
                  <span className="ml-1 text-[10.5px] text-faint">{h.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ListingFaq faqs={faqs} heading={`${name} mutual funds — frequently asked questions`} />
    </>
  );
}
