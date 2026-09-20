import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Batch PDF Processing Online | PDFEdit',
  description: 'Merge multiple PDF files into one document locally in your browser. Batch processing keeps selected files on your device.',
  alternates: { canonical: 'https://www.pdfedit.website/batch-pdf' },
  openGraph: { title: 'Batch PDF Processing Online | PDFEdit', description: 'Merge multiple PDF files into one document locally in your browser.', url: 'https://www.pdfedit.website/batch-pdf' },
};

export default function BatchPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
