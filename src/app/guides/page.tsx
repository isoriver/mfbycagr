import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, GUIDE_TOPICS } from "@/content/guides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mutual Fund Guides",
  description:
    "Plain-English guides to Indian mutual funds — CAGR and NAV, direct vs regular plans, expense ratios, taxation, SIPs, fund categories and how to choose a fund.",
  path: "/guides",
});

export default function GuidesPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ];

  // Grouped by topic — a flat list of ~30 cards is hard to scan.
  const byTopic = GUIDE_TOPICS.map((topic) => ({
    topic,
    guides: GUIDES.filter((g) => g.topic === topic),
  })).filter((t) => t.guides.length > 0);

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Indian mutual fund guides",
    numberOfItems: GUIDES.length,
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.title,
      url: absoluteUrl(`/guides/${g.slug}`),
    })),
  };

  return (
    <>
      <StructuredData data={[breadcrumbJsonLd(crumbs), listLd]} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mx-auto max-w-content px-4 pb-10 pt-2 sm:px-5">
        <h1 className="text-[24px] font-bold">Mutual Fund Guides</h1>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-dim">
          {GUIDES.length} plain-English explainers on how Indian mutual funds actually work — how
          returns are measured, what each fund category does, what you pay, and how the tax rules
          apply. No jargon, no product pitches.
        </p>

        {/* Jump links so the topics are reachable without scrolling the whole page */}
        <nav aria-label="Guide topics" className="mt-4 flex flex-wrap gap-1.5">
          {byTopic.map(({ topic, guides }) => (
            <a
              key={topic}
              href={`#${topic.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}
              className="rounded-full border border-border px-3 py-1 text-[12px] text-dim transition-colors hover:border-accent hover:text-ink"
            >
              {topic}
              <span className="ml-1 text-[10.5px] text-faint">{guides.length}</span>
            </a>
          ))}
        </nav>

        {byTopic.map(({ topic, guides }) => (
          <section
            key={topic}
            id={topic.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}
            className="mt-8 scroll-mt-24"
          >
            <h2 className="mb-3 text-[16px] font-semibold">{topic}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="block h-full rounded-lg border border-border p-4 transition-colors hover:border-accent"
                  >
                    <div className="text-[14.5px] font-semibold text-ink">{g.title}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{g.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
