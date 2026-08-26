import Link from "next/link";
import type { FundSummary, Period } from "@/lib/types";
import type { SortKey, SortDir } from "@/lib/dataset";
import { DEFAULT_SORT, DEFAULT_DIR, KNOWN_LIST_PARAMS } from "@/lib/dataset";
import { fmtNav, avatarColor, avatarInitials } from "@/lib/format";
import { fundPath } from "@/lib/seo";
import { ReturnPill } from "./ReturnPill";
import { Sparkline } from "./Sparkline";

// Sub-year windows are simple (point-to-point) returns; yearly windows are CAGR.
const RETURN_COLS: { key: "m1" | "m6" | Period; label: string; sub: string }[] = [
  { key: "m1", label: "1M", sub: "return" },
  { key: "m6", label: "6M", sub: "return" },
  { key: "y1", label: "1Y", sub: "CAGR" },
  { key: "y3", label: "3Y", sub: "CAGR" },
  { key: "y5", label: "5Y", sub: "CAGR" },
  { key: "y10", label: "10Y", sub: "CAGR" },
];

/**
 * Build the href for a sort header click — toggles asc/desc and resets to page 1.
 * Only known params are carried over (so a stray `?utm_source=…` can't seed a whole
 * sort/dir subtree), and values equal to the defaults are omitted so the canonical
 * default view keeps exactly one URL.
 */
function sortHref(
  currentParams: URLSearchParams,
  key: SortKey,
  currentSort: SortKey,
  currentDir: SortDir,
): string {
  const next = new URLSearchParams();
  // Preserve only the params that identify *which* rows are listed — including the search
  // query, without which a sort link on /search would navigate away from the results.
  for (const p of ["q", "type", "cat"] as const) {
    const v = currentParams.get(p);
    if (v) next.set(p, v);
  }
  const dir: SortDir = key === currentSort && currentDir === "desc" ? "asc" : "desc";
  if (key !== DEFAULT_SORT) next.set("sort", key);
  if (dir !== DEFAULT_DIR) next.set("dir", dir);
  const qs = next.toString();
  return qs ? `?${qs}` : "?";
}

