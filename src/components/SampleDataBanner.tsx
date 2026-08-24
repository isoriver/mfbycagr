import Link from "next/link";

/**
 * Shown only while the site is running on the committed sample dataset
 * (i.e. `npm run build:data` hasn't produced src/data/funds-summary.json yet).
 * Aggregate tables show placeholder numbers until then; individual fund pages
 * still fetch live data. Renders nothing in production once real data exists.
 */
export function SampleDataBanner({ source }: { source: string }) {
  if (!source.toLowerCase().startsWith("sample")) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-[12.5px] text-amber-900">
      Showing <strong>placeholder sample data</strong> in listing tables — run{" "}
      <code className="rounded bg-amber-100 px-1 py-0.5">npm run build:data</code> to load live NAV/CAGR
      for every fund.{" "}
      <Link href="/guides/what-is-cagr" className="underline">
        Why the fund pages already look correct →
      </Link>
    </div>
  );
}
