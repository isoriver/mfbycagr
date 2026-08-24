# MutualFundsByCAGR

Indian mutual funds ranked by CAGR — a fast, SEO-first Next.js site.
Every scheme gets its own page; funds are ranked by compounded annual growth (1Y/3Y/5Y/10Y)
across categories and fund houses, plus comparison and guide content.

Data is sourced from the free public [MFapi.in](https://www.mfapi.in) NAV API.
**Informational only — not investment advice.**

## Stack

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel** with ISR.
- **Two-tier data model:**
  - A precomputed summary (`src/data/funds-summary.json`) powers all aggregate pages
    (homepage, rankings, categories, fund houses, search) so rankings are accurate across the
    *entire* universe. Regenerated daily by a GitHub Action.
  - Individual fund pages use on-demand ISR, fetching that scheme's live NAV history from MFapi
    at render time (revalidated daily).

## Local development

```bash
npm install
npm run test:returns   # CAGR/returns + slug + dataset unit tests (no network needed)
npm run dev            # http://localhost:3000 — runs on the committed sample dataset
```

The repo ships with `src/data/funds-summary.sample.json` (~20 funds) so the site renders
immediately without generating the full dataset.

## Generating the full dataset

```bash
npm run build:data     # fetches the full universe (~15k schemes) from MFapi.in
```

This writes `src/data/funds-summary.json` (used automatically in preference to the sample).
It is **resumable** — progress is checkpointed to `scripts/.cache/`, so re-running after a
rate-limit or crash skips already-computed schemes. Tunables via env:

- `MF_CONCURRENCY` (default `8`) — parallel requests.
- `MF_LIMIT` — cap the number of schemes (handy for a quick test run, e.g. `MF_LIMIT=300`).

## Production build

```bash
npm run build && npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into Vercel (framework auto-detected as Next.js).
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://mutualfundsbycagr.com`).
4. The included GitHub Action (`.github/workflows/refresh-data.yml`) regenerates the dataset
   daily and commits it, which triggers a Vercel production rebuild so CAGR figures stay fresh.

## Route map

| Route | Purpose |
|---|---|
| `/` | Homepage: top funds, category cards, search |
| `/funds/[schemeCode]` | Individual fund: NAV chart, all returns, similar funds |
| `/rankings/[period]` | `1y` / `3y` / `5y` / `10y` — top funds by CAGR, paginated |
| `/category/[slug]` | Best funds in a category, sortable by period |
| `/amc/[slug]` | All schemes from a fund house |
| `/compare/[a]-vs-[b]` | Two funds side by side |
| `/guides/[slug]` | Educational articles (CAGR, choosing funds, ELSS, SIP…) |
| `/sitemap.xml`, `/robots.txt` | Sharded sitemaps + robots |

## SEO features

- Unique title/description/canonical + OpenGraph/Twitter per page.
- JSON-LD: `WebSite` + SearchAction, `FinancialProduct`, `ItemList`, `BreadcrumbList`,
  `Article`, `FAQPage`.
- Sharded XML sitemaps covering every fund, category, AMC and guide.
- Internal linking between funds, categories, AMCs and comparisons.

## Project layout

```
src/
  app/            # App Router pages, sitemap, robots, api/search
  components/     # Header, Footer, FundTable, ReturnPill, Sparkline, NavChart, SearchBox…
  content/        # guides.ts (typed guide content)
  data/           # funds-summary.json (generated) + .sample.json (committed)
  lib/            # returns (CAGR math), mfapi, dataset, slug, seo, fund, format
scripts/
  build-dataset.ts  # daily data pipeline
tests/            # node --test unit tests (returns, slug, dataset)
.github/workflows/refresh-data.yml
```
