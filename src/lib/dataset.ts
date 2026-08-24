import fs from "node:fs";
import path from "node:path";
import type { Dataset, FundSummary, Period } from "./types";
import { hasRecentNav } from "./freshness.ts";

const DATA_DIR = path.join(process.cwd(), "src", "data");

let cached: Dataset | null = null;

/**
 * Fund scheme codes with demonstrably incorrect CAGR data.
 * These are ICICI Prudential Overnight Fund variants whose 5-year NAV-based
 * CAGR is wildly wrong (58–67%) because of a calculation artefact.
 */
const EXCLUDED_CODES = new Set([145536, 145535, 145538, 145539, 145537, 145547]);

/**
 * Returns true for Regular Plan funds. Direct plans, ETFs, and unlabelled
 * funds are kept. We surface only Direct plans to avoid cluttering rankings
 * with near-duplicate Regular/Direct pairs.
 */
function isRegularPlan(name: string): boolean {
  return /\bregular\b/i.test(name);
}

/**
 * Load the precomputed dataset. Prefers the real `funds-summary.json` (produced by
 * `npm run build:data`); falls back to the committed sample so the site renders offline.
 */
export function getDataset(): Dataset {
  if (cached) return cached;
  const real = path.join(DATA_DIR, "funds-summary.json");
  const sample = path.join(DATA_DIR, "funds-summary.sample.json");
  const file = fs.existsSync(real) ? real : sample;
  const raw = fs.readFileSync(file, "utf8");
  cached = JSON.parse(raw) as Dataset;
  return cached;
}

export function getAllFunds(): FundSummary[] {
  return getDataset().funds.filter(
    (fund) =>
      hasRecentNav(fund.navDate) &&
      !EXCLUDED_CODES.has(fund.code) &&
      !isRegularPlan(fund.name),
  );
}

export function getFundByCode(code: number | string): FundSummary | undefined {
  const c = Number(code);
  return getAllFunds().find((f) => f.code === c);
}

export const PERIOD_LABELS: Record<Period, string> = {
  y1: "1Y",
  y3: "3Y",
  y5: "5Y",
  y10: "10Y",
};

export const PERIOD_SLUGS: Record<string, Period> = {
  "1y": "y1",
  "3y": "y3",
  "5y": "y5",
  "10y": "y10",
};

/** Sort funds by a period's CAGR, highest first; nulls sink to the bottom. */
export function rankByPeriod(funds: FundSummary[], period: Period): FundSummary[] {
  return [...funds].sort((a, b) => {
    const av = a[period];
    const bv = b[period];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return bv - av;
  });
}

export type SortKey = "name" | "nav" | "today" | Period;
export type SortDir = "asc" | "desc";

/** Generic sort for the fund table. Nulls always go to bottom. */
export function sortFunds(funds: FundSummary[], key: SortKey, dir: SortDir): FundSummary[] {
  return [...funds].sort((a, b) => {
    const av = a[key as keyof FundSummary] as string | number | null;
    const bv = b[key as keyof FundSummary] as string | number | null;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    const an = av as number;
    const bn = bv as number;
    return dir === "asc" ? an - bn : bn - an;
  });
}

export interface CategoryInfo {
  slug: string;
  name: string;
  type: string;
  count: number;
}

/** Broad asset-type groups used as top-level category cloud tabs. */
export const ASSET_TYPES = ["Equity", "Debt", "Hybrid", "Other", "Solution Oriented"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export function getCategories(): CategoryInfo[] {
  const map = new Map<string, CategoryInfo>();
  for (const f of getAllFunds()) {
    const existing = map.get(f.categorySlug);
    if (existing) existing.count++;
    else map.set(f.categorySlug, { slug: f.categorySlug, name: f.category, type: f.type, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Subcategories (specific category names) within a given asset type. */
export function getSubcategories(type: string): CategoryInfo[] {
  return getCategories().filter((c) => c.type === type);
}

export function getFundsByCategory(slug: string): FundSummary[] {
  return getAllFunds().filter((f) => f.categorySlug === slug);
}

export interface HouseInfo {
  slug: string;
  name: string;
  count: number;
}

export function getHouses(): HouseInfo[] {
  const map = new Map<string, HouseInfo>();
  for (const f of getAllFunds()) {
    const existing = map.get(f.houseSlug);
    if (existing) existing.count++;
    else map.set(f.houseSlug, { slug: f.houseSlug, name: f.house, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function getFundsByHouse(slug: string): FundSummary[] {
  return getAllFunds().filter((f) => f.houseSlug === slug);
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function paginate<T>(items: T[], page: number, pageSize = 50): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: p,
    totalPages,
    total,
    pageSize,
  };
}
