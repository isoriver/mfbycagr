import Link from "next/link";

export function Footer({ generatedAt }: { generatedAt?: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-content px-5 py-8 text-[12px] text-faint">
        <nav aria-label="Footer" className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/rankings" className="hover:text-ink">All rankings</Link>
          <Link href="/rankings/1y" className="hover:text-ink">Top by 1Y</Link>
          <Link href="/rankings/3y" className="hover:text-ink">Top by 3Y</Link>
          <Link href="/rankings/5y" className="hover:text-ink">Top by 5Y</Link>
          <Link href="/rankings/10y" className="hover:text-ink">Top by 10Y</Link>
          <Link href="/categories" className="hover:text-ink">All categories</Link>
          <Link href="/amcs" className="hover:text-ink">All fund houses</Link>
          <Link href="/compare" className="hover:text-ink">Compare funds</Link>
          <Link href="/guides" className="hover:text-ink">Guides</Link>
        </nav>
        <p className="leading-relaxed">
          Data sourced from{" "}
          <a href="https://www.mfapi.in" target="_blank" rel="noopener" className="text-link underline">
            MFapi.in
          </a>
          , a free public API for Indian mutual fund NAVs. CAGR figures are computed from growth-plan
          NAV history (dividends and exit loads not included) and are for informational purposes only —
          <strong> this is not investment advice</strong>. Past performance does not guarantee future
          returns. Verify all figures with the fund&apos;s official documents before investing.
          {generatedAt && (
            <>
              {" "}
              Data last refreshed: {new Date(generatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.
            </>
          )}
        </p>
        <p className="mt-3">© {new Date().getFullYear()} MutualFundsByCAGR. All rights reserved.</p>
      </div>
    </footer>
  );
}
