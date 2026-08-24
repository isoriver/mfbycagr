import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFundsByHouse, getHouses, rankByPeriod } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return getHouses().map((h) => ({ slug: h.slug }));
}

function houseName(slug: string) {
  return getHouses().find((h) => h.slug === slug)?.name;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const name = houseName(params.slug);
  if (!name) return {};
  return pageMetadata({
    title: `${name} Mutual Funds — All Schemes Ranked by CAGR`,
    description: `Every ${name} mutual fund scheme ranked by CAGR (1Y, 3Y, 5Y, 10Y), with NAV and 30-day trend. Updated daily.`,
    path: `/amc/${params.slug}`,
  });
}

export default function AmcPage({ params }: { params: { slug: string } }) {
  const name = houseName(params.slug);
  const funds = getFundsByHouse(params.slug);
  if (!name || funds.length === 0) notFound();

  const ranked = rankByPeriod(funds, "y5");
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Fund Houses", path: "/amcs" },
    { name, path: `/amc/${params.slug}` },
  ];

  return (
    <>
      <StructuredData data={[breadcrumbJsonLd(crumbs), itemListJsonLd(`${name} mutual funds`, ranked)]} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-2 pt-2">
        <h1 className="text-[24px] font-bold">{name} Mutual Funds</h1>
        <p className="mt-2 text-[13px] text-dim">
          {funds.length} {funds.length === 1 ? "scheme" : "schemes"} from {name}, ranked by 5-year CAGR.
        </p>
      </div>
      <FundTable funds={ranked} highlight="y5" />
    </>
  );
}
