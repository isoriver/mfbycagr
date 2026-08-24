import fs from "node:fs";
import path from "node:path";
import type { Dataset, FundSummary, Period } from "./types";
import { hasRecentNav } from "./freshness.ts";

const DATA_DIR = path.join(process.cwd(), "src", "data");

let cached: Dataset | null = null;

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
  return getDataset().funds.filter((fund) => hasRecentNav(fund.navDate));
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

export interface CategoryInfo {
  slug: string;
  name: string;
  type: string;
  count: number;
}

export function getCategories(): CategoryInfo[] {
  const map = new Map<string, CategoryInfo>();
  for (const f of getAllFunds()) {
    const existing = map.get(f.categorySlug);
    if (existing) existing.count++;
    else map.set(f.categorySlug, { slug: f.categorySlug, name: f.category, type: f.type, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
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
