import type { Metadata } from 'next';
import { PdfStudio } from '@/components/pdf-studio';

const url = 'https://www.pdfedit.website/studio';

export const metadata: Metadata = {
  title: { absolute: 'PDF Studio Online Free | Edit PDF Pages in Your Browser | PDFEdit' },
  description:
    'Open, preview, and edit PDFs in a full browser studio: reorder, rotate, delete, and duplicate pages, add text, shapes, images, signatures, page numbers, watermarks, and redactions. 100% private, client-side processing with zero server uploads.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDF Studio Online Free | PDFEdit',
    description:
      'Edit PDF pages in your browser: reorder, rotate, annotate, sign, watermark, and redact. 100% private, no uploads.',
    url,
  },
};

export default function MasterStudioPage() {
  return <PdfStudio />;
}
