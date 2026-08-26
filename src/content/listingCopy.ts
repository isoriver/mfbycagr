import type { FundSummary } from "@/lib/types";

/**
 * Editorial + data-driven copy for the listing pages (category, AMC, rankings).
 *
 * These pages previously carried only an H1 and one templated sentence, which reads as
 * thin/duplicate content at 125-page scale. Each page now gets a genuine explanation of
 * what the grouping means and an FAQ answered from the live numbers, so the copy is both
 * unique per page and actually useful to a reader.
 */

export interface Faq {
  q: string;
  a: string;
}

const pct = (v: number | null | undefined): string =>
  v == null ? "not available" : `${v >= 0 ? "" : "\u2212"}${Math.abs(v).toFixed(1)}%`;

const n = (v: number): string => v.toLocaleString("en-IN");

/** Median is more honest than mean for skewed return distributions. */
function median(values: number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

export interface CategoryStats {
  count: number;
  medianY5: number | null;
  best: FundSummary | null;
  houses: number;
}

export function categoryStats(funds: FundSummary[]): CategoryStats {
  const withY5 = funds.filter((f) => f.y5 != null);
  const best = withY5.length
    ? withY5.reduce((a, b) => ((b.y5 as number) > (a.y5 as number) ? b : a))
    : null;
  return {
    count: funds.length,
    medianY5: median(withY5.map((f) => f.y5 as number)),
    best,
    houses: new Set(funds.map((f) => f.houseSlug)).size,
  };
}

/**
 * Plain-English description of what a SEBI category actually is. Keyed by the cleaned
 * category label; matched loosely so variants ("Sectoral/ Thematic", "Thematic Fund")
 * resolve to the same explanation.
 */
const CATEGORY_DEFINITIONS: { match: RegExp; text: string }[] = [
  {
    match: /large\s*&\s*mid cap/i,
    text: "Large & Mid Cap funds must hold at least 35% in large-cap and 35% in mid-cap stocks. They pair the relative stability of India's biggest companies with the higher growth potential — and higher volatility — of mid-sized ones.",
  },
  {
    match: /large cap/i,
    text: "Large Cap funds invest at least 80% of their assets in the top 100 companies by market capitalisation. They are typically the least volatile equity category and are often used as the core equity holding in a portfolio.",
  },
  {
    match: /mid cap/i,
    text: "Mid Cap funds hold at least 65% in companies ranked 101–250 by market capitalisation. Historically they have delivered higher long-run returns than large caps, with noticeably deeper drawdowns along the way.",
  },
  {
    match: /small cap/i,
    text: "Small Cap funds invest at least 65% in companies ranked 251 and below by market capitalisation. This is the most volatile equity category — returns can be exceptional over long holding periods but falls of 40% or more are not unusual.",
  },
  {
    match: /flexi cap/i,
    text: "Flexi Cap funds hold at least 65% in equity but the manager is free to move between large, mid and small caps as valuations change. The category suits investors who want that allocation decision delegated.",
  },
  {
    match: /multi cap/i,
    text: "Multi Cap funds must hold a minimum 25% each in large, mid and small caps. Unlike Flexi Cap, that split is mandated, so they carry structurally more mid- and small-cap exposure.",
  },
  {
    match: /elss|tax saver/i,
    text: "ELSS (Equity Linked Savings Scheme) funds qualify for a deduction of up to ₹1.5 lakh under Section 80C of the old tax regime and carry a three-year lock-in — the shortest of any 80C option. They invest at least 80% in equity.",
  },
  {
    match: /focused/i,
    text: "Focused funds hold a maximum of 30 stocks. The concentration means manager skill and conviction show up clearly in returns, in both directions.",
  },
  {
    match: /value fund|contra/i,
    text: "Value and Contra funds buy shares the manager judges to be trading below intrinsic worth, or that the market currently dislikes. These strategies can underperform growth investing for years before mean-reverting.",
  },
  {
    match: /dividend yield/i,
    text: "Dividend Yield funds focus on companies paying above-average dividends. They tend to tilt toward mature, cash-generative businesses and can hold up comparatively well in falling markets.",
  },
  {
    match: /sectoral|thematic/i,
    text: "Sectoral and Thematic funds concentrate on a single sector or investment theme, so they are undiversified by design. Returns depend heavily on entering and exiting the theme at the right point in its cycle.",
  },
  {
    match: /index fund/i,
    text: "Index funds track a benchmark rather than trying to beat it. Because there is no active stock selection, expense ratios are usually a fraction of an active fund's — a cost gap that compounds meaningfully over a decade.",
  },
  {
    match: /equity etf|^other etfs$/i,
    text: "Exchange Traded Funds trade on the exchange like a share and typically track an index. They generally carry the lowest costs available, but you need a demat account and you trade at market price rather than at end-of-day NAV.",
  },
  {
    match: /^gold$/i,
    text: "Gold funds and gold ETFs give exposure to bullion prices without storage or purity concerns. Gold is usually held as a diversifier — it often moves independently of equity — rather than as a primary growth asset.",
  },
  {
    match: /^silver$/i,
    text: "Silver funds track silver prices. Silver has meaningful industrial demand alongside its store-of-value role, which makes it more volatile than gold.",
  },
  {
    match: /commodit/i,
    text: "Commodity funds hold precious metals, most often a gold-and-silver combination. They are diversifiers whose prices are set by global demand and the rupee's exchange rate rather than by Indian corporate earnings.",
  },
  {
    match: /liquid fund/i,
    text: "Liquid funds invest in debt maturing within 91 days. They are used to park money for weeks or months — returns track short-term money-market rates and capital fluctuation is minimal, though not guaranteed.",
  },
  {
    match: /overnight/i,
    text: "Overnight funds hold securities maturing in a single day, which makes them the lowest-risk mutual fund category available. They are a cash-management tool, not a return-seeking investment.",
  },
  {
    match: /money market/i,
    text: "Money Market funds invest in instruments maturing within one year. They sit slightly further out on the risk and return curve than liquid funds.",
  },
  {
    match: /gilt|g-?sec|constant maturity/i,
    text: "Gilt funds lend only to the government, so credit risk is effectively nil. They do carry interest-rate risk: when yields rise, NAVs fall, and long-duration gilts move the most.",
  },
  {
    match: /corporate bond/i,
    text: "Corporate Bond funds hold at least 80% in the highest-rated (AA+ and above) corporate paper. They aim to beat government-bond returns while keeping credit risk contained.",
  },
  {
    match: /credit risk/i,
    text: "Credit Risk funds hold at least 65% in bonds rated below AA+, earning extra yield in exchange for accepting real default risk. Concentration in any single weak issuer is the thing to watch.",
  },
  {
    match: /short duration|low duration|ultra short/i,
    text: "Short, Low and Ultra Short Duration funds hold bonds maturing within roughly three years. Shorter maturities mean less sensitivity to interest-rate moves than long-duration debt.",
  },
  {
    match: /medium|long duration|dynamic bond|floater|banking and psu|income|debt index|debt etf|fixed term|term fund/i,
    text: "This debt category invests in bonds and money-market instruments. Two risks drive returns: interest-rate risk (NAVs fall when yields rise, more so for longer maturities) and credit risk (the chance an issuer fails to pay).",
  },
  {
    match: /arbitrage/i,
    text: "Arbitrage funds capture the price gap between the cash and futures market. The equity exposure is hedged, so risk resembles short-term debt while returns are taxed as equity — the reason the category is popular with higher tax brackets.",
  },
  {
    match: /aggressive hybrid/i,
    text: "Aggressive Hybrid funds hold 65–80% equity with the balance in debt. The debt sleeve cushions falls, which makes them a common first step for investors new to equity.",
  },
  {
    match: /conservative hybrid/i,
    text: "Conservative Hybrid funds invest 75–90% in debt with a small equity allocation for growth. They target modest, steadier returns rather than equity-like outcomes.",
  },
  {
    match: /balanced advantage|dynamic asset allocation/i,
    text: "Balanced Advantage funds move between equity and debt using a valuation model, raising equity when markets look cheap and cutting it when they look expensive. The aim is a smoother ride, not maximum return.",
  },
  {
    match: /multi asset/i,
    text: "Multi Asset Allocation funds must hold at least 10% in each of three asset classes, typically equity, debt and gold. That built-in spread reduces dependence on any single market.",
  },
  {
    match: /equity savings/i,
    text: "Equity Savings funds split across equity, arbitrage and debt. The hedged portion lowers volatility while the fund still qualifies for equity taxation.",
  },
  {
    match: /balanced hybrid|hybrid/i,
    text: "Hybrid funds hold a mix of equity and debt in one portfolio, so asset allocation is handled inside the fund rather than by the investor.",
  },
  {
    match: /retirement/i,
    text: "Retirement funds are solution-oriented schemes with a five-year (or till-retirement) lock-in. The lock-in enforces the long holding period that retirement investing needs.",
  },
  {
    match: /children/i,
    text: "Children's funds are solution-oriented schemes locked in for five years or until the child reaches majority, designed for goals like education costs.",
  },
  {
    match: /fof.*overseas|overseas/i,
    text: "Overseas Fund of Funds invest in units of foreign funds, giving rupee investors exposure to international markets. Returns depend on both the underlying market and the rupee's movement against that currency.",
  },
  {
    match: /fof/i,
    text: "A Fund of Funds invests in other mutual fund schemes rather than directly in securities. This adds a layer of convenience, and a second layer of expenses.",
  },
];

function definitionFor(category: string): string | null {
  return CATEGORY_DEFINITIONS.find((d) => d.match.test(category))?.text ?? null;
}

/** Body paragraphs for a category page. */
export function categoryIntro(category: string, stats: CategoryStats): string[] {
  const out: string[] = [];
  const def = definitionFor(category);
  if (def) out.push(def);

  const parts: string[] = [
    `We currently track ${n(stats.count)} direct-plan ${category} ${
      stats.count === 1 ? "scheme" : "schemes"
    } from ${stats.houses} fund ${stats.houses === 1 ? "house" : "houses"}`,
  ];
  if (stats.medianY5 != null) {
    parts.push(`with a median 5-year CAGR of ${pct(stats.medianY5)}`);
  }
  out.push(
    `${parts.join(" ")}. Every figure below is calculated from official daily NAV history and refreshed each day. Use the column headers to re-rank the table by any period — the best 1-year performer is often not the best over 5 or 10 years, which is exactly why we default to the longer horizon.`,
  );

  return out;
}

/** FAQs for a category page, answered from live data. */
export function categoryFaqs(category: string, stats: CategoryStats): Faq[] {
  const faqs: Faq[] = [];

  if (stats.best && stats.best.y5 != null) {
    faqs.push({
      q: `Which ${category} fund has the highest 5-year CAGR?`,
      a: `${stats.best.name} currently leads the ${category} category with a 5-year CAGR of ${pct(
        stats.best.y5,
      )}. Past returns describe what already happened and do not predict future performance — treat the ranking as a starting point for research, not a recommendation.`,
    });
  }

  if (stats.medianY5 != null) {
    faqs.push({
      q: `What is a good 5-year return for a ${category} fund?`,
      a: `Across the ${n(stats.count)} ${category} schemes we track, the median 5-year CAGR is ${pct(
        stats.medianY5,
      )}. Comparing a fund against that median, rather than against the category's single best performer, is a more realistic benchmark.`,
    });
  }

  faqs.push({
    q: `How is CAGR calculated on this page?`,
    a: `CAGR is the compound annual growth rate between the NAV on the horizon start date and the latest NAV, using growth-plan NAVs published by the AMCs. Where a scheme's NAV history has a gap or a re-denomination, we adjust for it rather than report a distorted figure. Expense ratios are already reflected in NAV; exit loads and taxes are not.`,
  });

  faqs.push({
    q: `Why does this list only show direct plans?`,
    a: `Direct plans have no distributor commission, so their expense ratio is lower and their NAV growth is higher than the regular plan of the same scheme. Showing both would list every fund twice, so we rank direct plans only.`,
  });

  return faqs;
}

/** Body paragraphs for an AMC (fund house) page. */
export function houseIntro(house: string, funds: FundSummary[]): string[] {
  const stats = categoryStats(funds);
  const byType = new Map<string, number>();
  for (const f of funds) byType.set(f.type, (byType.get(f.type) ?? 0) + 1);
  const mix = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `${n(c)} ${t.toLowerCase()}`)
    .join(", ");

  const out: string[] = [
    `${house} runs ${n(stats.count)} direct-plan ${
      stats.count === 1 ? "scheme" : "schemes"
    } that we currently track — ${mix}. The table below ranks them all by CAGR so you can see how the fund house performs across horizons rather than judging it on a single flagship scheme.`,
  ];

  if (stats.best && stats.best.y5 != null) {
    out.push(
      `Its strongest 5-year performer is ${stats.best.name} at ${pct(
        stats.best.y5,
      )} CAGR${stats.medianY5 != null ? `, against a house-wide median of ${pct(stats.medianY5)}` : ""}. A wide spread between a fund house's best and median scheme is worth noting: it usually means performance is driven by a few specific funds rather than by the AMC's process as a whole.`,
    );
  }

  return out;
}

