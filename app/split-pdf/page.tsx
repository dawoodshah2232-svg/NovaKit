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
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'Split PDF Online Free – Extract Pages & Ranges | PDFEdit', description: 'Extract pages or split every page of a PDF into separate files, locally in your browser. No uploads, no sign-up.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'split-pdf' })} />; }
