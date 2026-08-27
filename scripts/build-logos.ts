/**
 * Fetches fund-house logos from a logo API into public/logos/amc/<slug>.<ext>, keyed by the
 * slug→domain map in scripts/amc-domains.ts. The HouseLogo component then serves them,
 * falling back to the initials avatar for any house without a saved logo.
 *
 * Provider: Logo.dev (https://logo.dev) by default — set a free publishable token as
 * LOGO_DEV_TOKEN. To use Brandfetch instead, set LOGO_URL_TEMPLATE, e.g.
 *   LOGO_URL_TEMPLATE="https://cdn.brandfetch.io/{domain}/w/128/h/128?c=YOUR_CLIENT_ID"
 * ({domain} is substituted per house).
 *
 * Run: LOGO_DEV_TOKEN=xxx npm run build:logos
 *
 * This is a manual/occasional step (logos rarely change) — it is intentionally NOT part of
 * the daily data refresh. Commit the resulting image files.
 */
import fs from "node:fs";
import path from "node:path";
import { getHouses } from "../src/lib/dataset.ts";
import { AMC_DOMAINS } from "./amc-domains.ts";

const OUT = path.join(process.cwd(), "public", "logos", "amc");
const TOKEN = process.env.LOGO_DEV_TOKEN;
const TEMPLATE = process.env.LOGO_URL_TEMPLATE; // optional override (e.g. Brandfetch)
const SIZE = 128;
const MIN_BYTES = 512; // guard against empty/placeholder responses

function logoUrl(domain: string): string {
  if (TEMPLATE) return TEMPLATE.replace(/\{domain\}/g, domain);
  return `https://img.logo.dev/${domain}?token=${TOKEN}&size=${SIZE}&format=png&retina=true`;
}

function extFor(contentType: string): string {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "png";
}

async function main() {
  if (!TOKEN && !TEMPLATE) {
    console.error(
      "No logo source configured. Set LOGO_DEV_TOKEN (free at https://logo.dev) or " +
        "LOGO_URL_TEMPLATE for another provider. Nothing fetched.",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const houses = getHouses();
  let saved = 0;
  let noDomain = 0;
  let failed = 0;

  for (const h of houses) {
    const domain = AMC_DOMAINS[h.slug];
    if (!domain) {
      noDomain++;
      continue;
    }
    try {
      const res = await fetch(logoUrl(domain));
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.startsWith("image/")) {
        failed++;
        console.warn(`  ✗ ${h.slug} (${domain}) → ${res.status} ${ct || "no content-type"}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) {
        failed++;
        console.warn(`  ✗ ${h.slug} (${domain}) → response too small (${buf.length}b), likely a placeholder`);
        continue;
      }
      // Remove any stale variant of this slug before writing the fresh one.
      for (const ext of ["svg", "webp", "png", "jpg", "jpeg"]) {
        const p = path.join(OUT, `${h.slug}.${ext}`);
        if (fs.existsSync(p)) fs.rmSync(p);
      }
      const ext = extFor(ct);
      fs.writeFileSync(path.join(OUT, `${h.slug}.${ext}`), buf);
      saved++;
      console.log(`  ✓ ${h.slug}.${ext}  (${domain}, ${(buf.length / 1024).toFixed(1)}kb)`);
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${h.slug} (${domain}) → ${(e as Error).message}`);
    }
  }

  console.log(
    `\n[build-logos] saved=${saved}  no-domain=${noDomain}  failed=${failed}  (of ${houses.length} houses)\n` +
      "Review the saved logos in public/logos/amc/, then commit them.",
  );
}

main().catch((e) => {
  console.error("[build-logos] failed:", e);
  process.exit(1);
});
