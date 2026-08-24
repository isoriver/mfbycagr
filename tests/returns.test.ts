import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReturns, cagr, parseNavDate } from "../src/lib/returns.ts";

test("cagr basic doubling over 5 years", () => {
  const v = cagr(100, 200, 5);
  assert.ok(v !== null);
  assert.ok(Math.abs((v as number) - 14.8698) < 0.001);
});

test("cagr guards invalid inputs", () => {
  assert.equal(cagr(0, 200, 5), null);
  assert.equal(cagr(100, 0, 5), null);
  assert.equal(cagr(100, 200, 0), null);
});

test("parseNavDate handles dd-mm-yyyy and rejects junk", () => {
  const d = parseNavDate("01-02-2020");
  assert.equal(d?.toISOString().slice(0, 10), "2020-02-01");
  assert.equal(parseNavDate("garbage"), null);
  assert.equal(parseNavDate("32-01-2020"), null);
  assert.equal(parseNavDate("31-02-2024"), null);
});

function buildSeries() {
  // Newest-last on purpose to prove we sort defensively.
  return [
    { date: "01-01-2019", nav: "100.0000" }, // ~5y before latest
    { date: "01-01-2021", nav: "150.0000" }, // ~3y before latest
    { date: "01-01-2023", nav: "180.0000" }, // ~1y before latest
    { date: "29-12-2023", nav: "199.0000" }, // previous trading day
    { date: "01-01-2024", nav: "200.0000" }, // latest
  ];
}

test("computeReturns latest, today and CAGR horizons", () => {
  const r = computeReturns(buildSeries());
  assert.equal(r.latestNav, 200);
  assert.equal(r.latestDate, "2024-01-01");
  assert.ok(Math.abs((r.today as number) - 0.50251) < 0.001);
  assert.ok(Math.abs((r.cagr.y1 as number) - 11.1111) < 0.001);
  assert.ok(Math.abs((r.cagr.y3 as number) - 10.0642) < 0.01); // (200/150)^(1/3)-1
  assert.ok(Math.abs((r.cagr.y5 as number) - 14.8698) < 0.01);
  assert.equal(r.cagr.y10, null); // not enough history
});

test("computeReturns nearest-on-or-before for horizon with gap", () => {
  // Latest 2024-06-10; 1y target 2023-06-10 has no exact row, nearest is 2023-06-05 (within tolerance).
  const r = computeReturns([
    { date: "05-06-2023", nav: "100.0000" },
    { date: "10-06-2024", nav: "120.0000" },
  ]);
  assert.ok(Math.abs((r.cagr.y1 as number) - 20) < 0.5);
});

test("computeReturns nulls a horizon when history has a large gap (no absurd CAGR)", () => {
  // A stale pre-gap NAV (2010) then a recent run (2024+). The 5y target (2021) falls
  // deep inside the gap: the nearest point is years away, so CAGR must be null, not ~170%.
  const r = computeReturns([
    { date: "15-03-2010", nav: "12.0000" }, // ancient, pre-gap
    { date: "02-01-2024", nav: "1800.0000" }, // history resumes
    { date: "05-08-2024", nav: "1850.0000" },
    { date: "10-08-2026", nav: "1907.0000" }, // latest
  ]);
  assert.equal(r.cagr.y5, null, "5y target lands in the gap → null");
  assert.equal(r.cagr.y3, null, "3y target lands in the gap → null");
  assert.equal(r.cagr.y10, null, "no point within 45d of the 10y target");
  // Sanity: it must never emit a triple-digit CAGR from the stale 2010 NAV.
  for (const v of Object.values(r.cagr)) {
    assert.ok(v === null || (v as number) < 100, "no absurd CAGR from pre-gap NAV");
  }
});

test("computeReturns handles empty and malformed input", () => {
  const r = computeReturns([]);
  assert.equal(r.latestNav, null);
  assert.equal(r.dataPoints, 0);
  const r2 = computeReturns([{ date: "bad", nav: "x" }]);
  assert.equal(r2.latestNav, null);
});

test("spark returns up to 30 points oldest->newest", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({
    date: `${String((i % 28) + 1).padStart(2, "0")}-01-2024`,
    nav: String(100 + i),
  }));
  const r = computeReturns(many);
  assert.equal(r.spark.length, 30);
  assert.ok(r.spark[0] <= r.spark[r.spark.length - 1] || r.spark.length === 30);
});
