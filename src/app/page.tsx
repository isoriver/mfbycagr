import Link from "next/link";
import { getAllFunds, getCategories, rankByPeriod } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { CategoryCard } from "@/components/CategoryCard";
import { StructuredData } from "@/components/StructuredData";
import { itemListJsonLd } from "@/lib/seo";

export const revalidate = 86400;

const PERIODS = [
  { slug: "1y", label: "1 Year" },
  { slug: "3y", label: "3 Years" },
  { slug: "5y", label: "5 Years" },
  { slug: "10y", label: "10 Years" },
];

export default function HomePage() {
  const funds = getAllFunds();
  const top = rankByPeriod(funds, "y5").slice(0, 15);
  const categories = getCategories().slice(0, 12);

  return (
    <>
      <StructuredData data={itemListJsonLd("Top Indian mutual funds by 5-year CAGR", top)} />

      <section className="mx-auto max-w-content px-5 pb-2 pt-10 text-center">
        <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">
          Indian Mutual Funds Ranked by CAGR
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] text-dim">
          Every scheme, ranked by compounded annual growth across 1, 3, 5 and 10-year horizons.
          CAGR computed from official daily NAV history and refreshed daily. Currently tracking{" "}
          <strong className="text-ink">{funds.length.toLocaleString("en-IN")}</strong> schemes with a recent NAV.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.slug}
              href={`/rankings/${p.slug}`}
              className="rounded-full border border-border px-4 py-1.5 text-[12.5px] text-dim hover:border-accent hover:text-ink"
            >
              Top by {p.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="pt-6">
        <h2 className="mx-auto max-w-content px-5 pb-3 text-[16px] font-semibold">
          Top 15 funds by 5-year CAGR
        </h2>
        <FundTable funds={top} highlight="y5" />
        <div className="mx-auto max-w-content px-5">
          <Link href="/rankings/5y" className="text-[13px] text-link hover:underline">
            See the full 5-year ranking →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-10">
        <h2 className="pb-4 text-[16px] font-semibold">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
        <div className="mt-4">
          <Link href="/categories" className="text-[13px] text-link hover:underline">
            All categories →
          </Link>
        </div>
      </section>
    </>
  );
}
