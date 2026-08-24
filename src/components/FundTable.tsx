import Link from "next/link";
import type { FundSummary, Period } from "@/lib/types";
import type { SortKey, SortDir } from "@/lib/dataset";
import { fmtNav, avatarColor, avatarInitials } from "@/lib/format";
import { ReturnPill } from "./ReturnPill";
import { Sparkline } from "./Sparkline";

const PERIOD_COLS: { key: Period; label: string }[] = [
  { key: "y1", label: "1Y CAGR" },
  { key: "y3", label: "3Y CAGR" },
  { key: "y5", label: "5Y CAGR" },
  { key: "y10", label: "10Y CAGR" },
];

/** Build the href for a sort header click — toggles asc/desc, resets to page 1. */
function sortHref(
  currentParams: URLSearchParams,
  key: SortKey,
  currentSort: SortKey,
  currentDir: SortDir,
): string {
  const next = new URLSearchParams(currentParams);
  next.set("sort", key);
  next.set("dir", key === currentSort && currentDir === "desc" ? "asc" : "desc");
  next.delete("page");
  return `?${next.toString()}`;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span className="ml-1 inline-block text-[10px] text-faint opacity-50">⇅</span>
    );
  }
  return (
    <span className="ml-1 inline-block text-[10px] text-accent">
      {dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

export function FundTable({
  funds,
  startRank = 1,
  highlight,
  sortKey,
  sortDir,
  searchParams,
}: {
  funds: FundSummary[];
  startRank?: number;
  highlight?: Period;
  sortKey?: SortKey;
  sortDir?: SortDir;
  /** Current page's full search-param string (for building sort links). */
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const activeSortKey: SortKey = sortKey ?? "y5";
  const activeSortDir: SortDir = sortDir ?? "desc";

  // Build a URLSearchParams from the current search params so sort links preserve
  // other filters (category, page size, etc.)
  const sp = new URLSearchParams();
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string") sp.set(k, v);
    }
  }

  function thHref(key: SortKey) {
    return sortHref(sp, key, activeSortKey, activeSortDir);
  }

  const thBase =
    "group px-2.5 py-2.5 select-none cursor-pointer hover:text-ink transition-colors";
  const thActive = "text-accent";
  const thInactive = "text-dim";

  return (
    <div className="mx-auto max-w-content overflow-x-auto px-5 pb-8">
      <table className="w-full min-w-[920px] border-collapse">
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
            <th scope="col" className={`${thBase} text-left ${activeSortKey === "name" ? thActive : thInactive}`}>
              <Link href={thHref("name")} className="flex items-center">
                Fund
                <SortIcon active={activeSortKey === "name"} dir={activeSortDir} />
              </Link>
            </th>

            {/* Category — not sortable */}
            <th scope="col" className="px-2.5 py-2.5 text-left text-[11.5px] font-semibold text-dim">
              Category
            </th>

            {/* NAV */}
            <th scope="col" className={`${thBase} text-right ${activeSortKey === "nav" ? thActive : thInactive}`}>
              <Link href={thHref("nav")} className="flex items-center justify-end">
                NAV
                <SortIcon active={activeSortKey === "nav"} dir={activeSortDir} />
              </Link>
            </th>

            {/* Today */}
            <th scope="col" className={`${thBase} text-right ${activeSortKey === "today" ? thActive : thInactive}`}>
              <Link href={thHref("today")} className="flex items-center justify-end">
                Today
                <SortIcon active={activeSortKey === "today"} dir={activeSortDir} />
              </Link>
            </th>

            {/* CAGR columns */}
            {PERIOD_COLS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`${thBase} text-right ${
                  activeSortKey === c.key
                    ? thActive
                    : highlight === c.key
                    ? "text-accent cursor-pointer"
                    : thInactive
                }`}
              >
                <Link href={thHref(c.key)} className="flex items-center justify-end">
                  {c.label}
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
                <Link href={`/funds/${f.code}`} className="flex items-center gap-2.5 group">
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
              <td className="max-w-[130px] px-2.5 py-2.5 text-left text-[12px] text-dim">
                <Link href={`/category/${f.categorySlug}`} className="hover:text-link hover:underline">
                  {f.category}
                </Link>
              </td>
              <td className="px-2.5 py-2.5 text-right tabular-nums">{fmtNav(f.nav)}</td>
              <td className="px-2.5 py-2.5 text-right">
                <ReturnPill value={f.today} />
              </td>
              {PERIOD_COLS.map((c) => (
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
  );
}
