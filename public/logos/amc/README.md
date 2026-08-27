# Fund-house (AMC) logos

Drop a logo here to replace the generated initials avatar for that fund house across the
site (fund tables, fund pages, the AMC list and each AMC page).

## Naming

    public/logos/amc/<houseSlug>.<ext>

- `<houseSlug>` is the slug used in the `/amc/<slug>` URL — e.g. `hdfc`, `sbi`,
  `icici-prudential`, `nippon-india`, `quant`, `aditya-birla-sun-life`.
  Find a house's slug by opening its page: the URL is `/amc/<slug>`.
- `<ext>` may be `svg` (preferred), `webp`, `png`, `jpg`. If more than one exists for a
  slug, the highest-priority extension wins (svg > webp > png > jpg).

Examples:

    public/logos/amc/hdfc.svg
    public/logos/amc/sbi.png
    public/logos/amc/icici-prudential.svg

## Automated fetch (optional)

Instead of adding files by hand, you can fetch logos from a logo API:

1. Get a free publishable token at https://logo.dev and set `LOGO_DEV_TOKEN` in `.env`.
2. Check/extend the slug→domain map in `scripts/amc-domains.ts`.
3. Run `npm run build:logos` — it writes `<slug>.png/svg` here for each mapped house.
4. Review the results and commit the image files.

(To use Brandfetch instead of Logo.dev, set `LOGO_URL_TEMPLATE` — see `.env.example`.)

## Behaviour

- Any house **without** a file here keeps its coloured-initials avatar — so partial
  coverage is fine and the UI never shows a broken image.
- Files are square-ish and rendered inside a white circle with `object-contain`, so
  transparent SVG/PNG on any shape works best.

## Note

AMC logos are trademarks of their respective fund houses. They are used here only to
identify each house's own funds (nominative use), as is standard on fund aggregators.
