import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/pdf-to-text';

export const metadata: Metadata = {
  title: 'PDF to Text Converter Online Free | PDFEdit',
  description: 'Extract selectable digital text from PDF files into plain text (TXT). Fast in-browser extraction with word count and page breakdowns.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDF to Text Converter Online Free | PDFEdit',
    description: 'Extract selectable text from PDF documents into TXT with word count analysis locally in your browser.',
    url,
  },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'pdf-to-text' })} />;
}
