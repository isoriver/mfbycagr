import { getScheme } from "./mfapi";
import { computeReturns, splitAdjustedSeries } from "./returns";
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
      const schemeName = detail.meta.scheme_name || existing?.name || `Scheme #${code}`;
      const category = cleanCategory(detail.meta.scheme_category, schemeName);
      const house = deriveHouse(schemeName, detail.meta.fund_house);
      const summary: FundSummary = {
        code: Number(code),
        name: schemeName,
        house,
        houseSlug: slugify(house),
        category,
        categorySlug: slugify(category),
        type: assetType(detail.meta.scheme_category, detail.meta.scheme_type, schemeName),
        nav: r.latestNav,
        navDate: r.latestDate,
        today: r.today,
        m1: r.m1,
        m6: r.m6,
        y1: r.cagr.y1,
        y3: r.cagr.y3,
        y5: r.cagr.y5,
        y10: r.cagr.y10,
        spark: r.spark,
      };
      // Split-adjusted so the chart is continuous across re-denominations (no fake cliff).
      const navHistory = splitAdjustedSeries(detail.data);
      return { summary, navHistory: downsample(navHistory, 500) };
    }
  } catch {
    /* fall through to dataset */
  }
  if (existing) {
    return { summary: existing, navHistory: existing.spark.map((nav, i) => ({ date: `pt-${i}`, nav })) };
  }
  return null;
}
