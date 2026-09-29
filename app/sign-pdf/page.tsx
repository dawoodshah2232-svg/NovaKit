import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/sign-pdf';
export const metadata: Metadata = {
  title: { absolute: 'Sign PDF Online Free | PDFEdit' },
  description:
    'Draw, type, or upload a signature image, place it on a PDF page, and download the signed copy locally in your browser.',
  alternates: {
    canonical: url,
    languages: {
      'x-default': url,
      en: url,
      es: 'https://www.pdfedit.website/es/sign-pdf',
      ar: 'https://www.pdfedit.website/ar/sign-pdf',
    },
  },
  openGraph: {
    title: 'Sign PDF Online Free | PDFEdit',
    description:
      'Draw, type, or upload a signature image and place it on a PDF page locally.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: {
    card: 'summary_large_image',
    title: 'Sign PDF Online Free | PDFEdit',
    description:
      'Draw, type, or upload a signature image and place it on a PDF page locally.',
  images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'sign-pdf' })} />; }
