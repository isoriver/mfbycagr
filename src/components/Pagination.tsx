import Link from "next/link";

/** Server-rendered pagination. `basePath` gets `?page=N` (or `/page/N` style via buildHref). */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const btn =
    "rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-dim hover:border-accent hover:text-ink";
  const active = "rounded-md border border-ink bg-ink px-3 py-1.5 text-[12.5px] text-white";

  const out: React.ReactNode[] = [];
  let last = 0;
  for (const p of list) {
    if (last && p - last > 1) {
      out.push(
        <span key={`e${p}`} className="px-1 text-faint">
          …
        </span>,
      );
    }
    out.push(
      <Link key={p} href={buildHref(p)} className={p === page ? active : btn} aria-current={p === page ? "page" : undefined}>
        {p}
      </Link>,
    );
    last = p;
  }

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 py-6">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={btn}>
          ← Prev
        </Link>
      )}
      {out}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className={btn}>
          Next →
        </Link>
      )}
    </nav>
  );
}
