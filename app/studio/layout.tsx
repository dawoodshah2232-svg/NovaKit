import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.pdfedit.website/studio' },
  openGraph: { url: 'https://www.pdfedit.website/studio' },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
