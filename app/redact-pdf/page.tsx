import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/redact-pdf';

export const metadata: Metadata = {
  title: 'Redact PDF Online Free | Blackout Sensitive Text | PDFEdit',
  description: 'Permanently blackout or whiteout sensitive text, numbers, and personal info in PDF documents. 100% client-side privacy with metadata scrubbing.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Redact PDF Online Free | Blackout Sensitive Text | PDFEdit',
    description: 'Permanently blackout or whiteout sensitive info in PDF files in your browser with zero server uploads.',
    url,
  },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'redact-pdf' })} />;
}
