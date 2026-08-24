import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-5 py-20 text-center">
      <h1 className="text-[28px] font-bold">Page not found</h1>
      <p className="mt-3 text-[14px] text-dim">
        We couldn&apos;t find that fund or page. It may have been delisted or the URL is incorrect.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-[13px]">
        <Link href="/" className="rounded-md border border-ink bg-ink px-4 py-2 text-white">
          Go home
        </Link>
        <Link href="/rankings/5y" className="rounded-md border border-border px-4 py-2 text-dim hover:text-ink">
          Browse rankings
        </Link>
      </div>
    </div>
  );
}
