import Link from 'next/link';
import { PREVIEW_TOOLS, categoryById } from '@/components/ui-preview/data';
import { TOOLS_CONFIG } from '@/lib/tools-config';

/**
 * Homepage-only SEO section: complete tool index + FAQ.
 * Server-rendered crawlable copy that preserves the old homepage's
 * internal linking and keyword coverage inside the new red design.
 */

type IndexEntry = {
  name: string;
  href: string;
  blurb: string;
  group: string;
};

const UTILITY_SLUGS = new Set([
  'image-compressor',
  'color-extractor',
  'qr-generator',
  'invoice-generator',
  'tax-calculator',
  'text-analyzer',
  'password-generator',
]);

const GROUP_LABELS: Record<string, string> = {
  Image: 'Image tools',
  Finance: 'Business tools',
  Text: 'Writing tools',
  Security: 'Security tools',
};

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = PREVIEW_TOOLS.map((t) => ({
    name: t.name,
    href: t.href,
    blurb: t.tagline,
    group: categoryById(t.category).label,
  }));

  for (const tool of TOOLS_CONFIG) {
    if (UTILITY_SLUGS.has(tool.slug)) {
      entries.push({
        name: tool.name,
        href: `/tools/${tool.slug}`,
        blurb: tool.description,
        group: GROUP_LABELS[tool.category] ?? tool.category,
      });
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is PDFEdit really free?',
    a: 'Yes. The everyday PDF tools — merge, split, compress, convert, sign and more — are free to use with no account and no trial walls.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'Supported tools process files directly in your browser whenever technically possible, so your documents stay on your device instead of being shipped to a server farm.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. PDFEdit runs entirely in your web browser on desktop, tablet and mobile. Open a tool and start working immediately.',
  },
  {
    q: 'Which formats can I convert to and from PDF?',
    a: 'Convert PDFs to Word documents, JPG or PNG images and plain text, and create PDFs from Word files and images — all from the same toolkit.',
  },
  {
    q: 'What is PDFEdit Studio?',
    a: 'PDFEdit Studio is the flagship document workspace: edit text and images, add signatures and shapes, redact sensitive content and export a finished PDF — free, with no sign-up.',
  },
];

export function HomeIndex() {
  const entries = buildIndex();

  return (
    <>
      {/* ---------- complete tool index ---------- */}
      <section aria-labelledby="tool-index-heading" className="border-t border-[var(--pe-border)] bg-[var(--pe-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--pe-accent)]">
              Complete index
            </p>
            <h2 id="tool-index-heading" className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">
              Every tool, A–Z
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--pe-text-2)]">
              PDFEdit is a free online PDF editor and document toolkit. Merge and split PDFs,
              compress large files, convert PDF to Word, JPG or text, create PDFs from images
              and Word documents, sign and redact, protect with passwords, run OCR on scans —
              plus practical image, business and security utilities. Every tool below runs in
              your browser with no account required.
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <li key={entry.href} className="border-b border-[var(--pe-divider)]">
                <Link
                  href={entry.href}
                  className="group flex items-baseline justify-between gap-3 py-3"
                  aria-label={`${entry.name} — ${entry.blurb}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-[var(--pe-text)] transition-colors group-hover:text-[var(--pe-accent)]">
                      {entry.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-[var(--pe-text-3)]">
                      {entry.blurb}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-lg text-[var(--pe-text-3)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--pe-accent)]"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- FAQ (GEO / AI-search content) ---------- */}
      <section aria-labelledby="faq-heading" className="border-t border-[var(--pe-border)] bg-[var(--pe-surface-2)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--pe-accent)]">
              Questions
            </p>
            <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {FAQS.map((faq) => (
              <article
                key={faq.q}
                className="rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] bg-[var(--pe-surface)] p-5 shadow-[var(--pe-shadow-sm)] sm:p-6"
              >
                <h3 className="text-[15px] font-bold tracking-tight text-[var(--pe-text)]">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--pe-text-2)]">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** FAQ data shared with the JSON-LD block in app/page.tsx. */
export function getFaqJsonLd() {
  return FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  }));
}
