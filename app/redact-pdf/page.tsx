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
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'Redact PDF Online Free | Cover Sensitive Text | PDFEdit', description: 'Visually cover sensitive info in PDF files with black or white boxes, right in your browser with zero server uploads.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'redact-pdf' })} />;
}
