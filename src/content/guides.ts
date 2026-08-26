/**
 * Guide content registry. Kept as typed data (not MDX) to avoid extra build
 * dependencies; each guide renders through the same prose layout with JSON-LD.
 * Body blocks are a tiny subset: headings, paragraphs, bullet lists.
 */

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] };

/** Topic grouping used to organise the guides index once the list grew past a handful. */
export type GuideTopic =
  | "Returns & metrics"
  | "Fund types"
  | "Costs & taxes"
  | "Investing practice";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  topic: GuideTopic;
  faqs?: { q: string; a: string }[];
  body: Block[];
  /** Internal links rendered as a "Related" block — guides, categories or rankings. */
  related?: { label: string; href: string }[];
  /** External references, shown as attributed links (used where facts are time-sensitive). */
  sources?: { label: string; url: string }[];
}

export const GUIDES: Guide[] = [
  // ── Returns & metrics ───────────────────────────────────────────────────────
  {
    slug: "what-is-cagr",
    title: "What Is CAGR and Why It Matters for Mutual Funds",
    description:
      "CAGR (Compound Annual Growth Rate) is the single most useful number for comparing mutual fund performance. Here's what it means and how to read it.",
    updated: "2026-08-01",
    topic: "Returns & metrics",
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
    related: [
      { label: "CAGR vs XIRR vs absolute returns", href: "/guides/cagr-vs-xirr-vs-absolute-returns" },
      { label: "Rolling returns vs point-to-point returns", href: "/guides/rolling-returns-vs-point-to-point" },
      { label: "Top funds by 5Y CAGR", href: "/rankings/5y" },
    ],
  },
  {
    slug: "how-to-choose-a-mutual-fund",
    title: "How to Choose a Mutual Fund in India",
    description:
      "A practical checklist for picking an Indian mutual fund — beyond just chasing the highest CAGR.",
    updated: "2026-08-01",
    topic: "Investing practice",
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
    related: [
      { label: "Direct vs regular plans", href: "/guides/direct-vs-regular-plans" },
      { label: "How many funds should you own?", href: "/guides/how-many-funds-should-you-own" },
      { label: "Browse all fund categories", href: "/categories" },
    ],
  },
  {
    slug: "cagr-vs-xirr-vs-absolute-returns",
    title: "CAGR vs XIRR vs Absolute Returns",
    description:
      "Three ways to measure mutual fund returns — and when each one is the right tool.",
    updated: "2026-08-01",
    topic: "Returns & metrics",
    body: [
      { t: "p", text: "Fund fact sheets throw around several return measures. Here's how they differ." },
      { t: "h2", text: "Absolute return" },
      { t: "p", text: "The simple total gain: (End − Start) / Start. Useful for a single lump sum over short periods, but it ignores time, so it can't fairly compare a 1-year and a 5-year result." },
      { t: "h2", text: "CAGR" },
      { t: "p", text: "The annualised, compounded growth of a single lump-sum investment. Best for comparing funds over the same period — which is what this site ranks on." },
      { t: "h2", text: "XIRR" },
      { t: "p", text: "The annualised return when you invest at multiple points in time — for example, a monthly SIP. XIRR accounts for the timing and size of each cash flow, so it's the right measure for your own SIP portfolio, while CAGR is right for comparing the funds themselves." },
    ],
    related: [
      { label: "What is CAGR?", href: "/guides/what-is-cagr" },
      { label: "How a SIP actually works", href: "/guides/how-sip-works" },
    ],
  },
  {
    slug: "understanding-elss-tax-saver-funds",
    title: "Understanding ELSS Tax-Saver Funds",
    description:
      "ELSS funds offer tax deduction under Section 80C with the shortest lock-in of any 80C option. Here's how they work.",
    updated: "2026-08-01",
    topic: "Costs & taxes",
    body: [
      { t: "p", text: "ELSS (Equity Linked Savings Scheme) funds are diversified equity funds that also qualify for a tax deduction of up to ₹1.5 lakh a year under Section 80C of the old tax regime." },
      { t: "h2", text: "Key features" },
      { t: "ul", items: [
        "3-year lock-in — the shortest among 80C instruments like PPF or NSC.",
        "Invested predominantly in equities, so returns track the equity market.",
        "Available as growth or dividend, direct or regular plans.",
      ] },
      { t: "h2", text: "The lock-in works per instalment" },
      { t: "p", text: "If you invest through a SIP, each instalment is locked for three years from its own date — not three years from when you started. A SIP begun in January 2026 has its January instalment free in January 2029, its February instalment in February 2029, and so on." },
      { t: "h2", text: "One caveat on the new tax regime" },
      { t: "p", text: "Section 80C deductions are only available under the old tax regime. If you have opted for the new regime, an ELSS fund gives you no tax deduction — at which point it is simply a diversified equity fund with a three-year lock-in, and an open-ended flexi cap fund may suit you better." },
      { t: "h2", text: "How to compare ELSS funds" },
      { t: "p", text: "Because all ELSS funds share the same lock-in and tax treatment, comparing their 3Y, 5Y and 10Y CAGR within the ELSS category is a clean way to shortlist." },
    ],
    related: [
      { label: "All ELSS funds ranked by CAGR", href: "/category/elss" },
      { label: "How mutual funds are taxed in India", href: "/guides/mutual-fund-taxation-india" },
    ],
  },
  {
    slug: "sip-vs-lumpsum",
    title: "SIP vs Lump Sum Investing",
    description:
      "Should you invest a lump sum or spread it out through a SIP? How each interacts with CAGR.",
    updated: "2026-08-01",
    topic: "Investing practice",
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
    related: [
      { label: "How a SIP actually works", href: "/guides/how-sip-works" },
      { label: "CAGR vs XIRR", href: "/guides/cagr-vs-xirr-vs-absolute-returns" },
    ],
  },

  // ── Fund mechanics ──────────────────────────────────────────────────────────
  {
    slug: "what-is-nav",
    title: "What Is NAV in a Mutual Fund?",
    description:
      "NAV is the per-unit price of a mutual fund. Here's how it's calculated, why a low NAV isn't 'cheap', and what it does and doesn't tell you.",
    updated: "2026-08-26",
    topic: "Returns & metrics",
    faqs: [
      {
        q: "Is a fund with a lower NAV cheaper or better value?",
        a: "No. NAV is just the portfolio value divided by the number of units. A fund at ₹15 and a fund at ₹500 can hold identical portfolios — ₹10,000 simply buys you more units of the cheaper-looking one. Only the percentage change in NAV matters, never its absolute level.",
      },
      {
        q: "Why does my fund's NAV not change intraday?",
        a: "Mutual fund NAV is computed once at the end of each business day, after markets close and the portfolio is valued. Unlike a stock or an ETF, you always transact at the day's declared NAV rather than a live price.",
      },
    ],
    body: [
      { t: "p", text: "NAV (Net Asset Value) is the per-unit price of a mutual fund scheme. It is the value of everything the fund owns, minus what it owes, divided by the number of units outstanding." },
      { t: "h2", text: "How it is calculated" },
      { t: "p", text: "NAV = (Total market value of holdings + cash − liabilities and expenses) / Number of units. AMCs must declare NAV for each business day, and it is published to four decimal places." },
      { t: "h2", text: "The biggest misconception" },
      { t: "p", text: "A low NAV does not mean a fund is cheap or has more room to grow. If Fund A has an NAV of ₹20 and Fund B ₹200, investing ₹20,000 buys 1,000 units of A or 100 units of B. If both rise 10%, you gain ₹2,000 either way. NAV level is an accounting artefact of when the fund launched, not a valuation signal." },
      { t: "h2", text: "NAV is already net of expenses" },
      { t: "p", text: "The expense ratio is deducted daily before NAV is declared, so every return figure computed from NAV — including all the CAGR on this site — is already after ongoing fund costs. Exit loads and your own taxes are not included." },
    ],
    related: [
      { label: "Expense ratio explained", href: "/guides/expense-ratio-explained" },
      { label: "What is CAGR?", href: "/guides/what-is-cagr" },
    ],
  },
  {
    slug: "direct-vs-regular-plans",
    title: "Direct vs Regular Mutual Fund Plans",
    description:
      "The same scheme, two price tags. Why direct plans have a higher NAV and what the commission difference compounds to over a decade.",
    updated: "2026-08-26",
    topic: "Costs & taxes",
    faqs: [
      {
        q: "Is a direct plan always better than a regular plan?",
        a: "Financially, a direct plan of the same scheme always has a lower expense ratio and therefore higher returns. A regular plan is only worth it if the distributor's advice genuinely adds more value than the commission costs you.",
      },
      {
        q: "Can I switch from a regular plan to a direct plan?",
        a: "Yes, but a switch is treated as a redemption and a fresh purchase, so it can trigger capital gains tax and any applicable exit load. Many investors leave existing units alone and simply direct new investments into the direct plan.",
      },
    ],
    body: [
      { t: "p", text: "Every mutual fund scheme in India is sold in two versions. A regular plan pays a commission to the distributor who sold it; a direct plan, bought straight from the AMC or through certain platforms, pays no commission." },
      { t: "h2", text: "Same portfolio, different expense ratio" },
      { t: "p", text: "Both plans hold exactly the same securities and are run by the same manager. The only difference is cost: the commission is built into the regular plan's expense ratio, typically adding roughly 0.5% to 1% a year. That cost is deducted from NAV daily, so the direct plan's NAV pulls steadily ahead." },
      { t: "h2", text: "What the gap compounds to" },
      { t: "p", text: "A 0.75% annual cost difference sounds small. On ₹10 lakh growing at 12% for 20 years, it is the difference between roughly ₹96 lakh and ₹83 lakh — over ₹13 lakh, paid out of your return rather than the AMC's. Cost is the one variable in fund selection you can control with certainty." },
      { t: "h2", text: "Why this site ranks direct plans" },
      { t: "p", text: "We rank direct plans only. Listing both versions of every scheme would duplicate the entire universe, and the direct plan is the like-for-like performer that shows what the fund manager actually delivered." },
    ],
    related: [
      { label: "Expense ratio explained", href: "/guides/expense-ratio-explained" },
      { label: "Growth vs IDCW option", href: "/guides/growth-vs-idcw-option" },
    ],
  },
  {
    slug: "growth-vs-idcw-option",
    title: "Growth vs IDCW (Dividend) Option",
    description:
      "Two options within one scheme. Why growth almost always compounds better, and why IDCW NAV and returns look lower.",
    updated: "2026-08-26",
    topic: "Costs & taxes",
    faqs: [
      {
        q: "Which is better, growth or IDCW?",
        a: "For most long-term investors, growth. IDCW payouts are taxed at your slab rate as income in the year received, and money paid out stops compounding. If you need regular cash flow, a Systematic Withdrawal Plan from a growth option is usually more tax-efficient.",
      },
      {
        q: "Why is the IDCW option's NAV lower than the growth option's?",
        a: "Because every payout is deducted from NAV. The IDCW option isn't performing worse — its returns have simply been partly handed back to you in cash rather than left to compound inside the fund.",
      },
    ],
    body: [
      { t: "p", text: "Each scheme offers a growth option and an IDCW option (Income Distribution cum Capital Withdrawal — what used to be called the dividend option). The portfolio is identical; only what happens to gains differs." },
      { t: "h2", text: "How they diverge" },
      { t: "ul", items: [
        "Growth: all gains stay invested, so NAV rises and compounding is uninterrupted.",
        "IDCW: the fund periodically pays out part of the NAV, which permanently reduces NAV by the amount paid.",
      ] },
      { t: "h2", text: "IDCW is not extra money" },
      { t: "p", text: "The name change from 'dividend' to IDCW was deliberate. A payout is not profit generated on top of your investment — it is a withdrawal from your own capital and gains. Receiving ₹5 per unit drops your NAV by ₹5." },
      { t: "h2", text: "The tax difference matters" },
      { t: "p", text: "Since 2020, IDCW payouts are added to your income and taxed at your slab rate, with TDS applicable above a threshold. Growth-option gains are taxed only when you redeem, and at capital-gains rates that are usually lower. Deferral alone is a meaningful advantage." },
      { t: "h2", text: "Why we exclude IDCW plans from rankings" },
      { t: "p", text: "Because payouts reset NAV, multi-year CAGR computed from an IDCW NAV series understates the fund's actual performance and isn't comparable to a growth series. Ranking both would also list every scheme twice." },
    ],
    related: [
      { label: "What is NAV?", href: "/guides/what-is-nav" },
      { label: "SWP and STP explained", href: "/guides/swp-and-stp-explained" },
      { label: "How mutual funds are taxed", href: "/guides/mutual-fund-taxation-india" },
    ],
  },
  {
    slug: "expense-ratio-explained",
    title: "Expense Ratio: What You Actually Pay",
    description:
      "The annual cost of owning a fund, deducted daily from NAV. What's included, what SEBI caps it at, and how much it costs you over time.",
    updated: "2026-08-26",
    topic: "Costs & taxes",
    faqs: [
      {
        q: "Is the expense ratio charged on top of my investment?",
        a: "No — it is deducted from the fund's assets daily before NAV is declared. You never see a separate charge, which is exactly why it is easy to ignore. Every return figure you see is already net of it.",
      },
      {
        q: "Do index funds have lower expense ratios?",
        a: "Yes, substantially. Because there is no research team picking stocks, index funds and ETFs often charge a fraction of what active funds charge — a gap that compounds significantly over a decade.",
      },
    ],
    body: [
      { t: "p", text: "The Total Expense Ratio (TER) is the annual cost of running a scheme, expressed as a percentage of assets. It covers fund management fees, administration, registrar and transfer agent charges, marketing, and applicable taxes." },
      { t: "h2", text: "How it is charged" },
      { t: "p", text: "TER is not billed to you. It is accrued daily and deducted from the fund's assets before NAV is published. A fund with a 1.5% TER gives up roughly 1.5/365 of a percent each day, invisibly." },
      { t: "h2", text: "SEBI caps it on a sliding scale" },
      { t: "p", text: "SEBI limits TER by scheme type and size, with larger funds required to charge less as economies of scale kick in. Index funds and ETFs face far tighter caps than active equity funds, and direct plans must be cheaper than regular plans of the same scheme." },
      { t: "h2", text: "Why small differences matter" },
      { t: "p", text: "Cost is the most reliable predictor of relative fund performance available, because it is the one input known in advance. On a 20-year horizon, a percentage point of annual cost can consume a fifth or more of your final corpus." },
    ],
    related: [
      { label: "Direct vs regular plans", href: "/guides/direct-vs-regular-plans" },
      { label: "Index funds vs active funds", href: "/guides/index-funds-vs-active-funds" },
      { label: "Exit load explained", href: "/guides/exit-load-explained" },
    ],
  },
  {
    slug: "exit-load-explained",
    title: "Exit Load: The Cost of Leaving Early",
    description:
      "A fee charged when you redeem before a set period. Typical structures by category and how it differs from the expense ratio.",
    updated: "2026-08-26",
    topic: "Costs & taxes",
    body: [
      { t: "p", text: "An exit load is a one-time charge deducted from your redemption proceeds if you exit a scheme before a specified holding period. Its purpose is to discourage short-term churn, which forces the manager to sell holdings at inconvenient times." },
      { t: "h2", text: "Typical structures" },
      { t: "ul", items: [
        "Equity funds: commonly around 1% if redeemed within 12 months, nil after.",
        "Liquid and overnight funds: nil, or a small graded load for the first few days.",
        "Short-duration debt funds: often nil or a short window of a few months.",
        "ELSS: no exit load, because the 3-year lock-in already prevents early exit.",
      ] },
      { t: "h2", text: "How it differs from the expense ratio" },
      { t: "p", text: "The expense ratio is ongoing and unavoidable; the exit load is one-off and entirely avoidable by holding long enough. Exit load is also charged on the redemption value, so it applies to your gains as well as your capital." },
      { t: "h2", text: "Check before you switch" },
      { t: "p", text: "Switching between schemes, or from a regular to a direct plan, counts as a redemption. Confirm both the exit load and the capital-gains consequence before moving money." },
    ],
    related: [
      { label: "Expense ratio explained", href: "/guides/expense-ratio-explained" },
      { label: "When to exit a mutual fund", href: "/guides/when-to-exit-a-mutual-fund" },
    ],
  },
  {
    slug: "what-is-aum",
    title: "What Is AUM, and Does Fund Size Matter?",
    description:
      "Assets Under Management explained — when a large fund helps you, and when size starts working against returns.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "AUM (Assets Under Management) is the total market value of the money a scheme manages. It grows through fresh inflows and through appreciation of the portfolio, and shrinks on redemptions and falls." },
      { t: "h2", text: "Where large AUM helps" },
      { t: "ul", items: [
        "Expense ratios usually fall as AUM rises, since SEBI's caps tighten with size.",
        "A large, stable asset base makes it easier to meet redemptions without forced selling.",
        "It often signals a long track record and investor confidence.",
      ] },
      { t: "h2", text: "Where large AUM hurts" },
      { t: "p", text: "Size is the enemy of agility, and the effect is category-specific. A very large small-cap fund struggles to build meaningful positions in genuinely small companies without moving their prices, which can push it toward larger stocks and dilute the strategy you bought. For large-cap and index funds, size is almost never a problem." },
      { t: "h2", text: "How to read it" },
      { t: "p", text: "Treat AUM as context, not a score. A small fund is not automatically nimble, and a large one is not automatically bloated — what matters is whether the size still fits the mandate." },
    ],
    related: [
      { label: "Large cap vs mid cap vs small cap", href: "/guides/large-mid-small-cap-funds" },
      { label: "Browse fund houses by AUM", href: "/amcs" },
    ],
  },

  // ── Fund types ──────────────────────────────────────────────────────────────
  {
    slug: "equity-vs-debt-funds",
    title: "Equity vs Debt Funds",
    description:
      "The fundamental split in mutual funds — what each owns, the risks that drive returns, and how to decide the mix.",
    updated: "2026-08-26",
    topic: "Fund types",
    faqs: [
      {
        q: "Are debt funds risk-free?",
        a: "No. They carry interest-rate risk (NAV falls when yields rise, more so for longer maturities) and credit risk (an issuer may default or be downgraded). They are lower-risk than equity, not risk-free — several Indian credit funds have taken sharp write-downs.",
      },
    ],
    body: [
      { t: "p", text: "Equity funds own shares in companies. Debt funds lend money by holding bonds and money-market instruments. That single difference drives almost everything else about how they behave." },
      { t: "h2", text: "Equity funds" },
      { t: "p", text: "Returns come from earnings growth and re-rating, and are highly variable — double-digit gains and 30%+ drawdowns are both normal. Equity needs time: the longer the horizon, the more reliably the volatility averages out. Suited to goals five years or more away." },
      { t: "h2", text: "Debt funds" },
      { t: "p", text: "Returns come from interest income plus price movement as yields change. They are far steadier, but bounded — you will not compound at equity-like rates. Suited to goals within a few years, and to the stability portion of a portfolio." },
      { t: "h2", text: "Deciding the mix" },
      { t: "ul", items: [
        "Horizon is the strongest guide: shorter goals belong in debt.",
        "Ability to sit through a 30% fall matters more than a stated risk appetite.",
        "Hybrid funds handle the split inside a single scheme if you would rather not manage it.",
      ] },
    ],
    related: [
      { label: "Debt fund risks explained", href: "/guides/debt-fund-risks" },
      { label: "All equity categories", href: "/?type=Equity" },
      { label: "All debt categories", href: "/?type=Debt" },
    ],
  },
  {
    slug: "large-mid-small-cap-funds",
    title: "Large Cap vs Mid Cap vs Small Cap Funds",
    description:
      "SEBI's market-cap definitions, the risk and return trade-off between the three, and how to combine them.",
    updated: "2026-08-26",
    topic: "Fund types",
    faqs: [
      {
        q: "Should a first-time investor start with small-cap funds because returns are higher?",
        a: "Generally no. Small caps have delivered the highest long-run returns but with falls of 40–60% in bad years. A large-cap, flexi-cap or index fund is a more forgiving starting point; small-cap exposure is easier to hold once you have experienced a full cycle.",
      },
    ],
    body: [
      { t: "p", text: "SEBI defines the segments by rank on full market capitalisation, so the labels mean the same thing across every AMC." },
      { t: "h2", text: "The definitions" },
      { t: "ul", items: [
        "Large cap: companies ranked 1–100. Funds must hold at least 80% here.",
        "Mid cap: ranked 101–250. Funds must hold at least 65% here.",
        "Small cap: ranked 251 and below. Funds must hold at least 65% here.",
      ] },
      { t: "h2", text: "The trade-off" },
      { t: "p", text: "Moving down the size scale raises both expected return and volatility. Large caps are established and widely researched, so they fall less and recover sooner. Small caps can compound dramatically but are illiquid and unforgiving in a downturn — the same fund can top the 5-year table and halve within a year." },
      { t: "h2", text: "Combining them" },
      { t: "p", text: "Rather than assembling the three yourself, consider a flexi cap (manager decides the allocation) or a multi cap (mandated minimum 25% in each). Both give diversified exposure without you having to time the rotation between segments." },
    ],
    related: [
      { label: "Large cap funds", href: "/category/large-cap-fund" },
      { label: "Mid cap funds", href: "/category/mid-cap-fund" },
      { label: "Small cap funds", href: "/category/small-cap-fund" },
    ],
  },
  {
    slug: "index-funds-vs-active-funds",
    title: "Index Funds vs Active Funds",
    description:
      "Tracking a benchmark versus trying to beat it — costs, tracking error, and what the evidence says for Indian investors.",
    updated: "2026-08-26",
    topic: "Fund types",
    faqs: [
      {
        q: "Can an index fund beat its index?",
        a: "No. After costs, an index fund will always return slightly less than the index it tracks. The gap — tracking difference — should be small; a persistently large one is a reason to switch.",
      },
    ],
    body: [
      { t: "p", text: "An active fund employs a manager and research team to select stocks with the aim of beating a benchmark. An index fund simply replicates the benchmark, holding the same securities in the same weights." },
      { t: "h2", text: "Cost is the structural difference" },
      { t: "p", text: "No research team means a far lower expense ratio. That difference is guaranteed and compounds every year, whereas outperformance is uncertain and rarely persists across the same fund for long stretches." },
      { t: "h2", text: "Tracking error and tracking difference" },
      { t: "p", text: "Two numbers to check on any index fund: tracking difference (how far its return sits below the index, largely explained by cost) and tracking error (how consistently it follows the index). Lower is better on both." },
      { t: "h2", text: "Where active still earns its fee" },
      { t: "p", text: "Indexing is hardest to beat in the large-cap space, where information is widely available. Further down the market-cap scale, and in credit-sensitive debt, a good manager has more room to add value — though identifying that manager in advance remains the difficulty." },
    ],
    related: [
      { label: "Index funds ranked by CAGR", href: "/category/index-funds" },
      { label: "What is an ETF?", href: "/guides/what-is-an-etf" },
      { label: "Expense ratio explained", href: "/guides/expense-ratio-explained" },
    ],
  },
  {
    slug: "what-is-an-etf",
    title: "What Is an ETF, and How Is It Different?",
    description:
      "Exchange Traded Funds trade like shares. What that changes about pricing, costs and access — and when an index fund is simpler.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "An ETF is a fund whose units are listed and traded on a stock exchange. Most ETFs track an index, which makes them close cousins of index funds with one important difference: how you buy and sell." },
      { t: "h2", text: "Price versus NAV" },
      { t: "p", text: "A mutual fund transacts at end-of-day NAV. An ETF transacts at whatever price the market offers at that moment, which may sit slightly above or below its underlying NAV. In thinly traded ETFs that gap can be meaningful, and a wide bid-ask spread is a real cost." },
      { t: "h2", text: "What you need" },
      { t: "ul", items: [
        "A demat and trading account — an ETF cannot be bought like a regular fund.",
        "Awareness of liquidity: check traded volumes before buying.",
        "Brokerage and related charges, on top of the expense ratio.",
      ] },
      { t: "h2", text: "ETF or index fund?" },
      { t: "p", text: "ETFs typically carry the lowest expense ratios. Index funds are simpler — no demat account, easy SIPs, and guaranteed execution at NAV. For a monthly SIP, an index fund is usually the more practical choice; for a large lump sum where cost dominates, an ETF can win." },
    ],
    related: [
      { label: "Equity ETFs ranked by CAGR", href: "/category/equity-etf" },
      { label: "Index funds vs active funds", href: "/guides/index-funds-vs-active-funds" },
    ],
  },
  {
    slug: "fund-of-funds-explained",
    title: "Fund of Funds (FoF) Explained",
    description:
      "A fund that invests in other funds — where the structure genuinely helps, and the extra layer of cost it adds.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "A Fund of Funds holds units of other mutual fund schemes rather than buying securities directly. In India the structure is most common for international exposure, gold and silver, and multi-asset allocation." },
      { t: "h2", text: "Why the structure exists" },
      { t: "ul", items: [
        "International access without a foreign brokerage account or overseas paperwork.",
        "Gold and silver exposure with SIPs and no demat account, by holding an ETF underneath.",
        "Ready-made asset allocation across several underlying funds in one purchase.",
      ] },
      { t: "h2", text: "The cost of the extra layer" },
      { t: "p", text: "You pay the FoF's expense ratio and, indirectly, the underlying scheme's. SEBI caps the total, but an FoF is still structurally costlier than holding the underlying fund directly when that option is available to you." },
      { t: "h2", text: "Check what sits underneath" },
      { t: "p", text: "An FoF's returns are the underlying fund's returns minus the extra cost, so evaluate the underlying holding first. For overseas FoFs, remember that the rupee's movement against the underlying currency affects your return independently of how that market performed." },
    ],
    related: [
      { label: "Domestic FoFs", href: "/category/fof-domestic" },
      { label: "Overseas FoFs", href: "/category/fof-overseas" },
      { label: "Gold investment options compared", href: "/guides/gold-investment-options" },
    ],
  },
  {
    slug: "arbitrage-funds-explained",
    title: "Arbitrage Funds: Equity Taxation, Debt-Like Risk",
    description:
      "How arbitrage funds capture the cash-futures spread, why their risk resembles short-term debt, and who they suit.",
    updated: "2026-08-26",
    topic: "Fund types",
    faqs: [
      {
        q: "Are arbitrage fund returns guaranteed?",
        a: "No. They are low-volatility but not fixed. Returns depend on the size of the cash-futures spread, which widens in volatile, high-interest-rate conditions and compresses in calm markets — occasionally below what a liquid fund would earn.",
      },
    ],
    body: [
      { t: "p", text: "An arbitrage fund simultaneously buys a stock in the cash market and sells its futures contract, locking in the price difference between the two. Because both positions offset, the fund is not taking a directional bet on the market." },
      { t: "h2", text: "Risk like debt, tax like equity" },
      { t: "p", text: "The hedged structure means volatility resembles a short-term debt fund. But because the fund holds equity and equity derivatives, it qualifies as equity-oriented for tax purposes — the combination that makes the category popular with investors in higher tax brackets." },
      { t: "h2", text: "Where the returns come from" },
      { t: "p", text: "Spreads are a function of market conditions, not manager skill in stock picking. Expect returns broadly in the neighbourhood of short-term debt, varying with volatility and rates." },
      { t: "h2", text: "Who they suit" },
      { t: "ul", items: [
        "Parking money for a few months to a year in a higher tax bracket.",
        "Holding the debt-like portion of a portfolio more tax-efficiently.",
        "Not a substitute for equity growth, and not a guaranteed-return product.",
      ] },
    ],
    related: [
      { label: "Arbitrage funds ranked", href: "/category/arbitrage-fund" },
      { label: "How mutual funds are taxed", href: "/guides/mutual-fund-taxation-india" },
      { label: "Liquid funds vs savings account", href: "/guides/liquid-funds-vs-savings-account" },
    ],
  },
  {
    slug: "liquid-funds-vs-savings-account",
    title: "Liquid Funds vs a Savings Account",
    description:
      "Where to park short-term money — returns, access speed, safety and tax compared.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "A liquid fund invests in debt maturing within 91 days. It is the standard vehicle for money you will need in weeks or months but do not want sitting idle." },
      { t: "h2", text: "How they compare" },
      { t: "ul", items: [
        "Return: liquid funds typically track short-term money-market rates, usually above a savings account, but nothing is guaranteed.",
        "Access: redemption proceeds normally arrive the next business day; many schemes offer an instant redemption facility up to a limit.",
        "Safety: bank deposits carry DICGC insurance up to ₹5 lakh. A liquid fund has no such guarantee — NAV can fall, though sharp moves are rare.",
        "Tax: bank interest is taxed at your slab rate as it accrues; liquid fund gains are taxed only on redemption.",
      ] },
      { t: "h2", text: "Overnight funds are a notch safer" },
      { t: "p", text: "If even 91-day paper feels like too much, overnight funds hold securities maturing in a single day — the lowest-risk category available. Returns are correspondingly lower." },
      { t: "h2", text: "Keep a real emergency buffer in the bank" },
      { t: "p", text: "Liquid funds are not a full substitute for cash. Keep enough in your bank account for genuine emergencies at any hour, and use liquid funds for the surplus beyond that." },
    ],
    related: [
      { label: "Liquid funds ranked", href: "/category/liquid-fund" },
      { label: "Overnight funds ranked", href: "/category/overnight-fund" },
      { label: "Debt fund risks", href: "/guides/debt-fund-risks" },
    ],
  },
  {
    slug: "debt-fund-risks",
    title: "The Two Risks in Every Debt Fund",
    description:
      "Interest-rate risk and credit risk explained — why a 'safe' debt fund can still lose money, and how duration governs the damage.",
    updated: "2026-08-26",
    topic: "Fund types",
    faqs: [
      {
        q: "Why did my debt fund's NAV fall when interest rates rose?",
        a: "Existing bonds paying lower coupons become less attractive when new bonds offer higher yields, so their market price falls, and the fund's NAV falls with it. The longer the portfolio's duration, the larger the fall.",
      },
    ],
    body: [
      { t: "p", text: "Debt funds are lower risk than equity, not risk-free. Almost every surprise in the category traces back to one of two sources." },
      { t: "h2", text: "1. Interest-rate risk" },
      { t: "p", text: "Bond prices move inversely to yields. When rates rise, the bonds a fund already holds lose market value and NAV dips. Sensitivity is measured by duration: roughly, a fund with 5-year duration loses about 5% of value for a 1% rise in yields, and gains similarly when yields fall." },
      { t: "h2", text: "2. Credit risk" },
      { t: "p", text: "The chance that a borrower fails to pay, or is downgraded. Higher-yielding portfolios earn that extra yield precisely by lending to weaker credits. A single default in a concentrated portfolio can produce a sudden, permanent NAV drop — this is what has caused the category's worst episodes in India." },
      { t: "h2", text: "Matching category to horizon" },
      { t: "ul", items: [
        "Weeks to months: overnight and liquid funds — minimal duration and credit risk.",
        "One to three years: low duration, short duration, money market and corporate bond funds.",
        "Longer, with tolerance for swings: gilt and long-duration funds — no credit risk, high rate risk.",
        "Credit risk funds: extra yield for genuine default risk; check issuer concentration.",
      ] },
    ],
    related: [
      { label: "Gilt funds ranked", href: "/category/gilt-fund" },
      { label: "Corporate bond funds", href: "/category/corporate-bond-fund" },
      { label: "Equity vs debt funds", href: "/guides/equity-vs-debt-funds" },
    ],
  },
  {
    slug: "sectoral-and-thematic-funds",
    title: "Sectoral and Thematic Funds: Know the Risk",
    description:
      "Concentrated bets on one sector or theme. Why they top the charts and the bottom of them, and how much to allocate.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "A sectoral fund invests in a single sector — banking, pharma, technology, infrastructure. A thematic fund is slightly broader, following an idea such as consumption or manufacturing across sectors. Both are undiversified by design." },
      { t: "h2", text: "Why they dominate both ends of the table" },
      { t: "p", text: "Whichever sector has just run hard will occupy the top of any 1-year ranking, and it is the largest category on this site. The same concentration works in reverse: when the cycle turns, these funds fall further and stay down longer than a diversified fund." },
      { t: "h2", text: "The timing problem" },
      { t: "p", text: "Sector returns are cyclical, so you need to be roughly right about both entry and exit. Most investors buy after strong performance has already been delivered, which is structurally the worst moment. Past sector returns are a particularly poor guide to future ones." },
      { t: "h2", text: "A sensible approach" },
      { t: "ul", items: [
        "Treat these as a satellite holding, not a core one — a modest share of the equity allocation.",
        "Have a reason beyond recent returns for choosing the sector.",
        "Remember a diversified fund already owns these sectors at market weight.",
      ] },
    ],
    related: [
      { label: "Sectoral / thematic funds ranked", href: "/category/sectoral-thematic" },
      { label: "How many funds should you own?", href: "/guides/how-many-funds-should-you-own" },
    ],
  },
  {
    slug: "balanced-advantage-funds",
    title: "Balanced Advantage and Dynamic Asset Allocation Funds",
    description:
      "Funds that shift between equity and debt using a valuation model. What they are good at, and what they are not.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "A Balanced Advantage Fund (BAF), also called Dynamic Asset Allocation, moves its equity allocation up and down according to a model — typically raising equity when markets look cheap on valuation measures and cutting it when they look expensive." },
      { t: "h2", text: "The goal is a smoother ride" },
      { t: "p", text: "These funds are built to reduce drawdowns, not to maximise return. In a strong bull market a BAF will usually lag a pure equity fund, because it will have been trimming equity as valuations rose. That is the design working, not failing." },
      { t: "h2", text: "Models differ a lot" },
      { t: "p", text: "Two BAFs can behave very differently depending on whether the model is driven by price-to-earnings, price-to-book, or trend signals, and how wide the equity band is. Read the scheme document — the label tells you less than usual here." },
      { t: "h2", text: "Who they suit" },
      { t: "ul", items: [
        "Investors who want equity exposure but would panic-sell in a deep fall.",
        "Those who want the allocation decision handled inside the fund.",
        "Most retain equity taxation via derivative hedging — worth confirming per scheme.",
      ] },
    ],
    related: [
      { label: "Balanced advantage funds ranked", href: "/category/dynamic-asset-allocation-or-balanced-advantage" },
      { label: "Multi asset allocation funds", href: "/guides/multi-asset-allocation-funds" },
    ],
  },
  {
    slug: "multi-asset-allocation-funds",
    title: "Multi Asset Allocation Funds",
    description:
      "One scheme holding equity, debt and gold. How the mandate works and why the mix reduces dependence on any single market.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "A Multi Asset Allocation fund must invest at least 10% in each of at least three asset classes. In practice that is usually equity, debt and gold, sometimes with international equity added." },
      { t: "h2", text: "Why the mix helps" },
      { t: "p", text: "These assets do not move together. Gold often rises when equity is under stress and the rupee weakens; debt provides income when equity stalls. Combining them lowers portfolio volatility more than it lowers expected return." },
      { t: "h2", text: "Rebalancing is the quiet advantage" },
      { t: "p", text: "The fund trims what has run up and adds to what has lagged, automatically. Done inside a single scheme, that rebalancing triggers no tax event for you — whereas doing it yourself across three funds would." },
      { t: "h2", text: "Check the actual allocation and tax status" },
      { t: "p", text: "The 10% minimum leaves wide latitude: one fund may hold 65% equity, another 35%. That difference drives both risk and tax treatment, since equity taxation depends on the equity and derivative share. Verify both before choosing." },
    ],
    related: [
      { label: "Multi asset allocation funds ranked", href: "/category/multi-asset-allocation" },
      { label: "Gold investment options", href: "/guides/gold-investment-options" },
    ],
  },
  {
    slug: "gold-investment-options",
    title: "Gold Funds, Gold ETFs and Sovereign Gold Bonds",
    description:
      "Three ways to hold gold without the metal. Costs, liquidity, tax and what each suits.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "Gold is usually held as a diversifier — it often moves independently of equity — rather than as a primary growth asset. There are three practical ways to own it in financial form." },
      { t: "h2", text: "Gold ETF" },
      { t: "p", text: "Listed units backed by physical gold, tracking bullion prices closely at a low expense ratio. Requires a demat account, and you transact at market price, so check liquidity and the bid-ask spread." },
      { t: "h2", text: "Gold fund (FoF)" },
      { t: "p", text: "A fund of funds that holds a gold ETF underneath. No demat account needed and SIPs are straightforward, at the cost of a slightly higher total expense ratio than the ETF alone." },
      { t: "h2", text: "Sovereign Gold Bonds" },
      { t: "p", text: "Government-issued bonds tracking the gold price and paying additional interest, with a long maturity and favourable treatment if held to maturity. Availability depends on the government issuing new tranches, and secondary-market liquidity can be thin." },
      { t: "h2", text: "How much to hold" },
      { t: "p", text: "Gold produces no earnings or dividends, so its return relies purely on price. Most allocation frameworks suggest a modest slice — commonly in the 5–15% range — as ballast rather than a core holding." },
    ],
    related: [
      { label: "Gold funds ranked by CAGR", href: "/category/gold" },
      { label: "Silver funds ranked", href: "/category/silver" },
      { label: "Fund of funds explained", href: "/guides/fund-of-funds-explained" },
    ],
  },
  {
    slug: "retirement-and-childrens-funds",
    title: "Retirement and Children's Funds",
    description:
      "Solution-oriented schemes come with a five-year lock-in. What the lock-in buys you, and whether you need one.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "SEBI classifies retirement and children's funds as solution-oriented schemes. Both carry a lock-in of five years, or until retirement or the child reaching majority, whichever comes earlier." },
      { t: "h2", text: "The lock-in is the product" },
      { t: "p", text: "Mechanically these are equity, debt or hybrid funds. What they add is enforced discipline: you cannot redeem during a market panic, which removes the single most damaging behaviour in long-horizon investing." },
      { t: "h2", text: "The trade-off" },
      { t: "ul", items: [
        "You lose flexibility — the money is genuinely inaccessible, including in emergencies.",
        "If the fund underperforms, you cannot switch away until the lock-in ends.",
        "An ordinary flexi cap or hybrid fund can achieve the same allocation with full liquidity.",
      ] },
      { t: "h2", text: "How to decide" },
      { t: "p", text: "If you have historically sold during downturns, the lock-in is genuinely valuable. If you can hold through volatility on your own, a comparable open-ended fund gives the same exposure without surrendering access. Note these funds have no special tax status — normal equity or debt rules apply based on portfolio composition." },
    ],
    related: [
      { label: "Retirement funds ranked", href: "/category/retirement-fund" },
      { label: "Solution oriented funds", href: "/?type=Solution+Oriented" },
    ],
  },

  // ── Costs & taxes ───────────────────────────────────────────────────────────
  {
    slug: "mutual-fund-taxation-india",
    title: "How Mutual Funds Are Taxed in India",
    description:
      "Capital gains rules for equity, debt, gold and hybrid funds — holding periods, current rates and the exemption limit.",
    updated: "2026-08-26",
    topic: "Costs & taxes",
    faqs: [
      {
        q: "How much tax do I pay on equity mutual fund gains?",
        a: "Units held 12 months or less are short-term, taxed at 20%. Units held longer are long-term, taxed at 12.5% on aggregate gains above a ₹1.25 lakh annual exemption. Rates reflect the Finance Act 2024 and were left unchanged by Budget 2026 — always confirm the position for your assessment year.",
      },
      {
        q: "Do debt funds still get indexation benefit?",
        a: "Not for units bought on or after 1 April 2023. Those gains are taxed at your income slab rate regardless of how long you hold. Indexation was removed for such purchases.",
      },
      {
        q: "Is tax deducted automatically when I redeem?",
        a: "For resident investors, capital gains tax is not deducted at source — you must report and pay it yourself. TDS does apply to IDCW payouts above a threshold, and different rules apply to non-residents.",
      },
    ],
    body: [
      { t: "p", text: "Mutual fund tax in India depends on three things: what the scheme holds, how long you held your units, and your residency status. Tax is triggered only when you redeem or switch — not while you stay invested." },
      { t: "h2", text: "Equity-oriented funds" },
      { t: "p", text: "Schemes holding at least 65% in domestic listed equity. Units held 12 months or less produce short-term gains taxed at 20%. Held longer, gains are long-term, taxed at 12.5% on the amount above a ₹1.25 lakh exemption that applies across all your eligible long-term gains in a financial year." },
      { t: "h2", text: "Debt funds" },
      { t: "p", text: "For units purchased on or after 1 April 2023, gains are added to your income and taxed at your slab rate no matter how long you held them — the holding period is irrelevant and indexation no longer applies. Units bought before that date follow the older rules, where gains after 24 months were treated as long-term." },
      { t: "h2", text: "Gold and international funds" },
      { t: "p", text: "Treatment follows the underlying exposure rather than the label, and differs between listed ETFs and fund-of-funds structures. Listed gold ETFs held beyond 12 months are generally treated as long-term at 12.5% without indexation, with shorter holdings taxed at slab rate. Because this area has changed repeatedly, confirm the current position for the specific scheme." },
      { t: "h2", text: "Hybrid funds depend on the mix" },
      { t: "p", text: "A hybrid scheme is taxed on its actual equity and derivative allocation, not its category name. Aggressive hybrid and arbitrage funds usually qualify for equity treatment; conservative hybrid funds usually do not. Check the scheme document." },
      { t: "h2", text: "Two things to remember" },
      { t: "ul", items: [
        "A switch between schemes — including regular to direct — is a redemption and is taxable.",
        "The CAGR figures on this site are net of the expense ratio but before any tax or exit load.",
      ] },
      { t: "p", text: "Tax rules change with each Union Budget, and your own position depends on your income and residency. Treat this as an orientation, not advice, and verify against current rules or a qualified adviser before acting." },
    ],
    sources: [
      { label: "ClearTax — how mutual funds are taxed", url: "https://cleartax.in/s/different-mutual-funds-taxed" },
      { label: "Economic Times — capital gains after Budget 2026", url: "https://m.economictimes.com/wealth/tax/capital-gains-tax-heres-how-budget-2026-taxes-shares-gold-and-mutual-funds-in-fy27/1/slideshow/127853198.cms" },
      { label: "Moneycontrol — mutual fund taxation FY 2026-27", url: "https://www.moneycontrol.com/news/business/personal-finance/how-mutual-funds-are-taxed-for-financial-year-2026-27-what-investors-need-to-know-13832901.html" },
    ],
    related: [
      { label: "Growth vs IDCW option", href: "/guides/growth-vs-idcw-option" },
      { label: "Arbitrage funds and equity taxation", href: "/guides/arbitrage-funds-explained" },
      { label: "ELSS tax-saver funds", href: "/guides/understanding-elss-tax-saver-funds" },
    ],
  },

  // ── Returns & metrics ───────────────────────────────────────────────────────
  {
    slug: "rolling-returns-vs-point-to-point",
    title: "Rolling Returns vs Point-to-Point Returns",
    description:
      "Why a single 5-year CAGR can flatter a fund, and how rolling returns test consistency instead of luck.",
    updated: "2026-08-26",
    topic: "Returns & metrics",
    body: [
      { t: "p", text: "A point-to-point return measures one start date to one end date — the 5-year CAGR on this site is a point-to-point figure. Rolling returns compute that same 5-year CAGR from every possible start date and look at the distribution." },
      { t: "h2", text: "The problem with a single window" },
      { t: "p", text: "Point-to-point returns are hostage to their endpoints. A 5-year figure starting near a market bottom looks superb; the same fund measured from a peak looks poor. Neither says much about the manager." },
      { t: "h2", text: "What rolling returns reveal" },
      { t: "ul", items: [
        "Consistency: how often the fund beat its benchmark or category across many periods.",
        "Range: the best and worst outcomes an investor could have experienced.",
        "Whether strong headline numbers rest on one exceptional stretch.",
      ] },
      { t: "h2", text: "How to use both" },
      { t: "p", text: "Use point-to-point CAGR across several horizons — as shown here for 1, 3, 5 and 10 years — to shortlist quickly. A fund strong at every horizon is less likely to be an endpoint artefact. Then check rolling returns on the fund's factsheet before committing." },
    ],
    related: [
      { label: "What is CAGR?", href: "/guides/what-is-cagr" },
      { label: "Risk metrics explained", href: "/guides/risk-metrics-explained" },
    ],
  },
  {
    slug: "risk-metrics-explained",
    title: "Standard Deviation, Sharpe Ratio and Beta",
    description:
      "The three risk numbers on every factsheet — what each measures and how to read them together with CAGR.",
    updated: "2026-08-26",
    topic: "Returns & metrics",
    faqs: [
      {
        q: "Which single risk metric matters most?",
        a: "None on its own. Standard deviation tells you how bumpy the ride was, Sharpe ratio whether that bumpiness was rewarded, and beta how much of it came from the market. Read all three alongside the fund's category.",
      },
    ],
    body: [
      { t: "p", text: "CAGR tells you what a fund returned. These three numbers tell you what you endured to get it, and they only mean anything when compared against funds in the same category." },
      { t: "h2", text: "Standard deviation" },
      { t: "p", text: "How much returns varied around their average — a direct measure of volatility. Higher means a bumpier ride. A small-cap fund will always show a higher figure than a large-cap fund, which is why cross-category comparison is meaningless." },
      { t: "h2", text: "Sharpe ratio" },
      { t: "p", text: "Return above the risk-free rate, divided by standard deviation — return per unit of risk taken. Higher is better. Between two funds with the same CAGR, the higher Sharpe ratio delivered it with less turbulence." },
      { t: "h2", text: "Beta" },
      { t: "p", text: "Sensitivity to the benchmark. A beta of 1 moves with the index; 1.2 amplifies index moves by roughly 20% in both directions; below 1 suggests a defensive portfolio. Beta explains how much of the volatility is simply market exposure." },
      { t: "h2", text: "One number these miss" },
      { t: "p", text: "Standard deviation treats upside and downside swings identically, though only one of them hurts. Maximum drawdown — the largest peak-to-trough fall — is often the more useful question: can you hold on through that?" },
    ],
    related: [
      { label: "Rolling returns vs point-to-point", href: "/guides/rolling-returns-vs-point-to-point" },
      { label: "Alpha and benchmarks", href: "/guides/alpha-and-benchmarks" },
    ],
  },
  {
    slug: "alpha-and-benchmarks",
    title: "Alpha and Why the Benchmark Matters",
    description:
      "Alpha measures value added over the benchmark — but only if the benchmark is the right one.",
    updated: "2026-08-26",
    topic: "Returns & metrics",
    body: [
      { t: "p", text: "Alpha is the return a fund generated beyond what its benchmark exposure would explain. Positive alpha suggests the manager added value; negative suggests you paid active fees for less than the index delivered." },
      { t: "h2", text: "Compare against the correct index" },
      { t: "p", text: "A mid-cap fund measured against the Nifty 50 will look brilliant in a mid-cap rally and dreadful when large caps lead — and neither reveals anything about skill. SEBI requires funds to disclose a benchmark; check it is genuinely representative of the mandate." },
      { t: "h2", text: "Total Return Index" },
      { t: "p", text: "Funds must now benchmark against the Total Return Index (TRI), which includes dividends reinvested. Older comparisons against a price-only index flattered active funds by roughly the dividend yield each year." },
      { t: "h2", text: "Alpha is not persistent" },
      { t: "p", text: "The uncomfortable finding across markets is that past alpha is a weak predictor of future alpha. Costs, by contrast, persist reliably. That asymmetry is the core argument for indexing, especially in large caps." },
    ],
    related: [
      { label: "Index funds vs active funds", href: "/guides/index-funds-vs-active-funds" },
      { label: "Risk metrics explained", href: "/guides/risk-metrics-explained" },
    ],
  },
  {
    slug: "riskometer-explained",
    title: "Reading the Riskometer",
    description:
      "SEBI's six-level risk label on every scheme — what it captures, how often it updates, and its limits.",
    updated: "2026-08-26",
    topic: "Returns & metrics",
    body: [
      { t: "p", text: "Every mutual fund scheme in India must display a Riskometer with six levels: Low, Low to Moderate, Moderate, Moderately High, High and Very High. It is assigned from the actual portfolio, not the category name." },
      { t: "h2", text: "How the level is derived" },
      { t: "p", text: "For equity portfolios it reflects market capitalisation and volatility. For debt, it combines credit quality, interest-rate risk and liquidity. Schemes must reassess monthly and disclose changes, so the label moves as the portfolio does." },
      { t: "h2", text: "What it is useful for" },
      { t: "ul", items: [
        "A quick sanity check that a scheme matches your risk tolerance.",
        "Spotting drift — a debt fund creeping up the scale is a signal worth investigating.",
        "Comparing risk consistently across AMCs, since the methodology is standardised.",
      ] },
      { t: "h2", text: "Its limits" },
      { t: "p", text: "It is a single backward-looking label. Most equity funds cluster at Very High, so it rarely distinguishes between them, and it says nothing about whether the risk is being rewarded. Use it as a floor check, not a selection tool." },
    ],
    related: [
      { label: "Risk metrics explained", href: "/guides/risk-metrics-explained" },
      { label: "SEBI fund categories", href: "/guides/sebi-fund-categories" },
    ],
  },
  {
    slug: "sebi-fund-categories",
    title: "SEBI's Fund Categories, Explained",
    description:
      "Why every AMC's 'large cap fund' means the same thing, and how the 2017 categorisation rules help you compare.",
    updated: "2026-08-26",
    topic: "Fund types",
    body: [
      { t: "p", text: "Before 2017, two funds with similar names could hold entirely different portfolios. SEBI's categorisation framework fixed that by defining each category and limiting AMCs to one scheme per category in most cases." },
      { t: "h2", text: "The five broad groups" },
      { t: "ul", items: [
        "Equity — large, mid, small, flexi, multi cap, sectoral, ELSS and more.",
        "Debt — sixteen categories arranged mostly by duration and credit profile.",
        "Hybrid — aggressive, conservative, balanced advantage, multi asset, arbitrage.",
        "Solution-oriented — retirement and children's funds, with lock-ins.",
        "Other — index funds, ETFs and fund of funds.",
      ] },
      { t: "h2", text: "Why it matters for comparison" },
      { t: "p", text: "Because the definitions are mandated, a like-for-like comparison inside a category is meaningful: every large-cap fund must hold at least 80% in the top 100 companies. This is why every ranking on this site is most useful read within a category rather than across the whole universe." },
      { t: "h2", text: "Where the labels still mislead" },
      { t: "p", text: "Latitude remains. Flexi cap managers can position very differently from one another, 'thematic' can stretch widely, and hybrid categories permit broad ranges. The category tells you the boundaries, not the strategy inside them." },
    ],
    related: [
      { label: "Browse all categories", href: "/categories" },
      { label: "Large cap vs mid cap vs small cap", href: "/guides/large-mid-small-cap-funds" },
    ],
  },

  // ── Investing practice ──────────────────────────────────────────────────────
  {
    slug: "how-sip-works",
    title: "How a SIP Actually Works",
    description:
      "The mechanics of a Systematic Investment Plan — unit allocation, NAV dates, rupee-cost averaging and what it does not protect against.",
    updated: "2026-08-26",
    topic: "Investing practice",
    faqs: [
      {
        q: "Does a SIP guarantee I won't lose money?",
        a: "No. A SIP spreads out your entry price, which reduces the risk of investing everything at a peak. It does not protect against a market that falls over your whole holding period — the fund can still be down when you need the money.",
      },
      {
        q: "Should I stop my SIP when markets fall?",
        a: "Falling markets are when a SIP does its most useful work, buying more units at lower prices. Stopping then converts the mechanism's main advantage into a loss. Stop only if your circumstances change, not because of market levels.",
      },
    ],
    body: [
      { t: "p", text: "A SIP invests a fixed rupee amount at a fixed interval, usually monthly. On each date the amount is divided by that day's NAV to determine how many units you receive." },
      { t: "h2", text: "Rupee-cost averaging" },
      { t: "p", text: "Because the amount is fixed, a fixed sum buys more units when NAV is low and fewer when it is high. Your average cost per unit therefore ends up below the average NAV over the period — an arithmetic consequence, not a forecast." },
      { t: "h2", text: "Practical details" },
      { t: "ul", items: [
        "Units are allotted at the NAV applicable to the day funds are realised, so bank holidays can shift the date.",
        "The SIP date has negligible long-run impact — consistency matters far more.",
        "Each instalment has its own holding period for exit load and capital gains.",
      ] },
      { t: "h2", text: "Measuring your own return" },
      { t: "p", text: "Because money went in at many different points, your SIP's return is XIRR, not the fund's CAGR. The fund's CAGR still tells you how the portfolio performed — use it to compare funds, and XIRR to track your own outcome." },
    ],
    related: [
      { label: "SIP vs lump sum", href: "/guides/sip-vs-lumpsum" },
      { label: "CAGR vs XIRR", href: "/guides/cagr-vs-xirr-vs-absolute-returns" },
    ],
  },
  {
    slug: "swp-and-stp-explained",
    title: "SWP and STP Explained",
    description:
      "Systematic Withdrawal and Transfer Plans — how to draw an income or stagger a lump sum, and why an SWP usually beats IDCW.",
    updated: "2026-08-26",
    topic: "Investing practice",
    body: [
      { t: "p", text: "If a SIP is systematic investing, an SWP and an STP are its counterparts for taking money out and moving it between schemes." },
      { t: "h2", text: "SWP — Systematic Withdrawal Plan" },
      { t: "p", text: "You redeem a fixed amount at regular intervals, selling just enough units each time. It converts a corpus into a predictable income stream while the remainder stays invested." },
      { t: "h2", text: "Why an SWP usually beats the IDCW option" },
      { t: "p", text: "Both produce regular cash. But an IDCW payout is taxed at your slab rate as income, while an SWP is a redemption — only the gain portion of each withdrawal is taxable, at capital-gains rates. You also control the amount and timing, rather than depending on what the AMC declares." },
      { t: "h2", text: "STP — Systematic Transfer Plan" },
      { t: "p", text: "Moves a fixed amount periodically from one scheme to another, typically from a liquid fund into an equity fund. It is how investors stagger a large lump sum into equity while the waiting money still earns short-term returns." },
      { t: "h2", text: "Watch the tax and load" },
      { t: "p", text: "Every SWP withdrawal and every STP transfer is a redemption, so each can attract exit load and capital gains. Frequent transfers create a long list of small taxable events to track." },
    ],
    related: [
      { label: "Growth vs IDCW option", href: "/guides/growth-vs-idcw-option" },
      { label: "How mutual funds are taxed", href: "/guides/mutual-fund-taxation-india" },
    ],
  },
  {
    slug: "how-many-funds-should-you-own",
    title: "How Many Mutual Funds Should You Own?",
    description:
      "Why most portfolios hold too many funds, how overlap creates fake diversification, and a workable structure.",
    updated: "2026-08-26",
    topic: "Investing practice",
    faqs: [
      {
        q: "Is holding 10 funds safer than holding 4?",
        a: "Usually not. Beyond a handful, additional equity funds tend to hold the same large companies, so you add administrative work and overlap without reducing risk. Genuine diversification comes from different asset classes, not more funds in one category.",
      },
    ],
    body: [
      { t: "p", text: "Most retail portfolios accumulate funds rather than choose them — a new one each time something tops a leaderboard. The result is a dozen schemes holding substantially the same stocks." },
      { t: "h2", text: "Portfolio overlap" },
      { t: "p", text: "Two diversified Indian equity funds routinely share a large share of their holdings, because the pool of liquid large companies is finite. If your four equity funds all own the same top ten stocks, you hold one portfolio with four expense ratios and four sets of paperwork." },
      { t: "h2", text: "A workable structure" },
      { t: "ul", items: [
        "One core equity holding — an index, large cap or flexi cap fund.",
        "Optionally one mid or small cap fund for higher growth potential.",
        "One debt fund matched to your nearest goal's horizon.",
        "Optionally a small satellite allocation to gold or a specific theme.",
      ] },
      { t: "h2", text: "The real cost of too many" },
      { t: "p", text: "Every extra fund is another position to monitor, another set of capital gains to compute, and another temptation to tinker. Fewer, well-chosen funds are easier to hold through a downturn — which is the behaviour that actually determines your outcome." },
    ],
    related: [
      { label: "How to choose a mutual fund", href: "/guides/how-to-choose-a-mutual-fund" },
      { label: "Sectoral and thematic fund risk", href: "/guides/sectoral-and-thematic-funds" },
    ],
  },
  {
    slug: "when-to-exit-a-mutual-fund",
    title: "When to Exit a Mutual Fund",
    description:
      "Good reasons to sell, bad reasons to sell, and how to tell underperformance from a style that is temporarily out of favour.",
    updated: "2026-08-26",
    topic: "Investing practice",
    body: [
      { t: "p", text: "Selling well is harder than buying well. Most exits are triggered by a bad quarter, which is usually the least informative signal available." },
      { t: "h2", text: "Reasonable grounds to exit" },
      { t: "ul", items: [
        "Your goal has arrived, or your asset allocation needs rebalancing.",
        "Persistent underperformance against category peers over three years or more.",
        "The mandate has changed — a strategy drift away from what you bought.",
        "The scheme has grown too large for its stated segment.",
      ] },
      { t: "h2", text: "Poor grounds to exit" },
      { t: "ul", items: [
        "One or two weak quarters.",
        "Another fund has recently topped a ranking table.",
        "Markets are falling and you feel uncomfortable.",
      ] },
      { t: "h2", text: "Distinguish underperformance from style" },
      { t: "p", text: "A value fund lagging during a growth-led rally is doing what it was built to do. Compare against the right peer group and benchmark before concluding the manager has failed. Judge over a full cycle, not a phase of one." },
      { t: "h2", text: "Count the exit costs" },
      { t: "p", text: "Redeeming triggers capital gains and possibly an exit load, and reinvesting restarts holding-period clocks. A switch needs to be clearly worth those frictions, not marginally better on paper." },
    ],
    related: [
      { label: "Exit load explained", href: "/guides/exit-load-explained" },
      { label: "How mutual funds are taxed", href: "/guides/mutual-fund-taxation-india" },
      { label: "Rolling returns vs point-to-point", href: "/guides/rolling-returns-vs-point-to-point" },
    ],
  },
  {
    slug: "how-to-start-investing",
    title: "How to Start Investing in Mutual Funds",
    description:
      "KYC, the accounts you need, direct versus platform routes, and a sensible first fund.",
    updated: "2026-08-26",
    topic: "Investing practice",
    body: [
      { t: "p", text: "The mechanics of starting are straightforward and mostly one-time. The decisions that matter are made before you invest a rupee." },
      { t: "h2", text: "1. Complete KYC" },
      { t: "p", text: "Mutual fund KYC is centralised, so once completed with any registered intermediary it applies across all AMCs. It needs identity and address proof, PAN and a bank account in your name. Most platforms complete it digitally." },
      { t: "h2", text: "2. Choose your route" },
      { t: "ul", items: [
        "Direct from the AMC's own website — direct plan, no commission, one login per AMC.",
        "A direct-plan platform — direct plans across AMCs in one place.",
        "A distributor or bank — convenient and advised, but a regular plan with commission built in.",
      ] },
      { t: "h2", text: "3. Decide before you pick a fund" },
      { t: "p", text: "Settle the horizon and the asset class first. Money needed within three years belongs in debt; long-horizon money can take equity risk. The specific fund matters far less than getting this split right." },
      { t: "h2", text: "4. A reasonable first holding" },
      { t: "p", text: "For a long-horizon first investment, a broad index fund or a large-cap or flexi-cap fund is a defensible starting point: diversified, comparatively low cost, and not dependent on one sector. Start with a SIP you can sustain, and add complexity only once you have lived through a market fall." },
    ],
    related: [
      { label: "Direct vs regular plans", href: "/guides/direct-vs-regular-plans" },
      { label: "How to choose a mutual fund", href: "/guides/how-to-choose-a-mutual-fund" },
      { label: "How a SIP works", href: "/guides/how-sip-works" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** All topics that currently have at least one guide, in display order. */
export const GUIDE_TOPICS: GuideTopic[] = [
  "Returns & metrics",
  "Fund types",
  "Costs & taxes",
  "Investing practice",
];
