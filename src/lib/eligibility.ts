/**
 * Fund eligibility rules for the CAGR rankings.
 *
 * We rank on Direct-plan Growth options only:
 *  - Regular plans carry higher expense ratios and are the distributor variant; the
 *    Direct plan of the same scheme is the like-for-like performer, so ranking both
 *    just duplicates every scheme. (User: "disable all regular plan funds".)
 *  - IDCW / Dividend / Payout / Reinvestment / Bonus plans reset their NAV on every
 *    distribution, which makes multi-year CAGR meaningless (an overnight fund showing
 *    "+58% 5Y" is the classic artefact). We exclude them.
 *
 * Shared by scripts/build-dataset.ts, scripts/reprocess-dataset.ts and the read layer
 * so the daily refresh and the served dataset always agree.
 */

const REGULAR_RE = /\bregular\b/i;
const DISTRIBUTION_RE = /\b(idcw|dividend|payout|reinvest(?:ment)?|bonus)\b/i;

/** True when a scheme name is a Direct-ish Growth option we want to rank. */
export function isRankableName(name: string): boolean {
  if (!name) return false;
  if (REGULAR_RE.test(name)) return false;
  if (DISTRIBUTION_RE.test(name)) return false;
  return true;
}

/**
 * Plausibility bands for annualised CAGR — a backstop against NAV-feed artefacts such as
 * a re-denomination / units break (a NAV multiplying ~10x overnight), which historically
 * produced figures like a liquid fund at "+173% 5Y" or an ultra-short fund at "+10,592% 1Y".
 *
 * Bands are **per horizon** and tighten as the horizon lengthens, because sustained
 * compounding at an extreme rate is far less plausible over ten years than over three:
 * a single sector run can dominate a 3-year window, but nothing holds 50%+ for a decade.
 * A flat multi-year ceiling was wrong in both directions — too loose at 10Y and too tight
 * at 3Y, where it discarded genuine figures (a gold-mining FoF legitimately compounded at
 * 63.6% over three years).
 *
 * Observed maxima across the live universe are well inside these bands (y1 140%, y3 64%,
 * y5 33%, y10 24%), so they leave real performance untouched while still bounding the
 * artefacts that matter most — a 10x break over 3 years implies ~115% CAGR and is caught.
 * returns.ts split-adjusts such breaks at the source, so this is a second line of defence.
 */
const CAGR_BOUNDS: Record<"y1" | "y3" | "y5" | "y10", { max: number; min: number }> = {
  y1: { max: 150, min: -95 },
  y3: { max: 100, min: -70 },
  y5: { max: 70, min: -60 },
  y10: { max: 50, min: -50 },
};

/** True when a single period's CAGR is within the realistic band for its horizon. */
export function isPlausibleCagr(period: "y1" | "y3" | "y5" | "y10", value: number | null): boolean {
  if (value == null) return true; // absence is fine; only present-but-absurd is rejected
  if (!Number.isFinite(value)) return false;
  const { max, min } = CAGR_BOUNDS[period];
  return value <= max && value >= min;
}

/**
 * Plausibility bounds for sub-year absolute (point-to-point) returns. These are simple
 * returns, not annualised, so the realistic band is much tighter than for CAGR — a
 * genuine equity fund rarely swings more than ~70% in a month or ~150% in six months.
 * Anything past these is a residual NAV-feed artefact, treated as unavailable (null).
 */
const M1_MAX = 70;
const M1_MIN = -70;
const M6_MAX = 150;
const M6_MIN = -90;

/** True when a sub-year absolute return is within the realistic band for its window. */
export function isPlausibleShortReturn(period: "m1" | "m6", value: number | null): boolean {
  if (value == null) return true;
  if (!Number.isFinite(value)) return false;
  if (period === "m1") return value <= M1_MAX && value >= M1_MIN;
  return value <= M6_MAX && value >= M6_MIN;
}
