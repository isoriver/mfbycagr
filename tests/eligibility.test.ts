import { test } from "node:test";
import assert from "node:assert/strict";
import { isRankableName, isPlausibleCagr } from "../src/lib/eligibility.ts";

test("isRankableName keeps Direct Growth, drops Regular and distribution plans", () => {
  assert.equal(isRankableName("ICICI Prudential Overnight Fund - Direct Plan - Growth"), true);
  assert.equal(isRankableName("SBI Bluechip Fund - Growth"), true);
  assert.equal(isRankableName("ICICI Prudential Overnight Fund - Regular Plan - Growth"), false);
  assert.equal(isRankableName("ICICI Prudential Overnight Fund - Direct Plan - Weekly IDCW"), false);
  assert.equal(isRankableName("HDFC Top 100 - Dividend"), false);
  assert.equal(isRankableName("Axis Fund - Direct - Payout"), false);
  assert.equal(isRankableName("Nippon Fund - IDCW Reinvestment"), false);
  assert.equal(isRankableName(""), false);
});

test("isPlausibleCagr keeps genuine high 3Y CAGR but rejects artefacts", () => {
  // Regression: a gold-mining FoF compounded at 63.6% over 3 years (NAV 16.37 -> 71.64).
  // A flat 60% multi-year ceiling discarded this real figure, leaving 3Y blank on a fund
  // whose 1Y, 5Y and 10Y all populated.
  assert.equal(isPlausibleCagr("y3", 63.58), true);
  assert.equal(isPlausibleCagr("y3", 62.5), true);

  // Bands tighten with the horizon: the same rate is implausible sustained over a decade.
  assert.equal(isPlausibleCagr("y10", 63.58), false);
  assert.equal(isPlausibleCagr("y5", 33), true);
  assert.equal(isPlausibleCagr("y10", 24), true);

  // Real artefacts are still rejected. A ~10x NAV re-denomination implies these:
  assert.equal(isPlausibleCagr("y1", 10592), false); // ultra-short fund artefact
  assert.equal(isPlausibleCagr("y3", 115), false); // 10x over 3 years
  assert.equal(isPlausibleCagr("y5", 173), false); // liquid fund artefact
  assert.equal(isPlausibleCagr("y1", 140.3), true); // highest genuine 1Y observed

  // Absence is acceptable; non-finite is not.
  assert.equal(isPlausibleCagr("y3", null), true);
  assert.equal(isPlausibleCagr("y3", Number.NaN), false);
  assert.equal(isPlausibleCagr("y3", Number.POSITIVE_INFINITY), false);
});
