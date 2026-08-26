import type { MetadataRoute } from "next";
import { getAllFunds, getCategories, getHouses, PERIOD_SLUGS } from "@/lib/dataset";
import { getComparePairs } from "@/lib/compare";
import { GUIDES } from "@/content/guides";
import { SITE_URL, fundPath } from "@/lib/seo";

const FUNDS_PER_SITEMAP = 5000;

/** Shard the sitemap: id 0 = static + category/amc/guide URLs, id 1..n = fund pages. */
export async function generateSitemaps() {
  const fundShards = Math.ceil(getAllFunds().length / FUNDS_PER_SITEMAP);
  return Array.from({ length: fundShards + 1 }, (_, id) => ({ id }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const now = new Date();

  if (id === 0) {
    const staticUrls: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
      { url: `${SITE_URL}/rankings`, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE_URL}/amcs`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE_URL}/compare`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
    ];
    const rankings = Object.keys(PERIOD_SLUGS).map((slug) => ({
      url: `${SITE_URL}/rankings/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
    const categories = getCategories().map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
    const houses = getHouses().map((h) => ({
      url: `${SITE_URL}/amc/${h.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    const guides = GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: g.updated,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    // Prerendered head-to-head comparisons — previously absent from the sitemap entirely.
    const compares = getComparePairs().map((p) => ({
      url: `${SITE_URL}/compare/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
    return [...staticUrls, ...rankings, ...categories, ...houses, ...guides, ...compares];
  }

  const start = (id - 1) * FUNDS_PER_SITEMAP;
  return getAllFunds()
    .slice(start, start + FUNDS_PER_SITEMAP)
    .map((f) => ({
      url: `${SITE_URL}${fundPath(f)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }));
}
