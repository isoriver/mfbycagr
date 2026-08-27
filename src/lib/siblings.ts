import { getAllFunds } from "./dataset";
import { isRankableName, isDistributionPlan } from "./eligibility";
import type { FundSummary } from "./types";

/**
 * Finds the Growth-option sibling of a payout (IDCW) plan.
 *
 * A payout plan and its Growth counterpart are the same underlying portfolio; the Growth
 * plan's NAV series is the total-return series by construction (all distributions
 * reinvested). So for an IDCW plan — whose own NAV CAGR is misleadingly low because
 * payouts strip the NAV — the honest total return is simply its Growth sibling's return.
 */

/**
 * Collapse a scheme name to a key that ignores plan class-agnostic *option* wording
 * (Growth/IDCW/etc.), payout *frequency* (Monthly/Quarterly/…), and Direct/Regular, while
 * KEEPING investor-class words (Retail/Standard/Institutional) and the distinctive scheme
 * words — so an IDCW plan matches only its true Growth counterpart, not a different class
 * or a different scheme in the same house.
 */
function schemeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(?\s*formerly\s+known\s+as.*$/i, "")
    .replace(/\b(direct|regular)\b/g, " ")
    .replace(/\b(growth|idcw|dividend|payout|reinvest(?:ment)?|bonus)\b/g, " ")
    .replace(/\b(monthly|quarterly|weekly|daily|fortnightly|annual|annually|half\s*yearly|semi[-\s]*annual)\b/g, " ")
    .replace(/\b(plan|option|opt)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Lazily-built index of Growth-style funds, keyed by house + scheme key. Memoised once
// per process like the other dataset views.
let growthIndex: Map<string, FundSummary> | null = null;

function buildIndex(): Map<string, FundSummary> {
  const idx = new Map<string, FundSummary>();
  for (const f of getAllFunds()) {
    if (!isRankableName(f.name)) continue; // Growth-style, non-payout, non-regular
    const key = `${f.houseSlug}|${schemeKey(f.name)}`;
    const held = idx.get(key);
    // On the rare key collision, prefer the one with a longer return history.
    if (!held || (f.y5 ?? -1e9) > (held.y5 ?? -1e9)) idx.set(key, f);
  }
  return idx;
}

/** The Growth sibling of a payout plan, or null if the fund isn't a payout plan / no match. */
export function getGrowthSibling(fund: FundSummary): FundSummary | null {
  if (!isDistributionPlan(fund.name)) return null;
  if (!growthIndex) growthIndex = buildIndex();
  const match = growthIndex.get(`${fund.houseSlug}|${schemeKey(fund.name)}`);
  return match && match.code !== fund.code ? match : null;
}
