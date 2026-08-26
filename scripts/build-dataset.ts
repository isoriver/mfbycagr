/**
 * Build the precomputed fund summary dataset.
 *
 * Fetches the full scheme universe from MFapi.in, then each scheme's NAV history
 * with bounded concurrency, computes returns/CAGR, and writes:
 *   src/data/funds-summary.json   { meta, funds: FundSummary[] }
 *
 * Resumable: each scheme's raw NAV history is cached under scripts/.cache/raw/<code>.json.
 * Summaries are always recomputed from that cache on every run, so a re-run after a
 * crash / rate-limit skips already-fetched schemes AND any change to the returns/CAGR
 * math is picked up without refetching. Delete scripts/.cache/raw to force a full refetch.
 *
 * Run with: npm run build:data
 * Env: MFAPI_BASE (default https://api.mfapi.in), MF_CONCURRENCY (default 8),
 *      MF_LIMIT (optional cap on number of schemes, for testing).
 */
import fs from "node:fs";
import path from "node:path";
import { computeReturns } from "../src/lib/returns.ts";
import { cleanCategory, slugify, assetType, deriveHouse } from "../src/lib/slug.ts";
import { hasRecentNav } from "../src/lib/freshness.ts";
import { isRankableName, isPlausibleCagr, isPlausibleShortReturn } from "../src/lib/eligibility.ts";
import type { FundSummary, SchemeListItem, SchemeDetail, Dataset } from "../src/lib/types.ts";

const BASE = process.env.MFAPI_BASE || "https://api.mfapi.in";
const CONCURRENCY = Number(process.env.MF_CONCURRENCY || 8);
const LIMIT = process.env.MF_LIMIT ? Number(process.env.MF_LIMIT) : Infinity;

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CACHE_DIR = path.join(process.cwd(), "scripts", ".cache");
const RAW_DIR = path.join(CACHE_DIR, "raw");
const OUT = path.join(DATA_DIR, "funds-summary.json");

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

async function fetchJson<T>(url: string, retries = 3, timeoutMs = 20000): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
      clearTimeout(timer);
      if (res.status === 429) throw new Error("rate-limited");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) await sleep(500 * (attempt + 1) + Math.random() * 300);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`fetch failed: ${url}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toSummary(code: number, detail: SchemeDetail, fallbackName: string): FundSummary | null {
  if (!detail?.data?.length) return null;
  const name = detail.meta.scheme_name || fallbackName || `Scheme #${code}`;
  // Rank Direct-plan Growth options only — drop Regular plans and IDCW/Dividend variants.
  if (!isRankableName(name)) return null;
  const r = computeReturns(detail.data);
  if (r.latestNav == null) return null;
  const category = cleanCategory(detail.meta.scheme_category, name);
  const house = deriveHouse(name, detail.meta.fund_house);
  return {
    code,
    name,
    house,
    houseSlug: slugify(house),
    category,
    categorySlug: slugify(category),
    type: assetType(detail.meta.scheme_category, detail.meta.scheme_type, name),
    nav: r.latestNav,
    navDate: r.latestDate,
    today: r.today,
    m1: isPlausibleShortReturn("m1", r.m1) ? r.m1 : null,
    m6: isPlausibleShortReturn("m6", r.m6) ? r.m6 : null,
    y1: isPlausibleCagr("y1", r.cagr.y1) ? r.cagr.y1 : null,
    y3: isPlausibleCagr("y3", r.cagr.y3) ? r.cagr.y3 : null,
    y5: isPlausibleCagr("y5", r.cagr.y5) ? r.cagr.y5 : null,
    y10: isPlausibleCagr("y10", r.cagr.y10) ? r.cagr.y10 : null,
    spark: r.spark,
  };
}

function rawPath(code: number) {
  return path.join(RAW_DIR, `${code}.json`);
}

/** Return the scheme's raw detail from cache, else fetch it and cache it. null on failure. */
async function loadOrFetch(item: SchemeListItem): Promise<SchemeDetail | null> {
  const file = rawPath(item.schemeCode);
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) as SchemeDetail;
    } catch {
      /* corrupt cache entry — refetch below */
    }
  }
  try {
    const detail = await fetchJson<SchemeDetail>(`${BASE}/mf/${item.schemeCode}`);
    fs.writeFileSync(file, JSON.stringify(detail));
    return detail;
  } catch {
    return null;
  }
}

async function main() {
  ensureDirs();
  console.log(`[build-dataset] source=${BASE} concurrency=${CONCURRENCY}`);

  const universe = await fetchJson<SchemeListItem[]>(`${BASE}/mf`);
  const schemes = universe.slice(0, LIMIT === Infinity ? universe.length : LIMIT);
  const cachedCount = schemes.filter((s) => fs.existsSync(rawPath(s.schemeCode))).length;
  console.log(
    `[build-dataset] universe=${universe.length} processing=${schemes.length} cached=${cachedCount} toFetch=${schemes.length - cachedCount}`,
  );

  const done = new Map<number, FundSummary>();
  let processed = 0;
  let failed = 0;
  let stale = 0;

  async function worker(item: SchemeListItem) {
    const detail = await loadOrFetch(item);
    // Summaries are always (re)computed here, so returns.ts fixes apply on every run.
    const summary = detail ? toSummary(item.schemeCode, detail, item.schemeName) : null;
    if (summary && hasRecentNav(summary.navDate)) done.set(item.schemeCode, summary);
    else if (summary) stale++;
    else failed++;
    processed++;
    if (processed % 500 === 0) {
      console.log(`[build-dataset] ${processed}/${schemes.length} (computed=${done.size} stale=${stale} failed=${failed})`);
    }
  }

  await pool(schemes, worker, CONCURRENCY);

  const funds = [...done.values()].sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9));
  const dataset: Dataset = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalSchemes: universe.length,
      computedSchemes: funds.length,
      source: "MFapi.in",
    },
    funds,
  };
  fs.writeFileSync(OUT, JSON.stringify(dataset));
  console.log(`[build-dataset] wrote ${funds.length} current funds -> ${OUT} (stale=${stale} failed=${failed})`);
}

async function pool<T>(items: T[], worker: (item: T) => Promise<void>, limit: number) {
  const executing = new Set<Promise<void>>();
  for (const item of items) {
    const p = worker(item).then(() => {
      executing.delete(p);
    });
    executing.add(p);
    if (executing.size >= limit) await Promise.race(executing);
  }
  await Promise.all(executing);
}

main().catch((err) => {
  console.error("[build-dataset] fatal:", err);
  process.exit(1);
});
