import type { Metadata } from 'next';
import { PdfStudio } from '@/components/pdf-studio';
import { JsonLd, studioSchema } from '@/components/schema-jsonld';
import { PageFaq } from '@/components/page-faq';
import type { BlogFaq } from '@/lib/blog';

const url = 'https://www.pdfedit.website/studio';

export const metadata: Metadata = {
  title: { absolute: 'PDF Studio Online Free | Edit PDF in Your Browser | PDFEdit' },
  description:
    'Open and edit PDFs in a full browser studio: add text, draw, highlight, insert shapes, images, signatures and stamps, reorder, rotate, duplicate, delete and extract pages, and apply redaction overlays. 100% private — files are processed in your browser and never uploaded to our servers.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDF Studio Online Free | PDFEdit',
    description:
      'Edit PDFs in your browser: annotate, sign, stamp, manage pages, and redact. 100% private — your files never leave your browser.',
    url,
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