/** FAQs for an AMC page. */
export function houseFaqs(house: string, funds: FundSummary[]): Faq[] {
  const stats = categoryStats(funds);
  const faqs: Faq[] = [];

  if (stats.best && stats.best.y5 != null) {
    faqs.push({
      q: `Which ${house} mutual fund has given the best 5-year return?`,
      a: `${stats.best.name} is ${house}'s best-performing scheme over five years, with a CAGR of ${pct(
        stats.best.y5,
      )}. This reflects historical NAV growth and is not a forecast.`,
    });
  }

  faqs.push({
    q: `How many mutual fund schemes does ${house} offer?`,
    a: `We track ${n(stats.count)} direct-plan ${house} ${
      stats.count === 1 ? "scheme" : "schemes"
    } with a recent NAV, spread across ${stats.houses > 0 ? [...new Set(funds.map((f) => f.type))].length : 0} asset ${
      [...new Set(funds.map((f) => f.type))].length === 1 ? "type" : "types"
    }. Schemes that have been wound up or have stopped reporting NAV are excluded.`,
  });

  faqs.push({
    q: `Are these ${house} returns before or after expenses?`,
    a: `After. NAV is published net of the scheme's expense ratio, so every CAGR shown here is already net of ongoing costs. Exit loads, stamp duty and your own tax liability are not included.`,
  });

  return faqs;
}

