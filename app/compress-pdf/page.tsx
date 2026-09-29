import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/compress-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Compress PDF Online Free | PDF Compressor | PDFEdit' },
	description: 'Compress PDF files online in your browser to reduce size for email, uploads, and sharing. Compare the original and compressed file sizes before downloading.',
	alternates: {
    canonical: url,
    languages: {
      'x-default': url,
      en: url,
      es: 'https://www.pdfedit.website/es/compress-pdf',
      ar: 'https://www.pdfedit.website/ar/compress-pdf',
    },
  },
	openGraph: { title: 'Compress PDF Online Free | PDF Compressor | PDFEdit', description: 'Reduce PDF files in your browser for email, uploads, and sharing, then compare sizes before downloading.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
	twitter: { card: 'summary_large_image', title: 'Compress PDF Online Free | PDF Compressor | PDFEdit', description: 'Reduce PDF files in your browser for email, uploads, and sharing, then compare sizes before downloading.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'compress-pdf' })} />; }
