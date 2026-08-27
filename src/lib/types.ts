import type { ComputedReturns, Period } from "./returns";

export type { Period };

/** One scheme in the MFapi universe list (GET /mf). */
export interface SchemeListItem {
  schemeCode: number;
  schemeName: string;
}

/** MFapi scheme detail meta block (GET /mf/:code -> meta). */
export interface SchemeMeta {
  fund_house?: string;
  scheme_type?: string;
  scheme_category?: string;
  scheme_name?: string;
}

/** Full MFapi scheme detail response. */
export interface SchemeDetail {
  meta: SchemeMeta;
  data: { date: string; nav: string }[];
  status?: string;
}

/**
 * Precomputed per-fund summary row (written by scripts/build-dataset.ts and read by
 * every aggregate page). Kept compact — one row per scheme, ~15k rows total.
 */
export interface FundSummary {
  code: number;
  name: string;
  house: string; // fund house / AMC, e.g. "SBI"
  houseSlug: string;
  category: string; // cleaned category label, e.g. "Large Cap Fund"
  categorySlug: string;
  type: string; // "Equity" | "Debt" | "Hybrid" | ...
  nav: number | null;
  navDate: string | null;
  today: number | null;
  m1: number | null; // 1-month absolute return %
  m6: number | null; // 6-month absolute return %
  y1: number | null;
  y3: number | null;
  y5: number | null;
  y10: number | null;
  spark: number[];
}

/**
 * Supplementary per-fund facts that MFapi does not provide, sourced separately and keyed
 * by scheme code in src/data/fund-extras.json. Kept out of FundSummary so the daily NAV
 * refresh (which regenerates funds-summary.json) never has to carry or risk this data.
 */
export interface FundExtras {
  /** Direct-plan Total Expense Ratio, % (e.g. 0.43). */
  expenseRatio: number | null;
  /** Scheme-level average AUM in ₹ crore. */
  aum: number | null;
  /** The quarter the AUM figure applies to, e.g. "April - June 2026". */
  aumQuarter: string | null;
  /** Accumulated quarterly AUM points (built up over time; charted once ≥2 exist). */
  aumHistory: { quarter: string; aum: number }[];
}

export interface FundExtrasFile {
  meta: {
    generatedAt: string;
    terSource: string;
    aumSource: string;
    aumQuarter: string | null;
    withExpenseRatio: number;
    withAum: number;
  };
  funds: Record<string, FundExtras>;
}

/** Dataset metadata written alongside the summary. */
export interface DatasetMeta {
  generatedAt: string; // ISO timestamp
  totalSchemes: number;
  computedSchemes: number;
  source: string;
}

export interface Dataset {
  meta: DatasetMeta;
  funds: FundSummary[];
}

export type ComputedReturnsT = ComputedReturns;
