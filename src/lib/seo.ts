import type { Metadata } from "next";
import type { FundSummary } from "./types";
import { slugify } from "./slug";

export const SITE_NAME = "MutualFundsByCAGR";

/**
 * Canonical, SEO-friendly path for a fund: /funds/<code>/<name-slug>.
 * The scheme code stays first so the page can always resolve the fund even if the
 * name slug is stale; the slug segment carries the keywords for search engines.
 */
export function fundPath(f: Pick<FundSummary, "code" | "name">): string {
  const slug = slugify(f.name);
  return slug ? `/funds/${f.code}/${slug}` : `/funds/${f.code}`;
}
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mutualfundsbycagr.com").replace(/\/$/, "");
export const SITE_TAGLINE = "Indian Mutual Funds Ranked by CAGR";

export function absoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}

// Default social card (the site-wide next/og route). Referenced explicitly here because a
// page-level `openGraph` object otherwise suppresses the auto-merged opengraph-image file.
const OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

/**
 * Metadata for a paginated listing page (category / AMC / rankings / home).
 *
 * Two rules, both aimed at spending crawl budget on real content:
 *  1. Paginated pages **self-canonicalise** (`?page=3` canonicals to itself, not to page 1).
 *     Canonicalising deep pages to page 1 tells Google they are duplicates, which drops
 *     their rows from the index and devalues the fund links they carry.
 *  2. Sort/filter permutations are **noindex, follow** — they are alternate orderings of
 *     content that already has a canonical home, so they must not compete for it, but
 *     their links should still be traversed.
 */
export function listPageMetadata({
  title,
  description,
  path,
  page = 1,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  page?: number;
  noindex?: boolean;
}): Metadata {
  const canonicalPath = page > 1 ? `${path}${path.includes("?") ? "&" : "?"}page=${page}` : path;
  const pagedTitle = page > 1 ? `${title} — Page ${page}` : title;
  const base = pageMetadata({ title: pagedTitle, description, path: canonicalPath });
  if (!noindex) return base;
  return { ...base, robots: { index: false, follow: true } };
}

export function pageMetadata({ title, description, path, type = "website" }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** JSON-LD: WebSite with SearchAction (sitelinks search box). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** JSON-LD: the publishing Organization (name, logo) for brand/knowledge-panel signals. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.png"),
      width: 256,
      height: 256,
    },
    description: SITE_TAGLINE,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** JSON-LD: an ordered list of funds (rankings / category pages). */
export function itemListJsonLd(name: string, funds: FundSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: funds.length,
    itemListElement: funds.slice(0, 50).map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.name,
      url: absoluteUrl(fundPath(f)),
    })),
  };
}

/** JSON-LD: a single fund as a FinancialProduct. */
export function fundJsonLd(f: FundSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: f.name,
    category: f.category,
    url: absoluteUrl(fundPath(f)),
    provider: { "@type": "Organization", name: `${f.house} Mutual Fund` },
    ...(f.nav != null && {
      offers: { "@type": "Offer", price: f.nav, priceCurrency: "INR" },
    }),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
