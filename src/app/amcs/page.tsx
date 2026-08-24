import type { Metadata } from "next";
import Link from "next/link";
import { getHouses } from "@/lib/dataset";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

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
  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-10 pt-2">
        <h1 className="text-[24px] font-bold">Mutual Fund Houses (AMCs)</h1>
        <p className="mt-2 text-[13px] text-dim">{houses.length} fund houses tracked.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {houses.map((h) => (
            <Link
              key={h.slug}
              href={`/amc/${h.slug}`}
              className="rounded-lg border border-border p-4 transition-colors hover:border-accent"
            >
              <div className="text-[14px] font-semibold text-ink">{h.name}</div>
              <div className="mt-1 text-[12px] text-dim">
                {h.count} {h.count === 1 ? "scheme" : "schemes"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
