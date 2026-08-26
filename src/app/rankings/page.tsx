import type { Metadata } from "next";
import Link from "next/link";
import { getAllFunds, rankByPeriod, PERIOD_SLUGS, PERIOD_LABELS } from "@/lib/dataset";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { ReturnPill } from "@/components/ReturnPill";
import { pageMetadata, breadcrumbJsonLd, fundPath } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: "Mutual Fund Rankings by CAGR",
  description:
    "Browse Indian mutual funds ranked by CAGR over 1, 3, 5 and 10-year horizons. Each ranking is computed from official daily NAV history and refreshed every day.",
  path: "/rankings",
});

const PERIODS = Object.keys(PERIOD_SLUGS);

export default function RankingsIndexPage() {
  const funds = getAllFunds();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings" },
  ];

  return (
    <>
      <StructuredData data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-10 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">Mutual Fund Rankings by CAGR</h1>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-dim">
          Four rankings of the same {funds.length.toLocaleString("en-IN")} direct-plan schemes, each
          over a different horizon. The lists differ more than you might expect: a fund leading over
          one year is frequently mid-table over ten, which is why we treat the longer horizons as the
          more meaningful test.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PERIODS.map((slug) => {
            const period = PERIOD_SLUGS[slug];
            const label = PERIOD_LABELS[period];
            const top = rankByPeriod(funds, period)
              .filter((f) => f[period] != null)
              .slice(0, 5);
            return (
              <section key={slug} className="rounded-lg border border-border p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[15px] font-semibold">Top by {label} CAGR</h2>
                  <Link href={`/rankings/${slug}`} className="text-[12.5px] text-link hover:underline">
                    View all →
                  </Link>
                </div>
                <ol className="mt-3 space-y-2">
                  {top.map((f, i) => (
                    <li key={f.code} className="flex items-center gap-2.5">
                      <span className="w-4 shrink-0 text-[11px] text-faint">{i + 1}</span>
                      <Link
                        href={fundPath(f)}
                        className="min-w-0 flex-1 truncate text-[12.5px] text-ink hover:text-link"
                      >
                        {f.name}
                      </Link>
                      <ReturnPill value={f[period]} />
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
