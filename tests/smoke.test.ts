import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, cleanCategory, assetType, deriveHouse } from "../src/lib/slug.ts";
import {
  getAllFunds,
  getCategories,
  getHouses,
  rankByPeriod,
  paginate,
  getFundByCode,
} from "../src/lib/dataset.ts";
import { hasRecentNav } from "../src/lib/freshness.ts";

test("slugify normalises", () => {
  assert.equal(slugify("Large Cap Fund"), "large-cap-fund");
  assert.equal(slugify("ICICI Prudential  Bluechip!"), "icici-prudential-bluechip");
});

test("cleanCategory trims MFapi verbosity", () => {
  assert.equal(cleanCategory("Equity Scheme - Large Cap Fund"), "Large Cap Fund");
  assert.equal(cleanCategory("Open Ended Schemes - Debt Scheme - Gilt Fund"), "Gilt Fund");
  assert.equal(cleanCategory(undefined), "Uncategorised");
});

test("assetType classification", () => {
  assert.equal(assetType("Equity Scheme - Large Cap Fund"), "Equity");
  assert.equal(assetType("Debt Scheme - Gilt Fund"), "Debt");
  assert.equal(assetType("Hybrid Scheme - Aggressive Hybrid Fund"), "Hybrid");
});

test("deriveHouse prefers fund_house", () => {
  assert.equal(deriveHouse("SBI Bluechip Fund", "SBI Mutual Fund"), "SBI");
  assert.equal(deriveHouse("Axis Bluechip Fund"), "Axis");
});

test("hasRecentNav excludes discontinued and invalid NAV dates", () => {
  const now = new Date("2026-08-24T12:00:00Z");
  assert.equal(hasRecentNav("2026-08-10", now), true);
  assert.equal(hasRecentNav("2026-08-09", now), false);
  assert.equal(hasRecentNav("2016-11-25", now), false);
  assert.equal(hasRecentNav("2026-02-31", now), false);
  assert.equal(hasRecentNav("not-a-date", now), false);
});

test("dataset loads sample and indexes build", () => {
  const funds = getAllFunds();
  assert.ok(funds.length >= 10);
  assert.ok(getCategories().length > 0);
  assert.ok(getHouses().length > 0);
  assert.ok(getFundByCode(funds[0].code));
});

test("rankByPeriod sorts desc with nulls last", () => {
  const ranked = rankByPeriod(getAllFunds(), "y5");
  for (let i = 1; i < ranked.length; i++) {
    const a = ranked[i - 1].y5;
    const b = ranked[i].y5;
    if (a != null && b != null) assert.ok(a >= b);
  }
});

test("paginate clamps and slices", () => {
  const p = paginate([1, 2, 3, 4, 5], 2, 2);
  assert.deepEqual(p.items, [3, 4]);
  assert.equal(p.totalPages, 3);
  assert.equal(paginate([1, 2, 3], 99, 2).page, 2);
});
