import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Split PDF Pages Online Free | PDFEdit' },
  description: 'Extract a selected page from a PDF in your browser and download it as a new document. No server upload is required.',
  alternates: { canonical: 'https://www.pdfedit.website/split-pdf' },
  openGraph: { title: 'Split PDF Pages Online Free | PDFEdit', description: 'Extract a selected page from a PDF in your browser and download it as a new document.', url: 'https://www.pdfedit.website/split-pdf' },
};

export default function SplitPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}