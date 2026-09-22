import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/split-pdf';
export const metadata: Metadata = {
  title: { absolute: 'Split PDF Online Free – Extract Pages & Ranges | PDFEdit' },
  description:
    'Split PDF files online for free. Extract single pages or custom page ranges, or split every page into separate PDFs — all processed locally in your browser.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Split PDF Online Free – Extract Pages & Ranges | PDFEdit',
    description:
      'Extract pages or split every page of a PDF into separate files, locally in your browser. No uploads, no sign-up.',
    url,
  },
  twitter: { card: 'summary_large_image', title: 'Split PDF Online Free – Extract Pages & Ranges | PDFEdit', description: 'Extract pages or split every page of a PDF into separate files, locally in your browser. No uploads, no sign-up.' },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'split-pdf' })} />; }
