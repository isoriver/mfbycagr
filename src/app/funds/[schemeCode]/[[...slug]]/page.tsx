import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, getFundsByCategory, getFundsByHouse, rankByPeriod } from "@/lib/dataset";
import { resolveFund } from "@/lib/fund";
import { getFundExtras } from "@/lib/fundExtras";
import { fmtNav, fmtDate, fmtAum, fmtPlainPct, avatarColor, avatarInitials } from "@/lib/format";
import { NavChart } from "@/components/NavChart";
import { AumChart } from "@/components/AumChart";
import { ReturnPill } from "@/components/ReturnPill";
import { FundTable } from "@/components/FundTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, fundJsonLd, fundPath } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { schemeCode: string; slug?: string[] };

// Pre-render the funds we know about (sample or top of the real dataset); the rest render on-demand.
export function generateStaticParams() {
  return getAllFunds()
    .slice(0, 200)
    .map((f) => ({ schemeCode: String(f.code), slug: [fundPath(f).split("/").pop() as string] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const resolved = await resolveFund(params.schemeCode);
  if (!resolved) return {};
  const f = resolved.summary;
  const parts = [f.y5 != null ? `5Y CAGR ${f.y5.toFixed(1)}%` : null, f.nav != null ? `NAV ${fmtNav(f.nav)}` : null]
    .filter(Boolean)
    .join(", ");
  return pageMetadata({
    title: `${f.name} — NAV & CAGR`,
    description: `${f.name} (${f.house}, ${f.category}). ${parts}. Historical returns and NAV chart, updated daily.`,
    path: fundPath(f),
  });
}

const ROWS: { key: "today" | "m1" | "m6" | "y1" | "y3" | "y5" | "y10"; label: string }[] = [
  { key: "today", label: "1 Day" },
  { key: "m1", label: "1 Month" },
  { key: "m6", label: "6 Month" },
  { key: "y1", label: "1 Year CAGR" },
  { key: "y3", label: "3 Year CAGR" },
  { key: "y5", label: "5 Year CAGR" },
  { key: "y10", label: "10 Year CAGR" },
];

export default async function FundPage({ params }: { params: Params }) {
  const resolved = await resolveFund(params.schemeCode);
  if (!resolved) notFound();
  const f = resolved.summary;
  const extras = getFundExtras(f.code);

  const similar = rankByPeriod(
    getFundsByCategory(f.categorySlug).filter((x) => x.code !== f.code),
    "y5",
  ).slice(0, 8);

  // Other funds from the same AMC — exclude this fund and the same-category funds already
  // shown above, so the two sections don't overlap. Ranked by 5Y CAGR.
  const similarCodes = new Set(similar.map((x) => x.code));
  const fromHouse = rankByPeriod(
    getFundsByHouse(f.houseSlug).filter((x) => x.code !== f.code && !similarCodes.has(x.code)),
    "y5",
  ).slice(0, 8);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: f.category, path: `/category/${f.categorySlug}` },
    { name: f.name, path: fundPath(f) },
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
              <caption className="sr-only">
                {f.name} returns by holding period
              </caption>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <th scope="row" className="py-2 text-left text-[13px] font-normal text-dim">
                      {row.label}
                    </th>
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

        {extras && (extras.expenseRatio != null || extras.aum != null) && (
          <section className="mt-6 rounded-lg border border-border p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Fund facts</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {extras.expenseRatio != null && (
                <div>
                  <dt className="text-[12px] text-dim">Expense ratio (Direct)</dt>
                  <dd className="mt-0.5 text-[18px] font-semibold tabular-nums">
                    {fmtPlainPct(extras.expenseRatio)}
                  </dd>
                </div>
              )}
              {extras.aum != null && (
                <div>
                  <dt className="text-[12px] text-dim">
                    AUM{extras.aumQuarter ? ` · ${extras.aumQuarter}` : ""}
                  </dt>
                  <dd className="mt-0.5 text-[18px] font-semibold tabular-nums">
                    {fmtAum(extras.aum)}
                  </dd>
                </div>
              )}
            </dl>

            {extras.aumHistory.length >= 2 && (
              <div className="mt-4">
                <h3 className="mb-1 text-[12px] font-semibold text-dim">Quarterly AUM trend</h3>
                <AumChart points={extras.aumHistory} />
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              Expense ratio (direct plan) and AUM are sourced from AMFI disclosures; AUM is the
              scheme&apos;s quarterly average across all plans. Figures are indicative — confirm
              against the scheme document before investing.
            </p>
          </section>
        )}

        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-1 text-[16px] font-semibold">Similar {f.category} funds</h2>
            <p className="mb-2 text-[12.5px] text-dim">Ranked by 5-year CAGR.</p>
            <FundTable funds={similar} highlight="y5" />
          </section>
        )}

        {fromHouse.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-1 text-[16px] font-semibold">More funds from {f.house}</h2>
            <p className="mb-2 text-[12.5px] text-dim">
              Other {f.house} schemes ranked by 5-year CAGR.{" "}
              <Link href={`/amc/${f.houseSlug}`} className="text-link hover:underline">
                View all {f.house} funds →
              </Link>
            </p>
            <FundTable funds={fromHouse} highlight="y5" />
          </section>
        )}
      </article>
    </>
  );
}
