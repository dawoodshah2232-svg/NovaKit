import { FileText } from 'lucide-react';
import { canonicalPathBySlug } from '@/lib/tool-paths';

const BASE_URL = 'https://www.pdfedit.website';

/** Tools featured in the embeddable widget — high-demand, always available. */
const WIDGET_TOOLS: Array<{ slug: string; label: string; blurb: string }> = [
  { slug: 'pdf-merger', label: 'Merge PDF', blurb: 'Combine PDFs into one' },
  { slug: 'compress-pdf', label: 'Compress PDF', blurb: 'Shrink file size' },
  { slug: 'split-pdf', label: 'Split PDF', blurb: 'Extract pages' },
  { slug: 'image-to-pdf', label: 'JPG to PDF', blurb: 'Images into a PDF' },
  { slug: 'pdf-to-images', label: 'PDF to JPG', blurb: 'Pages as images' },
  { slug: 'sign-pdf', label: 'Sign PDF', blurb: 'Electronic signature' },
  { slug: 'ocr-pdf', label: 'OCR PDF', blurb: 'Searchable scans' },
  { slug: 'protect-pdf', label: 'Protect PDF', blurb: 'Password security' },
];

function widgetHref(slug: string): string {
  const path = canonicalPathBySlug[slug] || `/tools/${slug}`;
  return `${BASE_URL}${path}`;
}

/**
 * The iframable "Free PDF tools" widget. Self-contained card with a
 * built-in backlink to pdfedit.website. Rendered inside /embed and
 * embedded by third-party sites via `/embed?bare=1`.
 */
export function EmbedWidget() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-extrabold leading-tight text-slate-900 dark:text-white">
            Free PDF Tools
          </p>
          <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
            In your browser — no uploads, no sign-up
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {WIDGET_TOOLS.map((t) => (
          <li key={t.slug}>
            <a
              href={widgetHref(t.slug)}
              target="_blank"
              rel="noopener"
              className="block h-full rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-red-200 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                {t.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {t.blurb}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-100 px-4 py-2.5 text-center dark:border-slate-800">
        <a
          href={BASE_URL}
          target="_blank"
          rel="noopener"
          className="text-[11px] font-semibold text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
        >
          Powered by <span className="font-bold text-red-600 dark:text-red-400">PDFEdit</span> — free, private PDF tools
        </a>
      </div>
    </div>
  );
}
