import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, rankByPeriod, paginate, parsePage, PERIOD_SLUGS, PERIOD_LABELS } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { StructuredData } from "@/components/StructuredData";
import { ListingIntro, ListingFaq } from "@/components/ListingIntro";
import { rankingsIntro, rankingsFaqs } from "@/content/listingCopy";
import { listPageMetadata, breadcrumbJsonLd, itemListJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = false;

const PAGE_SIZE = 50;

export function generateStaticParams() {
  return Object.keys(PERIOD_SLUGS).map((period) => ({ period }));
}

function resolve(periodSlug: string) {
  const period = PERIOD_SLUGS[periodSlug];
  return period ? { period, label: PERIOD_LABELS[period] } : null;
}

export function generateMetadata({
  params,
  searchParams,
}: {
  params: { period: string };
  searchParams: { page?: string };
}): Metadata {
  const r = resolve(params.period);
  if (!r) return {};
  return listPageMetadata({
    title: `Top Indian Mutual Funds by ${r.label} CAGR`,
    description: `The best-performing Indian mutual funds ranked by ${r.label} compounded annual growth rate (CAGR), computed from official NAV history and updated daily.`,
    path: `/rankings/${params.period}`,
    page: parsePage(searchParams.page),
  });
}

const PERIOD_TABS = Object.keys(PERIOD_SLUGS);

export default function RankingsPage({
  params,
  searchParams,
}: {
  params: { period: string };
  searchParams: { page?: string };
}) {
  const r = resolve(params.period);
  if (!r) notFound();

  const page = parsePage(searchParams.page);
  const ranked = rankByPeriod(getAllFunds(), r.period);
  const pageData = paginate(ranked, page, PAGE_SIZE);

  const withData = ranked.filter((f) => f[r.period] != null);
  const intro = rankingsIntro(r.label, withData.length, withData[0] ?? null);
  const faqs = rankingsFaqs(r.label, withData.length);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings" },
    { name: `${r.label} CAGR`, path: `/rankings/${params.period}` },
  ];

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(`Top Indian mutual funds by ${r.label} CAGR`, pageData.items),
          faqJsonLd(faqs),
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />

      <div className="mx-auto max-w-content px-4 pb-2 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">Top Indian Mutual Funds by {r.label} CAGR</h1>
        <ListingIntro paragraphs={intro} />
        <p className="mt-2 text-[12.5px] text-faint">
          Showing {pageData.items.length} of {pageData.total.toLocaleString("en-IN")} funds · page{" "}
          {pageData.page} of {pageData.totalPages}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PERIOD_TABS.map((slug) => (
            <Link
              key={slug}
              href={`/rankings/${slug}`}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] ${
                slug === params.period
                  ? "border-ink bg-ink text-white"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {PERIOD_LABELS[PERIOD_SLUGS[slug]]} CAGR
            </Link>
          ))}
        </div>
      </div>

      <FundTable
        funds={pageData.items}
        startRank={(pageData.page - 1) * pageData.pageSize + 1}
        highlight={r.period}
      />

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        buildHref={(p) => `/rankings/${params.period}${p > 1 ? `?page=${p}` : ""}`}
      />

      <ListingFaq faqs={faqs} heading={`${r.label} CAGR rankings — frequently asked questions`} />
    </>
  );
}
