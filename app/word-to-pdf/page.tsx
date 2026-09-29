import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/word-to-pdf';
export const metadata: Metadata = {
  title: { absolute: 'Word to PDF Converter Online | PDFEdit' },
  description: 'Convert supported DOCX text documents into PDFs locally in your browser. Legacy DOC files and complex Word layouts are not supported.',
  alternates: {
    canonical: url,
    languages: {
      'x-default': url,
      en: url,
      es: 'https://www.pdfedit.website/es/word-to-pdf',
      ar: 'https://www.pdfedit.website/ar/word-to-pdf',
    },
  },
  openGraph: { title: 'Word to PDF Converter Online | PDFEdit', description: 'Convert supported DOCX text documents into PDFs locally in your browser.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
  twitter: { card: 'summary_large_image', title: 'Word to PDF Converter Online | PDFEdit', description: 'Convert supported DOCX text documents into PDFs locally in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'word-to-pdf' })} />; }