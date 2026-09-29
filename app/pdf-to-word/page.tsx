import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/pdf-to-word';
export const metadata: Metadata = {
  title: { absolute: 'PDF to Word Converter Online | PDFEdit' },
  description: 'Convert readable PDF text into a DOCX Word document locally in your browser. Complex layouts and scanned PDFs are not reconstructed.',
  alternates: {
    canonical: url,
    languages: {
      'x-default': url,
      en: url,
      es: 'https://www.pdfedit.website/es/pdf-to-word',
      ar: 'https://www.pdfedit.website/ar/pdf-to-word',
    },
  },
  openGraph: { title: 'PDF to Word Converter Online | PDFEdit', description: 'Convert readable PDF text into a DOCX Word document locally in your browser.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
  twitter: { card: 'summary_large_image', title: 'PDF to Word Converter Online | PDFEdit', description: 'Convert readable PDF text into a DOCX Word document locally in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-to-word' })} />; }