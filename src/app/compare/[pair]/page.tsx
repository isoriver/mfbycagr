import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { resolveFund } from "@/lib/fund";
import { fmtNav } from "@/lib/format";
import { ReturnPill } from "@/components/ReturnPill";
import { Sparkline } from "@/components/Sparkline";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, fundPath } from "@/lib/seo";
import { getComparePairs } from "@/lib/compare";
import type { FundSummary } from "@/lib/types";

export const revalidate = 86400;
export const dynamicParams = true;

const MAX_FUNDS = 4;

// Pre-render a curated set of popular same-category pairs; everything else is on-demand ISR.
export function generateStaticParams() {
  return getComparePairs().map((p) => ({ pair: p.slug }));
}

/** Parse "c1-vs-c2[-vs-c3[-vs-c4]]" into 2–4 numeric codes, or null if malformed. */
function parseCodes(pair: string): string[] | null {
  const parts = pair.split("-vs-");
  if (parts.length < 2 || parts.length > MAX_FUNDS) return null;
  if (!parts.every((p) => /^\d+$/.test(p))) return null;
  return Array.from(new Set(parts));
}

export async function generateMetadata({ params }: { params: { pair: string } }): Promise<Metadata> {
  const codes = parseCodes(params.pair);
  if (!codes) return {};
  const resolved = await Promise.all(codes.map((c) => resolveFund(c)));
  const names = resolved.filter(Boolean).map((r) => r!.summary.name);
  if (names.length < 2) return {};
  return pageMetadata({
    title: names.join(" vs "),
    description: `Compare ${names.join(", ")} side by side — CAGR (1Y/3Y/5Y/10Y), NAV and 30-day trend. Updated daily.`,
    path: `/compare/${params.pair}`,
  });
}

const ROWS: { key: "today" | "m1" | "m6" | "y1" | "y3" | "y5" | "y10"; label: string }[] = [
  { key: "today", label: "1 Day" },
  { key: "m1", label: "1M Return" },
  { key: "m6", label: "6M Return" },
  { key: "y1", label: "1Y CAGR" },
  { key: "y3", label: "3Y CAGR" },
  { key: "y5", label: "5Y CAGR" },
  { key: "y10", label: "10Y CAGR" },
];

/** Index of the fund with the highest value for a row (null if tie or no data). */
function bestIndex(values: (number | null)[]): number | null {
  let bi = -1;
  let bv = -Infinity;
  let ties = false;
  values.forEach((v, i) => {
    if (v == null) return;
    if (v > bv) {
      bv = v;
      bi = i;
      ties = false;
    } else if (v === bv) {
      ties = true;
    }
  });
  return bi >= 0 && !ties ? bi : null;
}

export default async function ComparePage({ params }: { params: { pair: string } }) {
  const codes = parseCodes(params.pair);
  if (!codes) notFound();
  const resolved = await Promise.all(codes.map((c) => resolveFund(c)));
  const funds = resolved.filter(Boolean).map((r) => r!.summary);
  if (funds.length < 2) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: funds.map((f) => f.house).join(" vs "), path: `/compare/${params.pair}` },
  ];

  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-2 pt-2">
        <h1 className="text-[24px] font-bold">
          {funds.map((f, i) => (
            <span key={f.code}>
              {i > 0 && <span className="text-faint"> vs </span>}
              {f.name}
            </span>
          ))}
        </h1>
        <p className="mt-2 text-[13px] text-dim">
          Side-by-side comparison of {funds.length} funds. Best figure in each row is highlighted.
        </p>
      </div>
      <div className="mx-auto max-w-content overflow-x-auto px-5 pb-10">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-panel">
              <th scope="col" className="px-3 py-3 text-left text-[12px] text-dim">
                Metric
              </th>
              {funds.map((f) => (
                <th key={f.code} scope="col" className="px-3 py-3 text-left align-top">
                  <Link
                    href={fundPath(f)}
                    className="text-[14px] font-semibold text-ink hover:text-link"
                  >
                    {f.name}
                  </Link>
                  <div className="mt-1 text-[12px] font-normal text-dim">
                    {f.house} · {f.category}
                  </div>
                  <div className="mt-1 text-[13px] font-normal tabular-nums">{fmtNav(f.nav)}</div>
                  <div className="mt-1">
                    <Sparkline points={f.spark} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = funds.map((f) => f[row.key]);
              const win = bestIndex(values);
              return (
                <tr key={row.key} className="border-b border-border">
                  <td className="px-3 py-2.5 text-[13px] text-dim">{row.label}</td>
                  {funds.map((f, i) => (
                    <td key={f.code} className={`px-3 py-2.5 ${win === i ? "bg-up-bg/40" : ""}`}>
                      <ReturnPill value={f[row.key]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
