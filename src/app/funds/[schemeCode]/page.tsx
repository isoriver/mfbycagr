import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, getFundsByCategory, rankByPeriod } from "@/lib/dataset";
import { resolveFund } from "@/lib/fund";
import { fmtNav, fmtDate, avatarColor, avatarInitials } from "@/lib/format";
import { NavChart } from "@/components/NavChart";
import { ReturnPill } from "@/components/ReturnPill";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, fundJsonLd } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render the funds we know about (sample or top of the real dataset); the rest render on-demand.
export function generateStaticParams() {
  return getAllFunds()
    .slice(0, 200)
    .map((f) => ({ schemeCode: String(f.code) }));
}

export async function generateMetadata({ params }: { params: { schemeCode: string } }): Promise<Metadata> {
  const resolved = await resolveFund(params.schemeCode);
  if (!resolved) return {};
  const f = resolved.summary;
  const parts = [f.y5 != null ? `5Y CAGR ${f.y5.toFixed(1)}%` : null, f.nav != null ? `NAV ${fmtNav(f.nav)}` : null]
    .filter(Boolean)
    .join(", ");
  return pageMetadata({
    title: `${f.name} — NAV & CAGR`,
    description: `${f.name} (${f.house}, ${f.category}). ${parts}. Historical returns and NAV chart, updated daily.`,
    path: `/funds/${f.code}`,
  });
}

const ROWS: { key: "today" | "y1" | "y3" | "y5" | "y10"; label: string }[] = [
  { key: "today", label: "1 Day" },
  { key: "y1", label: "1 Year CAGR" },
  { key: "y3", label: "3 Year CAGR" },
  { key: "y5", label: "5 Year CAGR" },
  { key: "y10", label: "10 Year CAGR" },
];

export default async function FundPage({ params }: { params: { schemeCode: string } }) {
  const resolved = await resolveFund(params.schemeCode);
  if (!resolved) notFound();
  const f = resolved.summary;

  const similar = rankByPeriod(
    getFundsByCategory(f.categorySlug).filter((x) => x.code !== f.code),
    "y5",
  ).slice(0, 8);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: f.category, path: `/category/${f.categorySlug}` },
    { name: f.name, path: `/funds/${f.code}` },
  ];

  return (
    <>
      <StructuredData data={[breadcrumbJsonLd(crumbs), fundJsonLd(f)]} />
      <Breadcrumbs crumbs={crumbs} />

      <article className="mx-auto max-w-content px-5 pb-10 pt-2">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ background: avatarColor(f.house) }}
            aria-hidden="true"
          >
            {avatarInitials(f.house)}
          </span>
          <div>
            <h1 className="text-[22px] font-bold leading-tight">{f.name}</h1>
            <p className="mt-1 text-[12.5px] text-dim">
              <Link href={`/amc/${f.houseSlug}`} className="text-link hover:underline">
                {f.house}
              </Link>{" "}
              ·{" "}
              <Link href={`/category/${f.categorySlug}`} className="text-link hover:underline">
                {f.category}
              </Link>{" "}
              · {f.type} · #{f.code}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-border p-4">
            <h2 className="mb-2 text-[14px] font-semibold">NAV history</h2>
            <NavChart points={resolved.navHistory} label={`${f.name} NAV history`} />
          </section>

          <section className="rounded-lg border border-border p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-dim">Latest NAV</span>
              <span className="text-[12px] text-faint">{fmtDate(f.navDate)}</span>
            </div>
            <div className="mt-1 text-[26px] font-bold tabular-nums">{fmtNav(f.nav)}</div>
            <table className="mt-4 w-full">
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="py-2 text-[13px] text-dim">{row.label}</td>
                    <td className="py-2 text-right">
                      <ReturnPill value={f[row.key]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[11px] leading-relaxed text-faint">
              CAGR is computed from growth-plan NAV history and is not investment advice.
            </p>
          </section>
        </div>

        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-1 text-[16px] font-semibold">Similar {f.category} funds</h2>
            <p className="mb-2 text-[12.5px] text-dim">Ranked by 5-year CAGR.</p>
            <FundTable funds={similar} highlight="y5" />
          </section>
        )}
      </article>
    </>
  );
}
