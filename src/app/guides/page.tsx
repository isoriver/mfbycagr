import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mutual Fund Guides",
  description:
    "Plain-English guides to Indian mutual funds — what CAGR means, how to choose a fund, ELSS, SIP vs lump sum and more.",
  path: "/guides",
});

export default function GuidesPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ];
  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-10 pt-2">
        <h1 className="text-[24px] font-bold">Mutual Fund Guides</h1>
        <p className="mt-2 text-[13px] text-dim">Understand CAGR and how to read fund performance.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:border-accent"
              >
                <div className="text-[15px] font-semibold text-ink">{g.title}</div>
                <p className="mt-1 text-[13px] text-dim">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
