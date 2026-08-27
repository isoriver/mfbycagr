import fs from "node:fs";
import path from "node:path";
import type { FundExtras, FundExtrasFile } from "./types";

/**
 * Loads src/data/fund-extras.json — supplementary per-fund facts (expense ratio, AUM)
 * built by scripts/build-extras.ts. Read lazily and cached once per process, mirroring
 * the dataset loader. The file is optional: if it hasn't been generated yet, every lookup
 * simply returns null and the fund page hides those sections.
 */
const DATA_DIR = path.join(process.cwd(), "src", "data");

let cache: FundExtrasFile | null | undefined;

function load(): FundExtrasFile | null {
  if (cache !== undefined) return cache;
  const file = path.join(DATA_DIR, "fund-extras.json");
  try {
    cache = JSON.parse(fs.readFileSync(file, "utf8")) as FundExtrasFile;
  } catch {
    cache = null; // not generated yet, or unreadable — treat as "no extras"
  }
  return cache;
}

export function getFundExtras(code: number | string): FundExtras | null {
  return load()?.funds[String(code)] ?? null;
}

/** The quarter the AUM figures apply to, for display (e.g. "April - June 2026"). */
export function getExtrasAumQuarter(): string | null {
  return load()?.meta.aumQuarter ?? null;
}
