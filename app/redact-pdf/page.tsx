import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/redact-pdf';

export const metadata: Metadata = {
  title: { absolute: 'Redact PDF Online Free | Cover Sensitive Text | PDFEdit' },
  description: 'Cover sensitive text, numbers, and personal info in PDF documents with black or white boxes. Visual masking applied 100% client-side in your browser — no uploads.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Redact PDF Online Free | Cover Sensitive Text | PDFEdit',
    description: 'Visually cover sensitive info in PDF files with black or white boxes, right in your browser with zero server uploads.',
    url,
  },
  twitter: { card: 'summary_large_image', title: 'Redact PDF Online Free | Cover Sensitive Text | PDFEdit', description: 'Visually cover sensitive info in PDF files with black or white boxes, right in your browser with zero server uploads.' },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'redact-pdf' })} />;
}
