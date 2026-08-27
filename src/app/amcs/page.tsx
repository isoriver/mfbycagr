import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, getHouses } from "@/lib/dataset";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { HouseLogo } from "@/components/HouseLogo";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Mutual Fund Houses (AMCs) in India",
  description:
    "Browse Indian mutual fund houses (AMCs) — SBI, HDFC, ICICI Prudential, Axis and more. See every scheme from each AMC ranked by CAGR.",
  path: "/amcs",
});

export default function AmcsPage() {
  const houses = getHouses();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Fund Houses", path: "/amcs" },
  ];
  const totalFunds = getAllFunds().length;
  const houseListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Indian mutual fund houses (AMCs)",
    numberOfItems: houses.length,
    itemListElement: houses.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.name,
      url: absoluteUrl(`/amc/${h.slug}`),
    })),
  };

  return (
    <>
      <StructuredData data={[breadcrumbJsonLd(crumbs), houseListJsonLd]} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-10 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">Mutual Fund Houses (AMCs)</h1>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-dim">
          An Asset Management Company (AMC) is the firm that runs a mutual fund scheme — it employs
          the fund managers, sets the strategy and publishes the daily NAV. We track{" "}
          {totalFunds.toLocaleString("en-IN")} direct-plan schemes across {houses.length} fund
          houses. Open any AMC to see all of its schemes ranked by CAGR side by side, which is a
          fairer way to judge a fund house than looking only at its best-known fund.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {houses.map((h) => (
            <Link
              key={h.slug}
              href={`/amc/${h.slug}`}
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-accent"
            >
              <HouseLogo house={h.name} houseSlug={h.slug} size={36} />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-ink">{h.name}</div>
                <div className="mt-0.5 text-[12px] text-dim">
                  {h.count} {h.count === 1 ? "scheme" : "schemes"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
