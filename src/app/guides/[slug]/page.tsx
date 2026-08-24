import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GUIDES, getGuide, type Block } from "@/content/guides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd, absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  return pageMetadata({
    title: g.title,
    description: g.description,
    path: `/guides/${g.slug}`,
    type: "article",
  });
}

function renderBlock(b: Block, i: number) {
  if (b.t === "h2") return <h2 key={i}>{b.text}</h2>;
  if (b.t === "p") return <p key={i}>{b.text}</p>;
  return (
    <ul key={i}>
      {b.items.map((it, j) => (
        <li key={j}>{it}</li>
      ))}
    </ul>
  );
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: g.title, path: `/guides/${g.slug}` },
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(`/guides/${g.slug}`),
  };

  return (
    <>
      <StructuredData
        data={[breadcrumbJsonLd(crumbs), articleLd, ...(g.faqs ? [faqJsonLd(g.faqs)] : [])]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <article className="prose mx-auto max-w-3xl px-5 pb-12 pt-2">
        <h1 className="text-[26px] font-bold leading-tight">{g.title}</h1>
        <p className="mt-2 text-[13px] text-faint">
          Updated {new Date(g.updated).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <div className="mt-4">{g.body.map(renderBlock)}</div>

        {g.faqs && g.faqs.length > 0 && (
          <section className="mt-10">
            <h2>Frequently asked questions</h2>
            {g.faqs.map((f, i) => (
              <div key={i} className="mt-4">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        )}
      </article>
    </>
  );
}
