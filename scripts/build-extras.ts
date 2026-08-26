/**
 * Builds src/data/fund-extras.json — supplementary per-fund facts (expense ratio + AUM)
 * that MFapi.in does not provide, keyed by AMFI scheme code.
 *
 * Sources (both free, MIT-licensed, daily-updated community mirrors of AMFI data):
 *   • Expense ratio — captn3m0/india-mutual-fund-ter-tracker (mirror of AMFI's TER-of-MF
 *     disclosure). Keyed by scheme *name*; we take the Direct-plan Total TER.
 *   • AUM — InertExpert2911/Mutual_Fund_Data (mirror of AMFI scheme data). Keyed by scheme
 *     *code*, which matches our fund codes exactly, and carries the quarter's Average AUM.
 *
 * Matching:
 *   - AUM: exact scheme-code match, then rolled up to a scheme-level total by summing the
 *     per-option AAUM within each (AMC, scheme name) group.
 *   - Expense ratio: matched on the canonical AMFI scheme name (taken from the AUM row
 *     where available, else our own fund name), normalised to ignore plan/option wording.
 *
 * This script is intentionally decoupled from build-dataset.ts: it never rewrites
 * funds-summary.json, so it cannot regress the live fund set. It also *merges* with the
 * existing fund-extras.json to accumulate a quarterly AUM history over time.
 *
 * Run: npx tsx scripts/build-extras.ts
 */
import fs from "node:fs";
import path from "node:path";
import type { Dataset, FundExtras, FundExtrasFile } from "../src/lib/types.ts";

const TER_URL =
  process.env.TER_CSV_URL ??
  "https://raw.githubusercontent.com/captn3m0/india-mutual-fund-ter-tracker/main/data.csv";
const AUM_URL =
  process.env.AUM_CSV_URL ??
  "https://raw.githubusercontent.com/InertExpert2911/Mutual_Fund_Data/main/mutual_fund_data.csv";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const OUT = path.join(DATA_DIR, "fund-extras.json");
const MAX_HISTORY = 16; // ~4 years of quarterly points

/** Minimal RFC-4180 CSV parser: handles quoted fields, embedded commas and "" escapes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Collapse a scheme name to a match key, ignoring plan/option/"formerly known as" noise. */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(?\s*formerly\s+known\s+as.*$/i, "")
    .replace(/\b(direct|regular)\b/g, " ")
    .replace(/\bplan\b/g, " ")
    .replace(/\b(growth|idcw|dividend|payout|reinvest(?:ment)?|bonus|income)\b/g, " ")
    .replace(/\boption\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

function toNumber(s: string | undefined): number | null {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

async function main() {
  console.log("[build-extras] fetching sources…");
  const [terText, aumText] = await Promise.all([fetchText(TER_URL), fetchText(AUM_URL)]);

  // ── Expense ratio: scheme name → Direct-plan Total TER ──────────────────────
  const terRows = parseCsv(terText);
  const terHeader = terRows[0];
  const dirTerIdx = terHeader.findIndex((h) => /direct plan - total ter/i.test(h));
  const terNameIdx = terHeader.findIndex((h) => /scheme name/i.test(h));
  const terByName = new Map<string, number>();
  if (dirTerIdx >= 0 && terNameIdx >= 0) {
    for (let i = 1; i < terRows.length; i++) {
      const r = terRows[i];
      if (!r[terNameIdx]) continue;
      const ter = toNumber(r[dirTerIdx]);
      const key = normName(r[terNameIdx]);
      if (ter != null && key && !terByName.has(key)) terByName.set(key, ter);
    }
  }
  console.log(`[build-extras] TER rows=${terRows.length - 1}, indexed=${terByName.size}`);

  // ── AUM: scheme code → this option's AAUM; plus scheme-level totals ──────────
  const aumRows = parseCsv(aumText);
  const h = aumRows[0].map((x) => x.trim());
  const idx = (re: RegExp) => h.findIndex((c) => re.test(c));
  const cCode = idx(/^scheme_code$/i);
  const cName = idx(/^scheme_name$/i);
  const cAmc = idx(/^amc$/i);
  const cAum = idx(/average_aum/i);
  const cQuarter = idx(/aaum_quarter/i);

  const aumByCode = new Map<number, { schemeName: string; amc: string; aum: number | null }>();
  const schemeTotal = new Map<string, number>(); // (amc||name) → summed AAUM
  let aumQuarter: string | null = null;
  for (let i = 1; i < aumRows.length; i++) {
    const r = aumRows[i];
    const code = toNumber(r[cCode]);
    if (code == null) continue;
    const schemeName = (r[cName] ?? "").trim();
    const amc = (r[cAmc] ?? "").trim();
    const aum = toNumber(r[cAum]);
    if (!aumQuarter && r[cQuarter]) aumQuarter = r[cQuarter].trim();
    aumByCode.set(code, { schemeName, amc, aum });
    if (aum != null && schemeName) {
      const k = `${amc}||${schemeName}`;
      schemeTotal.set(k, (schemeTotal.get(k) ?? 0) + aum);
    }
  }
  console.log(`[build-extras] AUM rows=${aumRows.length - 1}, quarter=${aumQuarter}`);

  // ── Our funds ────────────────────────────────────────────────────────────────
  const dataset = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "funds-summary.json"), "utf8"),
  ) as Dataset;

  // Existing extras, to accumulate AUM history across runs.
  let prev: FundExtrasFile | null = null;
  if (fs.existsSync(OUT)) {
    try {
      prev = JSON.parse(fs.readFileSync(OUT, "utf8")) as FundExtrasFile;
    } catch {
      prev = null;
    }
  }

  const out: FundExtrasFile["funds"] = {};
  let withExpenseRatio = 0;
  let withAum = 0;

  for (const f of dataset.funds) {
    const aumRow = aumByCode.get(f.code);
    const canonicalName = aumRow?.schemeName || f.name;
    const expenseRatio = terByName.get(normName(canonicalName)) ?? null;

    let aum: number | null = null;
    if (aumRow) {
      aum = schemeTotal.get(`${aumRow.amc}||${aumRow.schemeName}`) ?? aumRow.aum ?? null;
    }
    const quarter = aumRow ? aumQuarter : null;

    if (expenseRatio == null && aum == null) continue;

    // Carry forward and extend the quarterly AUM history.
    const history = [...(prev?.funds[String(f.code)]?.aumHistory ?? [])];
    if (aum != null && quarter) {
      const last = history[history.length - 1];
      if (!last || last.quarter !== quarter) history.push({ quarter, aum });
      else last.aum = aum; // same quarter re-run: keep the latest figure
    }

    const extras: FundExtras = {
      expenseRatio,
      aum,
      aumQuarter: quarter,
      aumHistory: history.slice(-MAX_HISTORY),
    };
    out[String(f.code)] = extras;
    if (expenseRatio != null) withExpenseRatio++;
    if (aum != null) withAum++;
  }

  const file: FundExtrasFile = {
    meta: {
      generatedAt: new Date().toISOString(),
      terSource: TER_URL,
      aumSource: AUM_URL,
      aumQuarter,
      withExpenseRatio,
      withAum,
    },
    funds: out,
  };
  fs.writeFileSync(OUT, JSON.stringify(file));
  console.log(
    `[build-extras] wrote ${Object.keys(out).length} funds → ${OUT}\n` +
      `  with expense ratio: ${withExpenseRatio}\n  with AUM: ${withAum}`,
  );
}

main().catch((e) => {
  console.error("[build-extras] failed:", e);
  process.exit(1);
});
