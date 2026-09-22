import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/sign-pdf';
export const metadata: Metadata = {
  title: { absolute: 'Sign PDF Online Free | PDFEdit' },
  description:
    'Draw, type, or upload a signature image, place it on a PDF page, and download the signed copy locally in your browser.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Sign PDF Online Free | PDFEdit',
    description:
      'Draw, type, or upload a signature image and place it on a PDF page locally.',
    url,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign PDF Online Free | PDFEdit',
    description:
      'Draw, type, or upload a signature image and place it on a PDF page locally.',
  },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'sign-pdf' })} />; }
