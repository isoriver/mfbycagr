import { getScheme } from "./mfapi";
import { computeReturns, parseNavDate } from "./returns";
import { getFundByCode } from "./dataset";
import { cleanCategory, slugify, assetType, deriveHouse } from "./slug";
import type { FundSummary } from "./types";

export interface ResolvedFund {
  summary: FundSummary;
  navHistory: { date: string; nav: number }[];
}

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(arr[Math.floor(i * step)]);
  out.push(arr[arr.length - 1]);
  return out;
}

/**
 * Resolve a fund for a detail/compare page: fetch live NAV history from MFapi and
 * compute returns; fall back to the committed dataset row when the network is
 * unavailable (offline dev / rate limits). Returns null if the code is unknown.
 */
export async function resolveFund(code: string | number): Promise<ResolvedFund | null> {
  const existing = getFundByCode(code);
  try {
    const detail = await getScheme(code);
    if (detail?.data?.length) {
      const r = computeReturns(detail.data);
      const category = cleanCategory(detail.meta.scheme_category);
      const house = deriveHouse(detail.meta.scheme_name || existing?.name || "", detail.meta.fund_house);
      const summary: FundSummary = {
        code: Number(code),
        name: detail.meta.scheme_name || existing?.name || `Scheme #${code}`,
        house,
        houseSlug: slugify(house),
        category,
        categorySlug: slugify(category),
        type: assetType(detail.meta.scheme_category, detail.meta.scheme_type),
        nav: r.latestNav,
        navDate: r.latestDate,
        today: r.today,
        y1: r.cagr.y1,
        y3: r.cagr.y3,
        y5: r.cagr.y5,
        y10: r.cagr.y10,
        spark: r.spark,
      };
      const navHistory = detail.data
        .map((d) => ({ date: d.date, nav: parseFloat(d.nav), timestamp: parseNavDate(d.date)?.getTime() }))
        .filter((d): d is { date: string; nav: number; timestamp: number } =>
          Number.isFinite(d.nav) && d.timestamp != null,
        )
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ date, nav }) => ({ date, nav }));
      return { summary, navHistory: downsample(navHistory, 200) };
    }
  } catch {
    /* fall through to dataset */
  }
  if (existing) {
    return { summary: existing, navHistory: existing.spark.map((nav, i) => ({ date: `pt-${i}`, nav })) };
  }
  return null;
}
