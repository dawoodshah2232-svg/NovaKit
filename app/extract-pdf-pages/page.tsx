import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/extract-pdf-pages';

export const metadata: Metadata = {
  title: { absolute: 'Extract PDF Pages Online Free | PDFEdit' },
  description: 'Extract specific pages or page ranges from PDF files into a single document or individual PDFs in a ZIP archive. 100% private in-browser tool.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Extract PDF Pages Online Free | PDFEdit',
    description: 'Extract specific pages or ranges from PDF files into a new PDF or ZIP archive client-side.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'Extract PDF Pages Online Free | PDFEdit', description: 'Extract specific pages or ranges from PDF files into a new PDF or ZIP archive client-side.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'extract-pdf-pages' })} />;
}
