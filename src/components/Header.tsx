import Link from "next/link";
import { SearchBox } from "./SearchBox";

const NAV = [
  { href: "/rankings/5y", label: "Rankings" },
  { href: "/categories", label: "Categories" },
  { href: "/amcs", label: "Fund Houses" },
  { href: "/compare", label: "Compare" },
  { href: "/guides", label: "Guides" },
];

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-4 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-bold text-ink">
          <span className="flex h-4 items-end gap-px" aria-hidden="true">
            <span className="inline-block w-1 bg-accent" style={{ height: "40%" }} />
            <span className="inline-block w-1 bg-accent" style={{ height: "70%" }} />
            <span className="inline-block w-1 bg-accent" style={{ height: "100%" }} />
          </span>
          MutualFundsByCAGR
        </Link>
        <nav className="hidden items-center gap-4 text-[13px] text-dim md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto w-full md:w-auto md:min-w-[280px]">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
