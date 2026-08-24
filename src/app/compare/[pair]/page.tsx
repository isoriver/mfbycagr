import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { resolveFund } from "@/lib/fund";
import { fmtNav } from "@/lib/format";
import { ReturnPill } from "@/components/ReturnPill";
import { Sparkline } from "@/components/Sparkline";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getAllFunds } from "@/lib/dataset";
import type { FundSummary } from "@/lib/types";

export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render a curated set of popular same-category pairs; everything else is on-demand ISR.
export function generateStaticParams() {
  const funds = getAllFunds();
  const byCat = new Map<string, FundSummary[]>();
  for (const f of funds) {
    const arr = byCat.get(f.categorySlug) || [];
    arr.push(f);
    byCat.set(f.categorySlug, arr);
  }
  const pairs: { pair: string }[] = [];
  for (const arr of byCat.values()) {
    const top = [...arr].sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9)).slice(0, 3);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        pairs.push({ pair: `${top[i].code}-vs-${top[j].code}` });
      }
    }
  }
  return pairs;
}

function parsePair(pair: string): [string, string] | null {
  const m = pair.match(/^(\d+)-vs-(\d+)$/);
  return m ? [m[1], m[2]] : null;
}

export async function generateMetadata({ params }: { params: { pair: string } }): Promise<Metadata> {
  const codes = parsePair(params.pair);
  if (!codes) return {};
  const [a, b] = await Promise.all([resolveFund(codes[0]), resolveFund(codes[1])]);
  if (!a || !b) return {};
  return pageMetadata({
    title: `${a.summary.name} vs ${b.summary.name}`,
    description: `Compare ${a.summary.name} and ${b.summary.name} side by side — CAGR (1Y/3Y/5Y/10Y), NAV and 30-day trend. Updated daily.`,
    path: `/compare/${params.pair}`,
  });
}

const ROWS: { key: "today" | "y1" | "y3" | "y5" | "y10"; label: string }[] = [
  { key: "today", label: "1 Day" },
  { key: "y1", label: "1Y CAGR" },
  { key: "y3", label: "3Y CAGR" },
  { key: "y5", label: "5Y CAGR" },
  { key: "y10", label: "10Y CAGR" },
];

function best(a: number | null, b: number | null): "a" | "b" | null {
  if (a == null || b == null) return null;
  if (a === b) return null;
  return a > b ? "a" : "b";
}

export default async function ComparePage({ params }: { params: { pair: string } }) {
  const codes = parsePair(params.pair);
  if (!codes) notFound();
  const [ra, rb] = await Promise.all([resolveFund(codes[0]), resolveFund(codes[1])]);
  if (!ra || !rb) notFound();
  const a = ra.summary;
  const b = rb.summary;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: `${a.house} vs ${b.house}`, path: `/compare/${params.pair}` },
  ];

  const Head = ({ f }: { f: FundSummary }) => (
    <th scope="col" className="px-3 py-3 text-left align-top">
      <Link href={`/funds/${f.code}`} className="text-[14px] font-semibold text-ink hover:text-link">
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
  );

  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-5 pb-2 pt-2">
        <h1 className="text-[24px] font-bold">
          {a.name} <span className="text-faint">vs</span> {b.name}
        </h1>
        <p className="mt-2 text-[13px] text-dim">Side-by-side CAGR comparison. Higher figure highlighted.</p>
      </div>
      <div className="mx-auto max-w-content overflow-x-auto px-5 pb-10">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-panel">
              <th scope="col" className="px-3 py-3 text-left text-[12px] text-dim">Metric</th>
              <Head f={a} />
              <Head f={b} />
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const win = best(a[row.key], b[row.key]);
              return (
                <tr key={row.key} className="border-b border-border">
                  <td className="px-3 py-2.5 text-[13px] text-dim">{row.label}</td>
                  <td className={`px-3 py-2.5 ${win === "a" ? "bg-up-bg/40" : ""}`}>
                    <ReturnPill value={a[row.key]} />
                  </td>
                  <td className={`px-3 py-2.5 ${win === "b" ? "bg-up-bg/40" : ""}`}>
                    <ReturnPill value={b[row.key]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
