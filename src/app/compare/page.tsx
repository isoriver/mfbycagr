import type { Metadata } from "next";
import Link from "next/link";
import { getComparePairs } from "@/lib/compare";
import { CompareForm } from "@/components/CompareForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Compare Mutual Funds Side by Side",
  description:
    "Compare up to 4 Indian mutual funds side by side — CAGR across 1Y, 3Y, 5Y and 10Y, NAV and 30-day trend.",
  path: "/compare",
});

export default function CompareIndexPage() {
  // Link every prerendered comparison so none are orphaned.
  const suggestions = getComparePairs().map((p) => ({
    label: `${p.funds[0].name} vs ${p.funds[1].name}`,
    href: `/compare/${p.slug}`,
  }));

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
  ];

  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-10 pt-2">
        <h1 className="text-[24px] font-bold">Compare Mutual Funds</h1>
        <p className="mt-2 text-[13px] text-dim">
          Pick 2 to 4 funds to see their CAGR, NAV and trend side by side.
        </p>
        <div className="mt-5 max-w-2xl">
          <CompareForm />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-10">
            <h2 className="pb-3 text-[15px] font-semibold">Popular comparisons</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-[13px] text-link hover:underline">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
