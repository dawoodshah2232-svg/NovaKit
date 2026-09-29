import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/ocr-pdf';
export const metadata: Metadata = {
  title: { absolute: 'OCR PDF Online Free | PDFEdit' },
  description: 'Extract text from scanned PDF pages with browser-based OCR supporting English, Spanish, French, and German. Files are processed locally in your browser and are not uploaded to our servers.',
  alternates: { canonical: url },
  openGraph: {
    title: 'OCR PDF Online Free | PDFEdit',
    description: 'Extract text from scanned PDF pages with browser-based OCR supporting English, Spanish, French, and German.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'OCR PDF Online Free | PDFEdit', description: 'Extract text from scanned PDF pages with browser-based OCR supporting English, Spanish, French, and German.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'ocr-pdf' })} />; }
