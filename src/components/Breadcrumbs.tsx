import Link from "next/link";
import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-content px-5 py-3 text-[12.5px] text-dim">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span className="text-ink" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="text-link hover:underline">
                  {c.name}
                </Link>
              )}
              {!last && <span className="text-faint">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
