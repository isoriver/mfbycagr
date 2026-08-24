import type { Metadata } from "next";
import type { FundSummary } from "./types";

export const SITE_NAME = "MutualFundsByCAGR";
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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
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
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
      url: absoluteUrl(`/funds/${f.code}`),
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
    url: absoluteUrl(`/funds/${f.code}`),
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
