import Link from "next/link";

interface CategoryChip {
  slug: string;
  name: string;
  count: number;
}

/**
 * A collapsed list of category links.
 *
 * Implemented as a native <details> rather than React state so this stays a server
 * component: every link is present in the initial HTML even while collapsed, so crawlers
 * (and no-JS users) still see them. That keeps the homepage's internal links to the
 * category pages intact while costing only a single line of visual space.
 */
export function CategoryCloud({
  label,
  categories,
  allHref,
  allLabel,
}: {
  label: string;
  categories: CategoryChip[];
  /** Optional trailing link to the full category index. */
  allHref?: string;
  allLabel?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <details className="group mt-2">
      <summary className="inline-flex items-center gap-1.5 text-[12px] text-dim transition-colors hover:text-ink">
        <span
          className="inline-block text-[9px] transition-transform group-open:rotate-90"
          aria-hidden="true"
        >
          ▶
        </span>
        {label}
      </summary>
      <ul className="mt-2 flex flex-wrap items-center gap-1.5">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="inline-block rounded-full border border-border px-3 py-1 text-[11.5px] text-dim transition-colors hover:border-accent hover:bg-accent/5 hover:text-ink"
            >
              {c.name}
              <span className="ml-1 text-[10.5px] text-faint">{c.count}</span>
            </Link>
          </li>
        ))}
        {allHref && (
          <li>
            <Link
              href={allHref}
              className="inline-block rounded-full border border-ink px-3 py-1 text-[11.5px] font-medium text-ink"
            >
              {allLabel} →
            </Link>
          </li>
        )}
      </ul>
    </details>
  );
}
