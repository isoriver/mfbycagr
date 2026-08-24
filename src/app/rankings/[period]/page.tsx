import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, rankByPeriod, paginate, PERIOD_SLUGS, PERIOD_LABELS } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PERIOD_SLUGS).map((period) => ({ period }));
}

function resolve(periodSlug: string) {
  const period = PERIOD_SLUGS[periodSlug];
  return period ? { period, label: PERIOD_LABELS[period] } : null;
}

export function generateMetadata({ params }: { params: { period: string } }): Metadata {
  const r = resolve(params.period);
  if (!r) return {};
  return pageMetadata({
    title: `Top Indian Mutual Funds by ${r.label} CAGR`,
    description: `The best-performing Indian mutual funds ranked by ${r.label} compounded annual growth rate (CAGR), computed from official NAV history and updated daily.`,
    path: `/rankings/${params.period}`,
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

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const ranked = rankByPeriod(getAllFunds(), r.period);
  const pageData = paginate(ranked, page, 50);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings/5y" },
    { name: `${r.label} CAGR`, path: `/rankings/${params.period}` },
  ];

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(`Top Indian mutual funds by ${r.label} CAGR`, pageData.items),
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />

      <div className="mx-auto max-w-content px-5 pb-2 pt-2">
        <h1 className="text-[24px] font-bold">Top Indian Mutual Funds by {r.label} CAGR</h1>
        <p className="mt-2 text-[13px] text-dim">
          {pageData.total.toLocaleString("en-IN")} funds ranked by {r.label} compounded annual growth.
          Page {pageData.page} of {pageData.totalPages}.
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
              {PERIOD_LABELS[PERIOD_SLUGS[slug]]}
            </Link>
          ))}
        </div>
      </div>

      <FundTable funds={pageData.items} startRank={(pageData.page - 1) * pageData.pageSize + 1} highlight={r.period} />

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        buildHref={(p) => `/rankings/${params.period}${p > 1 ? `?page=${p}` : ""}`}
      />
    </>
  );
}
