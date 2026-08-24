import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getFundsByCategory, getCategories, rankByPeriod, PERIOD_SLUGS, PERIOD_LABELS } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import type { Period } from "@/lib/types";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

function categoryName(slug: string) {
  return getCategories().find((c) => c.slug === slug)?.name;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const name = categoryName(params.slug);
  if (!name) return {};
  return pageMetadata({
    title: `Best ${name} Mutual Funds by CAGR`,
    description: `Top ${name} mutual funds in India ranked by CAGR (1Y, 3Y, 5Y, 10Y). NAV and returns computed from official history, updated daily.`,
    path: `/category/${params.slug}`,
  });
}

const TABS = Object.keys(PERIOD_SLUGS);

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string };
}) {
  const name = categoryName(params.slug);
  const funds = getFundsByCategory(params.slug);
  if (!name || funds.length === 0) notFound();

  const sortSlug = searchParams.sort && PERIOD_SLUGS[searchParams.sort] ? searchParams.sort : "5y";
  const period = PERIOD_SLUGS[sortSlug] as Period;
  const ranked = rankByPeriod(funds, period);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name, path: `/category/${params.slug}` },
  ];

  return (
    <>
      <StructuredData
        data={[breadcrumbJsonLd(crumbs), itemListJsonLd(`Best ${name} funds by ${PERIOD_LABELS[period]} CAGR`, ranked)]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-2 pt-2">
        <h1 className="text-[24px] font-bold">Best {name} Mutual Funds</h1>
        <p className="mt-2 text-[13px] text-dim">
          {funds.length} {name} schemes ranked by {PERIOD_LABELS[period]} CAGR.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-dim">Rank by</span>
          {TABS.map((slug) => (
            <Link
              key={slug}
              href={`/category/${params.slug}?sort=${slug}`}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] ${
                slug === sortSlug
                  ? "border-ink bg-ink text-white"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {PERIOD_LABELS[PERIOD_SLUGS[slug]]}
            </Link>
          ))}
        </div>
      </div>
      <FundTable funds={ranked} highlight={period} />
    </>
  );
}
