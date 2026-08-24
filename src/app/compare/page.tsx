import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds } from "@/lib/dataset";
import { CompareForm } from "@/components/CompareForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import type { FundSummary } from "@/lib/types";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Compare Mutual Funds Side by Side",
  description:
    "Compare any two Indian mutual funds side by side — CAGR across 1Y, 3Y, 5Y and 10Y, NAV and 30-day trend.",
  path: "/compare",
});

export default function CompareIndexPage() {
  const funds = getAllFunds();
  const byCat = new Map<string, FundSummary[]>();
  for (const f of funds) {
    const arr = byCat.get(f.categorySlug) || [];
    arr.push(f);
    byCat.set(f.categorySlug, arr);
  }
  const suggestions: { label: string; href: string }[] = [];
  for (const arr of byCat.values()) {
    const top = [...arr].sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9)).slice(0, 2);
    if (top.length === 2) {
      suggestions.push({
        label: `${top[0].name} vs ${top[1].name}`,
        href: `/compare/${top[0].code}-vs-${top[1].code}`,
      });
    }
  }

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
          Pick two funds to see their CAGR, NAV and trend side by side.
        </p>
        <div className="mt-5 max-w-2xl">
          <CompareForm />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-10">
            <h2 className="pb-3 text-[15px] font-semibold">Popular comparisons</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {suggestions.slice(0, 12).map((s) => (
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
