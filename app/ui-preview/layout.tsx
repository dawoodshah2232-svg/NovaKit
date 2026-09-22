import type { Metadata } from 'next';
import './preview-tokens.css';

export const metadata: Metadata = {
  title: 'Homepage UI Concept Preview | PDFEdit',
  description:
    'Isolated design concept preview of a new PDFEdit homepage. Not the live site.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UiPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
