import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.pdfedit.website/batch-pdf' },
  openGraph: { url: 'https://www.pdfedit.website/batch-pdf' },
};

export default function BatchPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
