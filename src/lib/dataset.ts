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

// ── Memoized derived views ──────────────────────────────────────────────────────
// The raw dataset holds ~37k schemes. Filtering/indexing it is pure and depends only
// on the immutable `cached` dataset, so every derived view is computed once per process
// and reused. Without this, a single page render re-filtered all 37k records a dozen
// times (getCategories/getHouses/getFundsBy* each called getAllFunds internally).
let fundsCache: FundSummary[] | null = null;
let byCodeCache: Map<number, FundSummary> | null = null;
let byCategoryCache: Map<string, FundSummary[]> | null = null;
let byHouseCache: Map<string, FundSummary[]> | null = null;
let categoriesCache: CategoryInfo[] | null = null;
let housesCache: HouseInfo[] | null = null;

export function getAllFunds(): FundSummary[] {
  if (fundsCache) return fundsCache;
  fundsCache = getDataset().funds.filter(
    (fund) =>
      hasRecentNav(fund.navDate) &&
      !EXCLUDED_CODES.has(fund.code) &&
      !isRegularPlan(fund.name),
  );
  return fundsCache;
}

export function getFundByCode(code: number | string): FundSummary | undefined {
  if (!byCodeCache) {
    byCodeCache = new Map(getAllFunds().map((f) => [f.code, f]));
  }
  return byCodeCache.get(Number(code));
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

export type SortKey = "name" | "type" | "nav" | "today" | "m1" | "m6" | Period;
export type SortDir = "asc" | "desc";

/** Every column the listing tables can be ordered by. */
export const VALID_SORT_KEYS: SortKey[] = [
  "name",
  "type",
  "nav",
  "today",
  "m1",
  "m6",
  "y1",
  "y3",
  "y5",
  "y10",
];

// Shared defaults. Links that would only restate these must omit them, so the default
// view has exactly one URL (no `?sort=y5&dir=desc` duplicate of the bare path).
export const DEFAULT_SORT: SortKey = "y5";
export const DEFAULT_DIR: SortDir = "desc";

/**
 * Query params the listing pages actually understand. Anything else (utm_*, fbclid, junk)
 * is dropped when building internal links, so a single crawled tracking param can't spawn
 * a whole sort/dir/page subtree beneath it.
 */
export const KNOWN_LIST_PARAMS = ["sort", "dir", "page", "type", "cat", "q"] as const;

/** Resolve a raw `sort` value (SortKey or legacy period slug like "5y") to a SortKey. */
export function parseSortKey(raw: string | string[] | undefined): SortKey {
  if (typeof raw !== "string") return DEFAULT_SORT;
  const mapped = PERIOD_SLUGS[raw] ?? raw;
  return VALID_SORT_KEYS.includes(mapped as SortKey) ? (mapped as SortKey) : DEFAULT_SORT;
}

export function parseSortDir(raw: string | string[] | undefined): SortDir {
  return raw === "asc" ? "asc" : "desc";
}

export function parsePage(raw: string | string[] | undefined): number {
  const n = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * True when the request carries a sort/filter permutation rather than the canonical
 * default view. Used to mark such URLs noindex so the crawl budget goes to real content.
 */
export function isNonCanonicalListView(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "";
  const dir = typeof searchParams.dir === "string" ? searchParams.dir : "";
  const hasNonDefaultSort = sort !== "" && parseSortKey(sort) !== DEFAULT_SORT;
  const hasNonDefaultDir = dir !== "" && parseSortDir(dir) !== DEFAULT_DIR;
  const hasFilter = !!searchParams.type || !!searchParams.cat;
  // Any explicitly-restated default (?sort=y5) is also a duplicate of the bare URL.
  const restatesDefault = (sort !== "" && !hasNonDefaultSort) || (dir !== "" && !hasNonDefaultDir);
  return hasNonDefaultSort || hasNonDefaultDir || hasFilter || restatesDefault;
}

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
  if (categoriesCache) return categoriesCache;
  const map = new Map<string, CategoryInfo>();
  for (const f of getAllFunds()) {
    const existing = map.get(f.categorySlug);
    if (existing) existing.count++;
    else map.set(f.categorySlug, { slug: f.categorySlug, name: f.category, type: f.type, count: 1 });
  }
  categoriesCache = [...map.values()].sort((a, b) => b.count - a.count);
  return categoriesCache;
}

/** Subcategories (specific category names) within a given asset type. */
export function getSubcategories(type: string): CategoryInfo[] {
  return getCategories().filter((c) => c.type === type);
}

/** Look up a category by slug in O(1) — used by page metadata and headings. */
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getFundsByCategory(slug: string): FundSummary[] {
  if (!byCategoryCache) {
    byCategoryCache = new Map();
    for (const f of getAllFunds()) {
      const arr = byCategoryCache.get(f.categorySlug);
      if (arr) arr.push(f);
      else byCategoryCache.set(f.categorySlug, [f]);
    }
  }
  return byCategoryCache.get(slug) ?? [];
}

export interface HouseInfo {
  slug: string;
  name: string;
  count: number;
}

export function getHouses(): HouseInfo[] {
  if (housesCache) return housesCache;
  const map = new Map<string, HouseInfo>();
  for (const f of getAllFunds()) {
    const existing = map.get(f.houseSlug);
    if (existing) existing.count++;
    else map.set(f.houseSlug, { slug: f.houseSlug, name: f.house, count: 1 });
  }
  housesCache = [...map.values()].sort((a, b) => b.count - a.count);
  return housesCache;
}

/** Look up a fund house by slug in O(1). */
export function getHouseBySlug(slug: string): HouseInfo | undefined {
  return getHouses().find((h) => h.slug === slug);
}

export function getFundsByHouse(slug: string): FundSummary[] {
  if (!byHouseCache) {
    byHouseCache = new Map();
    for (const f of getAllFunds()) {
      const arr = byHouseCache.get(f.houseSlug);
      if (arr) arr.push(f);
      else byHouseCache.set(f.houseSlug, [f]);
    }
  }
  return byHouseCache.get(slug) ?? [];
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
