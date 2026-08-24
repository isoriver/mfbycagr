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
  y1: number | null;
  y3: number | null;
  y5: number | null;
  y10: number | null;
  spark: number[];
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
