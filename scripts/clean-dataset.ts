/**
 * Clean the already-built src/data/funds-summary.json in place — NO network, NO cache.
 *
 * Applies the same rules a fresh `npm run build:data` now enforces, but to the committed
 * dataset so the site ships correct data immediately:
 *   1. Drop Regular-plan and IDCW/Dividend/Payout schemes (isRankableName).
 *   2. Null out any horizon whose CAGR is a NAV-break artefact (isPlausibleCagr) — e.g.
 *      the liquid funds reporting "+173% 5Y" or "+10,592% 1Y".
 *   3. Drop funds left with no usable CAGR at all.
 * Then re-sort by 5Y CAGR (desc, nulls last) and rewrite the file.
 *
 *   node --experimental-strip-types scripts/clean-dataset.ts
 */
import fs from "node:fs";
import path from "node:path";
import { isRankableName, isPlausibleCagr } from "../src/lib/eligibility.ts";
import type { Dataset, Period } from "../src/lib/types.ts";

const FILE = path.join(process.cwd(), "src", "data", "funds-summary.json");
const PERIODS: Period[] = ["y1", "y3", "y5", "y10"];

function main() {
  const dataset = JSON.parse(fs.readFileSync(FILE, "utf8")) as Dataset;
  const before = dataset.funds.length;

  let droppedName = 0;
  let nulled = 0;
  let droppedEmpty = 0;

  const cleaned = dataset.funds
    .filter((f) => {
      if (isRankableName(f.name)) return true;
      droppedName++;
      return false;
    })
    .map((f) => {
      for (const p of PERIODS) {
        if (!isPlausibleCagr(p, f[p])) {
          f[p] = null;
          nulled++;
        }
      }
      return f;
    })
    .filter((f) => {
      if (PERIODS.some((p) => f[p] != null)) return true;
      droppedEmpty++;
      return false;
    });

  cleaned.sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9));

  dataset.funds = cleaned;
  dataset.meta.computedSchemes = cleaned.length;
  fs.writeFileSync(FILE, JSON.stringify(dataset));

  console.log(
    `[clean] ${before} -> ${cleaned.length} funds (dropped ${droppedName} regular/IDCW, ` +
      `nulled ${nulled} artefact horizons, dropped ${droppedEmpty} with no usable CAGR)`,
  );
}

main();
