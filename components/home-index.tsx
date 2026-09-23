import type { ElementType } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';
import { PREVIEW_TOOLS, categoryById } from '@/components/ui-preview/data';
import { TOOLS_CONFIG } from '@/lib/tools-config';
import { TOOL_ICON_MAP } from '@/components/tools-hub';

/**
 * Homepage-only SEO section: complete tool index + FAQ.
 * Server-rendered crawlable copy that preserves the old homepage's
 * internal linking and keyword coverage inside the new red design.
 * Every entry renders as a full product card (icon tile, name, blurb,
 * open affordance) — identical treatment to the categorized tools hub.
 */

type IndexEntry = {
  name: string;
  href: string;
  blurb: string;
  group: string;
  icon: ElementType;
  badge?: string;
  note: string;
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
    icon: t.icon,
    note: 'Free • No sign-up',
  }));

  for (const tool of TOOLS_CONFIG) {
    if (UTILITY_SLUGS.has(tool.slug)) {
      entries.push({
        name: tool.name,
        href: `/tools/${tool.slug}`,
        blurb: tool.description,
        group: GROUP_LABELS[tool.category] ?? tool.category,
        icon: TOOL_ICON_MAP[tool.iconName] || FileText,
        badge: tool.badge,
        note: tool.processingNote || 'Free • No sign-up',
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

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
            {entries.map((entry) => {
              const IconComponent = entry.icon;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-label={`Open ${entry.name} — ${entry.blurb}`}
                  className="group relative flex flex-col rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-4 shadow-[var(--pe-shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:rounded-3xl sm:p-6"
                >
                  <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:group-hover:bg-red-900/60 sm:h-13 sm:w-13 sm:rounded-2xl">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    {entry.badge ? (
                      <span className="shrink-0 rounded-full border border-red-200/80 bg-red-50 px-2 py-0.5 text-[9px] font-extrabold text-red-600 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-400 sm:text-[10px]">
                        {entry.badge}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-[var(--pe-border)] px-2 py-0.5 text-[9px] font-bold text-[var(--pe-text-3)] sm:text-[10px]">
                        {entry.group}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-sm font-bold leading-snug tracking-tight text-[var(--pe-text)] transition-colors group-hover:text-[var(--pe-accent)] sm:text-lg">
                    {entry.name}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-[var(--pe-text-2)] sm:mb-4 sm:text-sm">
                    {entry.blurb}
                  </p>

                  <span className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--pe-divider)] pt-2 sm:pt-3">
                    <span className="inline-flex min-w-0 items-center gap-1 truncate text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-[11px]">
                      <CheckCircle2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                      <span className="truncate">{entry.note}</span>
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--pe-surface-2)] text-[var(--pe-text-3)] transition-all duration-200 group-hover:bg-red-600 group-hover:text-white sm:h-8 sm:w-8">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
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
