import type { Metadata } from 'next';
import { PdfStudio } from '@/components/pdf-studio';
import { JsonLd, studioSchema } from '@/components/schema-jsonld';
import { PageFaq } from '@/components/page-faq';
import type { BlogFaq } from '@/lib/blog';

const url = 'https://www.pdfedit.website/studio';

export const metadata: Metadata = {
  title: { absolute: 'PDF Studio Online Free | Edit PDF in Your Browser | PDFEdit' },
  description:
    'Edit PDFs free in your browser: add text, draw, highlight, sign, stamp, manage pages and redact. 100% private — files never leave your device.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDF Studio Online Free | PDFEdit',
    description:
      'Edit PDFs in your browser: annotate, sign, stamp, manage pages, and redact. 100% private — your files never leave your browser.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
};

const STUDIO_FAQS: BlogFaq[] = [
  {
    q: 'Is PDF Studio free?',
    a: 'Yes. PDF Studio is free to use in your browser, with no account and no sign-up required.',
  },
  {
    q: 'Are my files uploaded when I edit them in the Studio?',
    a: 'No. The Studio runs entirely in your browser on your own device. Your documents are never uploaded to our servers.',
  },
  {
    q: 'What can I do in PDF Studio?',
    a: 'Add and edit text, draw, highlight, insert shapes, images, signatures and stamps, reorder, rotate, duplicate, delete and extract pages, and apply redaction overlays.',
  },
  {
    q: 'Does PDF Studio work on mobile?',
    a: 'Yes. The Studio runs in modern mobile browsers, so you can annotate and edit PDFs on your phone or tablet.',
  },
  {
    q: 'Is the Studio good for sensitive documents?',
    a: 'That is exactly what it is built for. Because files never leave your device, the Studio is a safe choice for contracts, medical records, and financial documents.',
  },
];

export default function MasterStudioPage() {
  return (
    <>
      <JsonLd schema={studioSchema} />
      {/* Server-rendered H1 + intro: the studio app itself loads client-side
          (ssr:false), so crawlers get the page headline and description here. */}
      <header className="pe-preview bg-[var(--pe-bg)] px-4 pb-2 pt-10 text-center">
        <p className="mb-3 inline-flex items-center rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--pe-accent)]">
          Free online PDF editor
        </p>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-[var(--pe-text)] sm:text-4xl">
          Edit PDF Online Free — PDFEdit Studio
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[var(--pe-text-2)]">
          Open any PDF and edit it right in your browser — add text, draw,
          highlight, sign, stamp, manage pages and redact. 100% private: your
          files never leave your device.
        </p>
      </header>
      <PdfStudio />
      <main className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
        <PageFaq
          faqs={STUDIO_FAQS}
          pageUrl={url}
          intro="Quick answers about editing PDFs in the free browser Studio."
        />
      </main>
    </>
  );
}
