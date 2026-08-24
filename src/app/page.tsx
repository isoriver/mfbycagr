import Link from "next/link";
import {
  getAllFunds,
  getCategories,
  getSubcategories,
  rankByPeriod,
  sortFunds,
  paginate,
  ASSET_TYPES,
} from "@/lib/dataset";
import type { SortKey, SortDir } from "@/lib/dataset";
import { FundTable } from "@/components/FundTable";
import { Pagination } from "@/components/Pagination";
import { StructuredData } from "@/components/StructuredData";
import { itemListJsonLd } from "@/lib/seo";

export const revalidate = 86400;

const PAGE_SIZE = 100;

const VALID_SORT_KEYS: SortKey[] = ["name", "nav", "today", "y1", "y3", "y5", "y10"];
const DEFAULT_SORT: SortKey = "y5";
const DEFAULT_DIR: SortDir = "desc";

const PERIOD_RANKING_LINKS = [
  { slug: "1y", label: "1 Year" },
  { slug: "3y", label: "3 Years" },
  { slug: "5y", label: "5 Years" },
  { slug: "10y", label: "10 Years" },
];

export default function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const funds = getAllFunds();

  // ── parse search params ─────────────────────────────────────────────────────
  const rawPage = typeof searchParams.page === "string" ? searchParams.page : "1";
  const page = Math.max(1, parseInt(rawPage, 10) || 1);

  const rawSort = typeof searchParams.sort === "string" ? searchParams.sort : DEFAULT_SORT;
  const sortKey: SortKey = (VALID_SORT_KEYS.includes(rawSort as SortKey) ? rawSort : DEFAULT_SORT) as SortKey;

  const rawDir = typeof searchParams.dir === "string" ? searchParams.dir : DEFAULT_DIR;
  const sortDir: SortDir = rawDir === "asc" ? "asc" : "desc";

  const activeType = typeof searchParams.type === "string" ? searchParams.type : "";
  const activeCat = typeof searchParams.cat === "string" ? searchParams.cat : "";

  // ── filter ──────────────────────────────────────────────────────────────────
  let filtered = funds;
  if (activeType) filtered = filtered.filter((f) => f.type === activeType);
  if (activeCat) filtered = filtered.filter((f) => f.categorySlug === activeCat);

  // ── sort ────────────────────────────────────────────────────────────────────
  const sorted = sortFunds(filtered, sortKey, sortDir);
  const pageData = paginate(sorted, page, PAGE_SIZE);

  // ── category / subcategory cloud data ───────────────────────────────────────
  const allCategories = getCategories();
  // Count by type (from the full fund set, not filtered)
  const typeCounts = Object.fromEntries(
    ASSET_TYPES.map((t) => [t, funds.filter((f) => f.type === t).length]),
  );
  // Subcategories for the active type
  const subcategories = activeType ? getSubcategories(activeType) : [];

  // ── structured data (top 15 by 5Y for SEO) ──────────────────────────────────
  const top15 = rankByPeriod(funds, "y5").slice(0, 15);

  // ── helpers to build filter hrefs ───────────────────────────────────────────
  function buildHref(overrides: Record<string, string | undefined>): string {
    const sp = new URLSearchParams();
    const merged = { sort: sortKey, dir: sortDir, type: activeType, cat: activeCat, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : "/";
  }

  return (
    <>
      <StructuredData data={itemListJsonLd("Top Indian mutual funds by 5-year CAGR", top15)} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-5 pb-2 pt-10 text-center">
        <h1 className="text-[26px] font-bold leading-tight md:text-[32px]">
          Indian Mutual Funds Ranked by CAGR
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] text-dim">
          Every scheme, ranked by compounded annual growth across 1, 3, 5 and 10-year horizons.
          CAGR computed from official daily NAV history and refreshed daily. Currently tracking{" "}
          <strong className="text-ink">{funds.length.toLocaleString("en-IN")}</strong> direct-plan
          schemes with a recent NAV.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {PERIOD_RANKING_LINKS.map((p) => (
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

      {/* ── Asset-type cloud ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-5 pt-8">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-dim">
          Filter by asset type
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* "All" chip */}
          <Link
            href={buildHref({ type: "", cat: "", page: "" })}
            className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
              !activeType
                ? "border-ink bg-ink text-white"
                : "border-border text-dim hover:border-accent hover:text-ink"
            }`}
          >
            All
            <span className="ml-1.5 text-[11px] opacity-70">
              {funds.length.toLocaleString("en-IN")}
            </span>
          </Link>

          {ASSET_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0).map((t) => (
            <Link
              key={t}
              href={buildHref({ type: t, cat: "", page: "" })}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
                activeType === t
                  ? "border-ink bg-ink text-white"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {t}
              <span className="ml-1.5 text-[11px] opacity-70">
                {(typeCounts[t] ?? 0).toLocaleString("en-IN")}
              </span>
            </Link>
          ))}
        </div>

        {/* Subcategory cloud — shown only when an asset type is selected */}
        {activeType && subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {/* "All <type>" chip */}
            <Link
              href={buildHref({ cat: "", page: "" })}
              className={`rounded-full border px-3 py-1 text-[11.5px] transition-colors ${
                !activeCat
                  ? "border-accent bg-accent/10 text-accent font-medium"
                  : "border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              All {activeType}
            </Link>

            {subcategories.map((c) => (
              <Link
                key={c.slug}
                href={buildHref({ cat: c.slug, page: "" })}
                className={`rounded-full border px-3 py-1 text-[11.5px] transition-colors ${
                  activeCat === c.slug
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border text-dim hover:border-accent hover:text-ink"
                }`}
              >
                {c.name}
                <span className="ml-1 text-[10.5px] opacity-60">{c.count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Fund table ───────────────────────────────────────────────────────── */}
      <section className="pt-5">
        <div className="mx-auto max-w-content px-5 pb-3 flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold">
            {activeCat
              ? allCategories.find((c) => c.slug === activeCat)?.name ?? "Funds"
              : activeType
              ? `${activeType} funds`
              : "All funds"}{" "}
            <span className="text-[13px] font-normal text-dim">
              — {pageData.total.toLocaleString("en-IN")} total, page {pageData.page} of{" "}
              {pageData.totalPages}
            </span>
          </h2>
        </div>

        <FundTable
          funds={pageData.items}
          startRank={(pageData.page - 1) * PAGE_SIZE + 1}
          highlight="y5"
          sortKey={sortKey}
          sortDir={sortDir}
          searchParams={searchParams as Record<string, string | undefined>}
        />

        <Pagination
          page={pageData.page}
          totalPages={pageData.totalPages}
          buildHref={(p) => {
            const sp = new URLSearchParams();
            if (sortKey !== DEFAULT_SORT) sp.set("sort", sortKey);
            if (sortDir !== DEFAULT_DIR) sp.set("dir", sortDir);
            if (activeType) sp.set("type", activeType);
            if (activeCat) sp.set("cat", activeCat);
            if (p > 1) sp.set("page", String(p));
            const qs = sp.toString();
            return qs ? `?${qs}` : "/";
          }}
        />
      </section>
    </>
  );
}
