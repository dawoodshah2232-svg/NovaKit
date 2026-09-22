import type { Metadata } from 'next';
import { PdfStudio } from '@/components/pdf-studio';

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

export default function MasterStudioPage() {
  return <PdfStudio />;
}
