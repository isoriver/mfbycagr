/**
 * Slug + label helpers for categories and fund houses.
 * Deterministic and reversible enough for stable, human-readable SEO URLs.
 */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** True when the fund is a commodity play (gold / silver / other precious metals). */
function isCommodity(hay: string): boolean {
  return /\b(gold|silver|platinum)\b/.test(hay) || /commodit|precious\s*metal|bullion/.test(hay);
}

/** Detect an index/ETF wrapper (as opposed to an actively-managed scheme). */
function isIndexOrEtf(hay: string): boolean {
  return /\bindex\b|\betfs?\b|exchange traded/.test(hay);
}

/**
 * True when an index/ETF tracks a debt underlying (bonds, gilts, SDLs, target-maturity,
 * liquid/overnight rate, CRISIL IBX bond indices). Deliberately narrow so equity sector
 * indices like "Nifty PSU Bank" or "Nifty Bank" are NOT mistaken for debt.
 */
function isDebtUnderlying(hay: string): boolean {
  return (
    /\b(bond|gilt|g-?sec|sdl|ibx|debt|liquid|overnight|t-?bill|treasury)\b/.test(hay) ||
    /1d rate|target maturity|constant maturity|psu bond|cpse bond|benchmark g-?sec/.test(hay)
  );
}

/**
 * Clean MFapi's verbose scheme_category into a concise, consistent label.
 * e.g. "Equity Scheme - Large Cap Fund" -> "Large Cap Fund".
 *
 * Also normalises the many inconsistent MFapi spellings into a single canonical
 * label per concept (e.g. "FoF Domestic", "Fund of Funds Scheme (Domestic)" both
 * become "FoF (Domestic)") and folds commodity schemes into Gold / Silver /
 * Commodities so they group under one page instead of a dozen near-duplicates.
 */
export function cleanCategory(raw?: string, schemeName?: string): string {
  const hay = `${raw || ""} ${schemeName || ""}`.toLowerCase();

  // Commodity schemes: collapse every gold/silver ETF & FoF spelling into one label.
  if (isCommodity(hay)) {
    const gold = /\bgold\b/.test(hay);
    const silver = /\bsilver\b/.test(hay);
    if (gold && silver) return "Commodities"; // multi-metal "Gold & Silver" funds
    if (gold) return "Gold";
    if (silver) return "Silver";
    return "Commodities";
  }

  if (!raw) return "Uncategorised";
  let cleaned = raw
    .replace(/open ended schemes/gi, "")
    .replace(/close ended schemes/gi, "")
    .replace(/interval fund schemes/gi, "")
    .replace(/^\s*[-–]\s*/, "")
    .replace(/\s*[-–]\s*/g, " - ")
    .replace(/\s+/g, " ") // collapse the stray double spaces MFapi ships ("Other  ETFs")
    .trim();
  // If category is "Equity Scheme - Large Cap Fund", keep the meaningful tail.
  const parts = cleaned.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) cleaned = parts[parts.length - 1];
  cleaned = cleaned || "Uncategorised";

  const low = cleaned.toLowerCase();

  // Fund-of-funds: unify the domestic / overseas spellings.
  if (low.includes("fund of funds") || /\bfof\b/.test(low)) {
    return /overseas|international|global/.test(low) ? "FoF (Overseas)" : "FoF (Domestic)";
  }
  if (/etfs?\s+investing\s+overseas/.test(low)) return "FoF (Overseas)";

  // Index funds & ETFs: label by wrapper + underlying so an equity index fund and a
  // debt (G-Sec/SDL) index fund never share the same category page. Hybrid/solution
  // trackers are left alone (handled by their own labels above/below).
  const isHybridOrSolution = /hybrid|balanced|arbitrage|asset allocation|equity savings|solution|retirement|children|pension/.test(hay);
  if (!isHybridOrSolution && isIndexOrEtf(hay)) {
    const debt = isDebtUnderlying(hay);
    const etf = /\betfs?\b|exchange traded/.test(hay);
    const indexNamed = /\bindex\b/.test(hay);
    if (etf && !indexNamed) return debt ? "Debt ETF" : "Equity ETF";
    return debt ? "Debt Index Funds" : "Index Funds";
  }

  // "year Constant Maturity Gilt Fund" — MFapi split artefact drops the leading number.
  if (/constant maturity/.test(low)) return "Constant Maturity Gilt Fund";

  return cleaned;
}

