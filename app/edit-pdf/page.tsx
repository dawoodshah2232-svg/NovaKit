import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/edit-pdf';
export const metadata: Metadata = {
  title: { absolute: 'Edit PDF Metadata Online Free | PDFEdit' },
  description:
    'View and edit PDF document metadata — title, author, subject, keywords — directly in your browser. Sanitize document properties with zero server uploads.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Edit PDF Metadata Online Free | PDFEdit',
    description:
      'Inspect, modify, or sanitize PDF title, author, subject, and keywords locally in your browser. No uploads, no sign-up.',
    url,
  },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'edit-pdf-metadata' })} />; }
