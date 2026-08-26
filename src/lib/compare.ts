import { getAllFunds } from "./dataset";
import type { FundSummary } from "./types";

/**
 * The curated set of head-to-head comparisons we prerender: the top 3 funds by 5-year
 * CAGR within each category, paired against each other. Shared by the compare route's
 * generateStaticParams, the compare index page and the sitemap so all three agree —
 * previously the route prerendered ~200 pairs that nothing linked to and the sitemap
 * omitted entirely, leaving them orphaned.
 */
export interface ComparePair {
  slug: string;
  funds: [FundSummary, FundSummary];
}

export function getComparePairs(): ComparePair[] {
  const byCat = new Map<string, FundSummary[]>();
  for (const f of getAllFunds()) {
    const arr = byCat.get(f.categorySlug);
    if (arr) arr.push(f);
    else byCat.set(f.categorySlug, [f]);
  }

  const pairs: ComparePair[] = [];
  for (const arr of byCat.values()) {
    const top = [...arr].sort((a, b) => (b.y5 ?? -1e9) - (a.y5 ?? -1e9)).slice(0, 3);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        pairs.push({
          slug: `${top[i].code}-vs-${top[j].code}`,
          funds: [top[i], top[j]],
        });
      }
    }
  }
  return pairs;
}
