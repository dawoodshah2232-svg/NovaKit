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
  openGraph: { title: 'Word to PDF Converter Online | PDFEdit', description: 'Convert supported DOCX text documents into PDFs locally in your browser.', url },
  twitter: { card: 'summary_large_image', title: 'Word to PDF Converter Online | PDFEdit', description: 'Convert supported DOCX text documents into PDFs locally in your browser.' },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'word-to-pdf' })} />; }