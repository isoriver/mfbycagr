import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-20 text-center sm:px-5">
      <h1 className="text-[28px] font-bold">Page not found</h1>
      <p className="mx-auto mt-3 max-w-xl text-[14px] text-dim">
        We couldn&apos;t find that fund or page. It may have been delisted, or the URL is incorrect.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-[13px]">
        <Link href="/" className="rounded-md border border-ink bg-ink px-4 py-2 text-white">
          Go home
        </Link>
        <Link
          href="/rankings"
          className="rounded-md border border-border px-4 py-2 text-dim hover:text-ink"
        >
          Browse rankings
        </Link>
        <Link
          href="/categories"
          className="rounded-md border border-border px-4 py-2 text-dim hover:text-ink"
        >
          All categories
        </Link>
        <Link
          href="/amcs"
          className="rounded-md border border-border px-4 py-2 text-dim hover:text-ink"
        >
          Fund houses
        </Link>
      </div>
    </div>
  );
}
