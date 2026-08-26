import type { Faq } from "@/content/listingCopy";

/** Intro paragraphs shown under a listing page's H1. */
export function ListingIntro({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {paragraphs.map((p, i) => (
        <p key={i} className="max-w-3xl text-[13.5px] leading-relaxed text-dim">
          {p}
        </p>
      ))}
    </div>
  );
}

/**
 * Visible FAQ block for listing pages. Rendered as real HTML (not just JSON-LD) so the
 * answers are indexable content and useful to readers, and marked up with <details> so it
 * stays compact without needing client JS.
 */
export function ListingFaq({ faqs, heading }: { faqs: Faq[]; heading: string }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mx-auto max-w-content px-4 pb-10 sm:px-5" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-3 text-[16px] font-semibold">
        {heading}
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {faqs.map((f, i) => (
          <details key={i} className="group px-4 py-3" open={i === 0}>
            <summary className="flex items-center justify-between gap-3 text-[13.5px] font-medium text-ink">
              {f.q}
              <span
                className="shrink-0 text-[11px] text-faint transition-transform group-open:rotate-45"
                aria-hidden="true"
              >
                ✚
              </span>
            </summary>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-dim">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
