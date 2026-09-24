import type { BlogFaq } from '@/lib/blog';

interface PageFaqProps {
  faqs: BlogFaq[];
  pageUrl: string;
  heading?: string;
  intro?: string;
  /** Set false when the page already emits its own FAQPage JSON-LD. */
  withJsonLd?: boolean;
}

/**
 * Visible Q&A section with FAQPage JSON-LD.
 * Used on pages that need a question-and-answer format for readers
 * and for generative/AI search engines.
 */
export function PageFaq({ faqs, pageUrl, heading = 'Questions & answers', intro, withJsonLd = true }: PageFaqProps) {
  if (!faqs.length) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section aria-label={heading} className="mt-12">
      {withJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {heading}
      </h2>
      {intro && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{intro}</p>
      )}
      <div className="mt-5 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:hidden dark:text-white [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                {f.q}
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-lg leading-none text-red-600 transition-transform group-open:rotate-45 dark:text-red-400"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
