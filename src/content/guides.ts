/**
 * Guide content registry. Kept as typed data (not MDX) to avoid extra build
 * dependencies; each guide renders through the same prose layout with JSON-LD.
 * Body blocks are a tiny subset: headings, paragraphs, bullet lists.
 */

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  faqs?: { q: string; a: string }[];
  body: Block[];
}

export const GUIDES: Guide[] = [
  {
    slug: "what-is-cagr",
    title: "What Is CAGR and Why It Matters for Mutual Funds",
    description:
      "CAGR (Compound Annual Growth Rate) is the single most useful number for comparing mutual fund performance. Here's what it means and how to read it.",
    updated: "2026-08-01",
    faqs: [
      {
        q: "Is a higher CAGR always better?",
        a: "Not on its own. A higher CAGR means stronger past compounded growth, but you must weigh it against risk, category, and the time period. A small-cap fund's high CAGR comes with much higher volatility than a large-cap fund's.",
      },
      {
        q: "What is a good CAGR for equity mutual funds in India?",
        a: "Historically, diversified Indian equity funds have delivered roughly 10–15% CAGR over long periods, though individual funds and periods vary widely. Debt funds typically deliver lower, steadier CAGR of around 6–8%.",
      },
    ],
    body: [
      { t: "p", text: "CAGR, or Compound Annual Growth Rate, is the annualised rate at which an investment would have grown if it compounded steadily over a period. It smooths out the year-to-year ups and downs into a single percentage, making it the fairest way to compare funds over the same horizon." },
      { t: "h2", text: "The formula" },
      { t: "p", text: "CAGR = (Ending NAV / Starting NAV)^(1 / years) − 1. For example, if a fund's NAV grew from ₹100 to ₹200 over 5 years, its CAGR is (200/100)^(1/5) − 1 ≈ 14.87% per year — not 20% per year, because returns compound." },
      { t: "h2", text: "Why CAGR beats absolute returns" },
      { t: "ul", items: [
        "It normalises for time, so a 3-year and a 5-year fund can be compared fairly.",
        "It reflects compounding, which simple average returns ignore.",
        "It is less misleading than a single blockbuster year.",
      ] },
      { t: "h2", text: "What CAGR does not tell you" },
      { t: "p", text: "CAGR hides volatility. Two funds with the same 5-year CAGR can have very different risk profiles. Always pair CAGR with a look at the fund's category, drawdowns, and consistency before investing." },
    ],
  },
  {
    slug: "how-to-choose-a-mutual-fund",
    title: "How to Choose a Mutual Fund in India",
    description:
      "A practical checklist for picking an Indian mutual fund — beyond just chasing the highest CAGR.",
    updated: "2026-08-01",
    body: [
      { t: "p", text: "Ranking funds by CAGR is a great starting point, but the highest number on a leaderboard is rarely the whole story. Use this checklist to narrow down." },
      { t: "h2", text: "1. Match the category to your goal" },
      { t: "p", text: "Equity funds (large/mid/small cap, flexi cap, ELSS) suit long horizons and higher risk appetite. Debt funds suit shorter horizons and capital preservation. Hybrid funds sit in between." },
      { t: "h2", text: "2. Compare within the same category" },
      { t: "p", text: "A small-cap fund will usually out-CAGR a large-cap fund in a bull market — that does not make it better. Compare a fund only against its peers in the same category." },
      { t: "h2", text: "3. Look at multiple horizons" },
      { t: "ul", items: [
        "1Y CAGR shows recent momentum but is noisy.",
        "3Y and 5Y CAGR show consistency across market cycles.",
        "10Y CAGR (where available) shows long-term compounding.",
      ] },
      { t: "h2", text: "4. Check costs and plan type" },
      { t: "p", text: "Direct plans have lower expense ratios than regular plans and therefore higher net CAGR over time. The figures on this site are based on growth-plan NAV history." },
    ],
  },
  {
    slug: "cagr-vs-xirr-vs-absolute-returns",
    title: "CAGR vs XIRR vs Absolute Returns",
    description:
      "Three ways to measure mutual fund returns — and when each one is the right tool.",
    updated: "2026-08-01",
    body: [
      { t: "p", text: "Fund fact sheets throw around several return measures. Here's how they differ." },
      { t: "h2", text: "Absolute return" },
      { t: "p", text: "The simple total gain: (End − Start) / Start. Useful for a single lump sum over short periods, but it ignores time, so it can't fairly compare a 1-year and a 5-year result." },
      { t: "h2", text: "CAGR" },
      { t: "p", text: "The annualised, compounded growth of a single lump-sum investment. Best for comparing funds over the same period — which is what this site ranks on." },
      { t: "h2", text: "XIRR" },
      { t: "p", text: "The annualised return when you invest at multiple points in time — for example, a monthly SIP. XIRR accounts for the timing and size of each cash flow, so it's the right measure for your own SIP portfolio, while CAGR is right for comparing the funds themselves." },
    ],
  },
  {
    slug: "understanding-elss-tax-saver-funds",
    title: "Understanding ELSS Tax-Saver Funds",
    description:
      "ELSS funds offer tax deduction under Section 80C with the shortest lock-in of any 80C option. Here's how they work.",
    updated: "2026-08-01",
    body: [
      { t: "p", text: "ELSS (Equity Linked Savings Scheme) funds are diversified equity funds that also qualify for a tax deduction of up to ₹1.5 lakh a year under Section 80C of the old tax regime." },
      { t: "h2", text: "Key features" },
      { t: "ul", items: [
        "3-year lock-in — the shortest among 80C instruments like PPF or NSC.",
        "Invested predominantly in equities, so returns track the equity market.",
        "Available as growth or dividend, direct or regular plans.",
      ] },
      { t: "h2", text: "How to compare ELSS funds" },
      { t: "p", text: "Because all ELSS funds share the same lock-in and tax treatment, comparing their 3Y, 5Y and 10Y CAGR within the ELSS category is a clean way to shortlist. See the ranked list on our ELSS category page." },
    ],
  },
  {
    slug: "sip-vs-lumpsum",
    title: "SIP vs Lump Sum Investing",
    description:
      "Should you invest a lump sum or spread it out through a SIP? How each interacts with CAGR.",
    updated: "2026-08-01",
    body: [
      { t: "p", text: "A SIP (Systematic Investment Plan) invests a fixed amount at regular intervals; a lump sum invests it all at once. Both buy units of the same fund, so the fund's CAGR is the same — what differs is your personal return." },
      { t: "h2", text: "Why the fund's CAGR still matters" },
      { t: "p", text: "The fund's CAGR reflects the underlying portfolio's growth regardless of how you invest. Your realised return depends on when your money went in, which is why a SIP's outcome is measured by XIRR rather than CAGR." },
      { t: "h2", text: "Rule of thumb" },
      { t: "ul", items: [
        "SIP suits regular income and reduces timing risk through rupee-cost averaging.",
        "Lump sum can outperform in a sustained bull run but carries timing risk.",
        "Either way, pick the fund on its category-adjusted CAGR and consistency.",
      ] },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