/** Decorative sort glyph. Hidden from AT — state is conveyed via aria-sort on the <th>. */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span className="ml-1 inline-block text-[10px] text-faint opacity-60" aria-hidden="true">
        ⇅
      </span>
    );
  }
  return (
    <span className="ml-1 inline-block text-[10px] text-accent" aria-hidden="true">
      {dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

/** Maps our sort direction onto the aria-sort token screen readers expect. */
function ariaSort(active: boolean, dir: SortDir): "ascending" | "descending" | "none" {
  if (!active) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

export function FundTable({
  funds,
  startRank = 1,
  highlight,
  sortKey,
  sortDir,
  searchParams,
  openInNewTab = false,
}: {
  funds: FundSummary[];
  startRank?: number;
  highlight?: Period;
  sortKey?: SortKey;
  sortDir?: SortDir;
  /** Current page's full search-param string (for building sort links). */
  searchParams?: Record<string, string | string[] | undefined>;
  /** Open each fund link in a new tab (used on the search results page). */
  openInNewTab?: boolean;
}) {
  // Fall back to the page's ranking column (`highlight`) so the accent + arrow always
  // sit on the column the table is actually ordered by — never a stale default.
  const activeSortKey: SortKey = sortKey ?? highlight ?? "y5";
  const activeSortDir: SortDir = sortDir ?? "desc";

  // Carry over only the params the listing pages understand — never arbitrary/tracking
  // params, which would otherwise multiply the crawlable URL space without bound.
  const sp = new URLSearchParams();
  if (searchParams) {
    for (const k of KNOWN_LIST_PARAMS) {
      const v = searchParams[k];
      if (typeof v === "string" && v) sp.set(k, v);
    }
  }

  function thHref(key: SortKey) {
    return sortHref(sp, key, activeSortKey, activeSortDir);
  }

  // No cursor-pointer on the <th> itself: only the inner <Link> is interactive, so a
  // pointer over the cell's dead padding would be misleading.
  const thBase = "group px-2.5 py-2.5 select-none hover:text-ink transition-colors";
  const thActive = "text-accent";
  const thInactive = "text-dim";

  // Sort chips only appear where sorting is actually wired up (homepage / category).
  const showSort = !!searchParams;
  // The four CAGR horizons shown inside each mobile card.
  const CARD_COLS = RETURN_COLS.filter((c) => c.sub === "CAGR");
  const linkTabProps = openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="mx-auto max-w-content px-4 pb-8 sm:px-5">
      {/* ── Mobile: sort chips ─────────────────────────────────────────────── */}
      {showSort && (
        <div className="-mx-4 mb-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:hidden">
          <span className="shrink-0 text-[12px] font-medium text-faint">Sort by</span>
          {RETURN_COLS.map((c) => {
            const active = activeSortKey === c.key;
            return (
              <Link
                key={c.key}
                href={thHref(c.key)}
                rel="nofollow"
                aria-current={active ? "true" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-border text-dim"
                }`}
              >
                {c.label}
                {active && (
                  <>
                    <span aria-hidden="true">{activeSortDir === "desc" ? " ↓" : " ↑"}</span>
                    <span className="sr-only">
                      {activeSortDir === "desc" ? ", sorted high to low" : ", sorted low to high"}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Mobile: card list ──────────────────────────────────────────────── */}
      <ul className="space-y-2 md:hidden">
        {funds.map((f, i) => (
          <li key={f.code}>
            <Link
              href={fundPath(f)}
              {...linkTabProps}
              className="block rounded-lg border border-border p-3 active:bg-panel"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                  style={{ background: avatarColor(f.house) }}
                  aria-hidden="true"
                >
                  {avatarInitials(f.house)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium leading-snug text-ink">
                    {f.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-faint">
                    {f.house} · {f.type}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[13px] font-semibold tabular-nums text-ink">{fmtNav(f.nav)}</div>
                  <div className="text-[10.5px] text-faint">#{startRank + i}</div>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-4 gap-1 border-t border-border pt-2.5">
                {CARD_COLS.map((c) => (
                  <div key={c.key} className="text-center">
                    <div className="text-[9.5px] uppercase tracking-wide text-faint">{c.label}</div>
                    <div className="mt-0.5">
                      <ReturnPill value={f[c.key]} />
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Desktop: full sortable table ───────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[1040px] border-collapse">
        <caption className="sr-only">
          Mutual funds with CAGR across 1, 3, 5 and 10 year horizons
        </caption>
        <thead>
          <tr className="border-y border-border bg-panel text-[11.5px] font-semibold">
            {/* # — not sortable */}
            <th scope="col" className="w-11 px-2.5 py-2.5 text-center text-dim">
              #
            </th>

            {/* Fund name */}
            <th
              scope="col"
              aria-sort={ariaSort(activeSortKey === "name", activeSortDir)}
              className={`${thBase} text-left ${activeSortKey === "name" ? thActive : thInactive}`}
            >
              <Link href={thHref("name")} rel="nofollow" className="flex items-center">
                Fund
                <SortIcon active={activeSortKey === "name"} dir={activeSortDir} />
              </Link>
            </th>

            {/* Category — sortable by asset type */}
            <th
              scope="col"
              aria-sort={ariaSort(activeSortKey === "type", activeSortDir)}
              className={`${thBase} text-left ${activeSortKey === "type" ? thActive : thInactive}`}
            >
              <Link href={thHref("type")} rel="nofollow" className="flex items-center">
                Category
                <SortIcon active={activeSortKey === "type"} dir={activeSortDir} />
              </Link>
            </th>

            {/* NAV */}
            <th
              scope="col"
              aria-sort={ariaSort(activeSortKey === "nav", activeSortDir)}
              className={`${thBase} text-right ${activeSortKey === "nav" ? thActive : thInactive}`}
            >
              <Link href={thHref("nav")} rel="nofollow" className="flex items-center justify-end">
                NAV
                <SortIcon active={activeSortKey === "nav"} dir={activeSortDir} />
              </Link>
            </th>

            {/* Today */}
            <th
              scope="col"
              aria-sort={ariaSort(activeSortKey === "today", activeSortDir)}
              className={`${thBase} text-right ${activeSortKey === "today" ? thActive : thInactive}`}
            >
              <Link href={thHref("today")} rel="nofollow" className="flex items-center justify-end">
                Today
                <SortIcon active={activeSortKey === "today"} dir={activeSortDir} />
              </Link>
            </th>

            {/* Return columns: 1M/6M (absolute) + 1Y/3Y/5Y/10Y CAGR */}
            {RETURN_COLS.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={ariaSort(activeSortKey === c.key, activeSortDir)}
                className={`${thBase} text-right ${activeSortKey === c.key ? thActive : thInactive}`}
              >
                <Link
                  href={thHref(c.key)}
                  rel="nofollow"
                  className="flex items-center justify-end whitespace-nowrap"
                >
                  {c.label}
                  <span className="ml-1 text-[9.5px] font-normal uppercase tracking-wide text-faint">
                    {c.sub}
                  </span>
                  <SortIcon active={activeSortKey === c.key} dir={activeSortDir} />
                </Link>
              </th>
            ))}

            {/* 30D sparkline — not sortable */}
            <th scope="col" className="px-2.5 py-2.5 text-right text-[11.5px] font-semibold text-dim">
              30D
            </th>
          </tr>
        </thead>
        <tbody>
          {funds.map((f, i) => (
            <tr key={f.code} className="border-b border-border hover:bg-[#fbfbfb]">
              <td className="px-2.5 py-2.5 text-center text-dim">{startRank + i}</td>
              <td className="px-2.5 py-2.5 text-left">
                <Link
                  href={fundPath(f)}
                  {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-2.5 group"
                >
                  <span
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ background: avatarColor(f.house) }}
                    aria-hidden="true"
                  >
                    {avatarInitials(f.house)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-tight text-ink group-hover:text-link">
                      {f.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-faint">
                      {f.house} · #{f.code}
                    </span>
                  </span>
                </Link>
              </td>
              {/* Links to the fund's own category page — a real indexable destination.
                  (Previously pointed at /?type=X, which canonicalises to "/", wasting
                  the site's highest-frequency internal link.) */}
              <td className="px-2.5 py-2.5 text-left text-[12px] text-dim">
                <Link
                  href={`/category/${f.categorySlug}`}
                  className="hover:text-link hover:underline"
                  title={`${f.category} · ${f.type}`}
                >
                  {f.category}
                </Link>
              </td>
              <td className="px-2.5 py-2.5 text-right tabular-nums">{fmtNav(f.nav)}</td>
              <td className="px-2.5 py-2.5 text-right">
                <ReturnPill value={f.today} />
              </td>
              {RETURN_COLS.map((c) => (
                <td key={c.key} className="px-2.5 py-2.5 text-right">
                  <ReturnPill value={f[c.key]} />
                </td>
              ))}
              <td className="px-2.5 py-2.5 text-right">
                <Sparkline points={f.spark} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