/**
 * Derive a broad asset type (AMFI's five top-level groups) from MFapi's
 * scheme_category / scheme_type and the scheme name.
 *
 * Precedence matters: commodities are checked first so gold/silver ETFs labelled
 * "Equity ETF" don't leak into Equity; solution-oriented and hybrid are resolved
 * before Equity/Debt so arbitrage, asset-allocation and equity-savings funds land
 * in Hybrid rather than Equity.
 */
export function assetType(rawCategory?: string, rawType?: string, schemeName?: string): string {
  const meta = `${rawCategory || ""} ${rawType || ""}`.toLowerCase();
  const hay = `${meta} ${(schemeName || "").toLowerCase()}`;

  // 1) Commodities are never equity/debt (AMFI groups them under "Other").
  if (isCommodity(hay)) return "Other";

  // 2) Solution-oriented: retirement / children / pension schemes.
  if (/solution|retirement|children|pension/.test(meta)) return "Solution Oriented";

  // 3) Hybrid: balanced, arbitrage, asset-allocation and equity-savings.
  if (/hybrid|balanced|arbitrage|asset allocation|equity savings/.test(meta)) return "Hybrid";

  // 4) Index funds & ETFs: classify by the underlying asset, not the wrapper. Equity
  //    index/ETFs (Nifty, Sensex, sectoral, international) belong under Equity; only
  //    bond/gilt/SDL/target-maturity trackers are Debt. Fund-of-funds are excluded here
  //    (an "ETF FoF" is still a FoF) and stay under Other with a FoF label.
  const isFof = /\bfof\b|fund of funds|investing\s+overseas/.test(hay);
  if (!isFof && isIndexOrEtf(hay)) return isDebtUnderlying(hay) ? "Debt" : "Equity";

  // 5) Equity: explicit equity plus ELSS / tax-saver and the common sub-styles.
  if (
    /equity|elss|tax saver|large cap|mid cap|small cap|flexi cap|multi cap|focused|value fund|contra|dividend yield|sectoral|thematic/.test(
      meta,
    )
  )
    return "Equity";

  // 6) Debt: bonds, gilts, income, liquid/overnight, duration & money-market funds.
  if (
    /debt|gilt|bond|income|liquid|overnight|money market|duration|credit risk|float|banking and psu|fixed term|constant maturity|g-?sec/.test(
      meta,
    )
  )
    return "Debt";

  // 7) FoFs and anything unresolved → Other.
  return "Other";
}

/**
 * Canonical display names for houses MFapi ships with inconsistent casing/wording.
 * Keyed by the lowercased derived name. (e.g. MFapi returns both "quant Mutual Fund"
 * and "Quant Mutual Fund" — normalise both to "Quant". Note this must NOT catch
 * "Quantum", which is a different AMC.)
 */
const CANONICAL_HOUSE: Record<string, string> = {
  quant: "Quant",
};

/**
 * Derive the fund house / AMC from a scheme name or MFapi fund_house field.
 * Prefer the explicit fund_house; fall back to the scheme name's leading token(s).
 */
export function deriveHouse(schemeName: string, fundHouse?: string): string {
  let name: string;
  if (fundHouse && fundHouse.trim()) {
    name = fundHouse.replace(/Mutual Fund$/i, "").replace(/Asset Management.*/i, "").trim();
  } else {
    // Fall back to first word of scheme name.
    name = (schemeName.split(/\s+/)[0] || "Unknown").trim();
  }
  return CANONICAL_HOUSE[name.toLowerCase()] ?? name;
}
