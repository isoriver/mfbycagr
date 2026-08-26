import { getAllFunds } from "./dataset";
import { isRankableName } from "./eligibility";
import type { FundSummary } from "./types";

/**
 * The curated set of head-to-head comparisons we prerender, shared by the compare route's
 * generateStaticParams, the compare index page and the sitemap so all three agree.
 *
 * A comparison is only useful if it pits two genuinely *different* funds against each
 * other. Ranking a category by 5Y CAGR and taking the top 3 did not do that, because the
 * Growth, IDCW and Bonus variants of one scheme have near-identical returns and therefore
 * clustered at the top — 17% of pairs compared a scheme with itself ("SBI PSU Fund Growth
 * vs SBI PSU Fund IDCW") and 40% pitted two funds from the same AMC. We now:
 *
 *  1. consider only Growth-style plans (no IDCW/dividend/bonus payout variants),
 *  2. keep one entry per underlying scheme, and
 *  3. require each fund in a pair to come from a different fund house,
 *
 * which is what a reader actually wants to compare: rival AMCs' offerings in one category.
 */
export interface ComparePair {
  slug: string;
  funds: [FundSummary, FundSummary];
}

/** How many distinct funds per category to cross-compare (n*(n-1)/2 pairs each). */
const PER_CATEGORY = 4;

/**
 * Collapse a scheme name to its underlying identity by dropping plan/option wording, so
 * the Direct-Growth and Direct-IDCW rows of one scheme resolve to the same key.
 */
function schemeIdentity(f: FundSummary): string {
  const base = f.name
    .toLowerCase()
    .replace(/\b(direct|regular)\b/g, "")
    .replace(/\b(growth|idcw|dividend|payout|reinvest(?:ment)?|bonus)\b/g, "")
    .replace(/\b(plan|option|opt)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return `${f.houseSlug}|${base}`;
}

export function getComparePairs(): ComparePair[] {
  // 1) Growth-style plans only — a payout variant is the same portfolio with a lower NAV.
  const candidates = getAllFunds().filter((f) => isRankableName(f.name));

  const byCat = new Map<string, FundSummary[]>();
  for (const f of candidates) {
    const arr = byCat.get(f.categorySlug);
    if (arr) arr.push(f);
    else byCat.set(f.categorySlug, [f]);
  }

  const pairs: ComparePair[] = [];
  for (const arr of byCat.values()) {
    // 2) One row per underlying scheme, keeping its best 5Y figure.
    const bestPerScheme = new Map<string, FundSummary>();
    for (const f of arr) {
      const key = schemeIdentity(f);
      const held = bestPerScheme.get(key);
      if (!held || (f.y5 ?? -1e9) > (held.y5 ?? -1e9)) bestPerScheme.set(key, f);
    }

    // 3) Walk the category's leaders and take the best fund from each distinct AMC, so
    //    every pair generated below is inherently cross-house.
    const ranked = [...bestPerScheme.values()].sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9));
    const picks: FundSummary[] = [];
    const seenHouses = new Set<string>();
    for (const f of ranked) {
      if (picks.length >= PER_CATEGORY) break;
      if (seenHouses.has(f.houseSlug)) continue;
      seenHouses.add(f.houseSlug);
      picks.push(f);
    }

    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        pairs.push({ slug: `${picks[i].code}-vs-${picks[j].code}`, funds: [picks[i], picks[j]] });
      }
    }
  }
  return pairs;
}
