import fs from "node:fs";
import path from "node:path";

/**
 * Resolves a fund-house logo to a public asset path, if one has been added.
 *
 * Convention: drop a file at `public/logos/amc/<houseSlug>.<ext>` (svg preferred, then
 * webp/png). The <houseSlug> is the same slug used in /amc/<slug> URLs — e.g. `hdfc.svg`,
 * `sbi.svg`, `icici-prudential.svg`, `quant.svg`. The directory is read once per process.
 *
 * Kept under /logos/amc (not /amc) so a logo file can never shadow the /amc/[slug] route.
 * When no logo exists for a house, callers fall back to the generated initials avatar, so
 * the UI is complete with zero logos and improves incrementally as files are added.
 */
const DIR = path.join(process.cwd(), "public", "logos", "amc");
const EXT_PRIORITY = ["svg", "webp", "png", "jpg", "jpeg"];

let index: Map<string, string> | null = null;

function buildIndex(): Map<string, string> {
  const map = new Map<string, string>();
  let files: string[] = [];
  try {
    files = fs.readdirSync(DIR);
  } catch {
    return map; // directory not created yet — no logos
  }
  for (const file of files) {
    const ext = path.extname(file).slice(1).toLowerCase();
    if (!EXT_PRIORITY.includes(ext)) continue;
    const slug = path.basename(file, path.extname(file)).toLowerCase();
    const held = map.get(slug);
    // Prefer the higher-priority extension when a slug has more than one file.
    if (!held || EXT_PRIORITY.indexOf(ext) < EXT_PRIORITY.indexOf(path.extname(held).slice(1).toLowerCase())) {
      map.set(slug, file);
    }
  }
  return map;
}

/** Public path to a house's logo (e.g. "/logos/amc/hdfc.svg"), or null if none exists. */
export function houseLogoSrc(houseSlug: string): string | null {
  if (!index) index = buildIndex();
  const file = index.get(houseSlug.toLowerCase());
  return file ? `/logos/amc/${file}` : null;
}
