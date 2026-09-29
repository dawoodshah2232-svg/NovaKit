import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/add-page-numbers';

export const metadata: Metadata = {
  title: { absolute: 'Add Page Numbers to PDF Free Online | PDFEdit' },
  description: 'Add customizable page numbers, Roman numerals, or Page X of Y pagination to PDF documents client-side. Zero server uploads.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Add Page Numbers to PDF Free Online | PDFEdit',
    description: 'Add page numbers, Roman numerals, or custom pagination to PDF documents locally in your browser.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'Add Page Numbers to PDF Free Online | PDFEdit', description: 'Add page numbers, Roman numerals, or custom pagination to PDF documents locally in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'add-page-numbers' })} />;
}
