import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/pdf-to-text';

export const metadata: Metadata = {
  title: { absolute: 'PDF to Text Converter Online Free | PDFEdit' },
  description: 'Extract selectable digital text from PDF files into plain text (TXT). Fast in-browser extraction with word count and page breakdowns.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDF to Text Converter Online Free | PDFEdit',
    description: 'Extract selectable text from PDF documents into TXT with word count analysis locally in your browser.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'PDF to Text Converter Online Free | PDFEdit', description: 'Extract selectable text from PDF documents into TXT with word count analysis locally in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'pdf-to-text' })} />;
}
