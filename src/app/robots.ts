import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /search is intentionally *not* disallowed: the page already sends
      // `noindex, follow`, and a Disallow would stop crawlers fetching it — so they'd
      // never see that tag, and could still index the bare URL from a link. It would
      // also block the sitelinks SearchAction target declared in our WebSite JSON-LD.
      // Only the JSON API is blocked, since it has no crawlable value.
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
