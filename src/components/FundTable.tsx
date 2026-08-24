import Link from "next/link";
import type { FundSummary, Period } from "@/lib/types";
import { fmtNav, avatarColor, avatarInitials } from "@/lib/format";
import { ReturnPill } from "./ReturnPill";
import { Sparkline } from "./Sparkline";

const PERIOD_COLS: { key: Period; label: string }[] = [
  { key: "y1", label: "1Y" },
  { key: "y3", label: "3Y" },
  { key: "y5", label: "5Y" },
  { key: "y10", label: "10Y" },
];

export function FundTable({
  funds,
  startRank = 1,
  highlight,
}: {
  funds: FundSummary[];
  startRank?: number;
  highlight?: Period;
}) {
  return (
    <div className="mx-auto max-w-content overflow-x-auto px-5 pb-8">
      <table className="w-full min-w-[920px] border-collapse">
        <caption className="sr-only">Mutual funds with CAGR across 1, 3, 5 and 10 year horizons</caption>
        <thead>
          <tr className="border-y border-border bg-panel text-[11.5px] font-semibold text-dim">
            <th scope="col" className="w-11 px-2.5 py-2.5 text-center">#</th>
            <th scope="col" className="px-2.5 py-2.5 text-left">Fund</th>
            <th scope="col" className="px-2.5 py-2.5 text-left">Category</th>
            <th scope="col" className="px-2.5 py-2.5 text-right">NAV</th>
            <th scope="col" className="px-2.5 py-2.5 text-right">Today</th>
            {PERIOD_COLS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`px-2.5 py-2.5 text-right ${highlight === c.key ? "text-accent" : ""}`}
              >
                {c.label} CAGR
              </th>
            ))}
            <th scope="col" className="px-2.5 py-2.5 text-right">30D</th>
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
