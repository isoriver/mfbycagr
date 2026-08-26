import Link from "next/link";
import Image from "next/image";
import { SearchBox } from "./SearchBox";

const NAV = [
  { href: "/categories", label: "Categories" },
  { href: "/amcs", label: "Fund Houses" },
  { href: "/compare", label: "Compare" },
  { href: "/guides", label: "Guides" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto max-w-content px-4 sm:px-5">
        {/* Top row: logo, desktop nav, desktop search, mobile menu toggle */}
        <div className="flex items-center gap-3 py-2.5">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-[15px] font-bold text-ink">
            <Image
              src="/brand-icon.png"
              alt="MutualFundsByCAGR logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <span className="whitespace-nowrap">MutualFundsByCAGR</span>
          </Link>

          <nav aria-label="Main" className="ml-4 hidden items-center gap-4 text-[13px] text-dim md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden md:block md:w-[300px]">
            <SearchBox />
          </div>

          {/* Mobile menu — native <details> disclosure, no client JS */}
          <details className="relative ml-auto md:hidden">
            <summary
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-lg"
            >
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block px-4 py-2.5 text-[14px] text-dim hover:bg-panel hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>

        {/* Mobile search — full width below the top row */}
        <div className="pb-2.5 md:hidden">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