/** Body paragraphs for a rankings page. */
export function rankingsIntro(label: string, total: number, best: FundSummary | null): string[] {
  const horizonNote: Record<string, string> = {
    "1Y": "A single year says more about which sectors were in favour than about a manager's skill, so treat this list as a snapshot of recent momentum rather than evidence of a durable edge.",
    "3Y": "Three years covers at least part of a market cycle. It is long enough to be informative but still short enough that one strong sector run can dominate the result.",
    "5Y": "Five years is the horizon we default to. It usually spans both a drawdown and a recovery, which makes it a fairer test of a fund than any shorter window.",
    "10Y": "Ten years is the most demanding filter on this site. Only funds that have survived multiple cycles — and kept reporting NAV throughout — appear here, so the list is shorter and the names are more established.",
  };

  const out: string[] = [
    `This page ranks ${n(
      total,
    )} direct-plan Indian mutual funds by ${label} compound annual growth rate, calculated from official daily NAV history and refreshed every day. ${
      horizonNote[label] ?? ""
    }`,
  ];

  if (best && best.name) {
    out.push(
      `Rankings span every asset class — equity, debt, hybrid, commodity and solution-oriented schemes sit in one list — so a debt fund and a small-cap fund can appear side by side despite carrying very different risk. Compare funds within their own category before drawing conclusions from a cross-category ranking.`,
    );
  }

  return out;
}

export function rankingsFaqs(label: string, total: number): Faq[] {
  return [
    {
      q: `What does ${label} CAGR mean?`,
      a: `CAGR is the constant annual rate at which an investment would have had to grow to get from its starting NAV to its current NAV over ${label.replace(
        "Y",
        "",
      )} year${label === "1Y" ? "" : "s"}. It smooths out the year-to-year path, so two funds with the same CAGR may have had very different journeys.`,
    },
    {
      q: `Is the highest-CAGR fund the best fund to buy?`,
      a: `Not necessarily. A high CAGR may come from taking concentrated sector or credit risk that will not repeat, and past performance is not a reliable predictor of future returns. Read the ranking alongside the fund's category, its risk profile and your own holding period.`,
    },
    {
      q: `How many funds are ranked here?`,
      a: `${n(
        total,
      )} direct-plan schemes with a recent NAV and enough history to compute a ${label} figure. Funds without sufficient NAV history for this horizon are excluded rather than shown with an estimated number.`,
    },
  ];
}
