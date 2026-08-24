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

/**
 * Clean MFapi's verbose scheme_category into a concise label.
 * e.g. "Equity Scheme - Large Cap Fund" -> "Large Cap Fund".
 */
export function cleanCategory(raw?: string): string {
  if (!raw) return "Uncategorised";
  const cleaned = raw
    .replace(/open ended schemes/gi, "")
    .replace(/close ended schemes/gi, "")
    .replace(/interval fund schemes/gi, "")
    .replace(/^\s*[-–]\s*/, "")
    .replace(/\s*[-–]\s*/g, " - ")
    .trim();
  // If category is "Equity Scheme - Large Cap Fund", keep the meaningful tail.
  const parts = cleaned.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return cleaned || "Uncategorised";
}

/** Derive a broad asset type from MFapi's scheme_category / scheme_type. */
export function assetType(rawCategory?: string, rawType?: string): string {
  const hay = `${rawCategory || ""} ${rawType || ""}`.toLowerCase();
  if (hay.includes("equity")) return "Equity";
  if (hay.includes("debt") || hay.includes("gilt") || hay.includes("bond")) return "Debt";
  if (hay.includes("hybrid") || hay.includes("balanced")) return "Hybrid";
  if (hay.includes("solution")) return "Solution Oriented";
  if (hay.includes("other") || hay.includes("index") || hay.includes("etf") || hay.includes("fof"))
    return "Other";
  return "Other";
}

/**
 * Derive the fund house / AMC from a scheme name or MFapi fund_house field.
 * Prefer the explicit fund_house; fall back to the scheme name's leading token(s).
 */
export function deriveHouse(schemeName: string, fundHouse?: string): string {
  if (fundHouse && fundHouse.trim()) {
    return fundHouse.replace(/Mutual Fund$/i, "").replace(/Asset Management.*/i, "").trim();
  }
  // Fall back to first word of scheme name.
  return (schemeName.split(/\s+/)[0] || "Unknown").trim();
}
