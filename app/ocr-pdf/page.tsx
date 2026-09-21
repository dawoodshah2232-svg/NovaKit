import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/ocr-pdf';
export const metadata: Metadata = {
  title: 'OCR PDF Online Free | PDFEdit',
  description: 'Extract text from scanned PDF pages with browser-based OCR supporting English, Spanish, French, and German. Files are processed locally in your browser and are not uploaded to our servers.',
  alternates: { canonical: url },
  openGraph: {
    title: 'OCR PDF Online Free | PDFEdit',
    description: 'Extract text from scanned PDF pages with browser-based OCR supporting English, Spanish, French, and German.',
    url,
  },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'ocr-pdf' })} />; }
