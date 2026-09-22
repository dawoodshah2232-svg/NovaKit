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
  },
  twitter: { card: 'summary_large_image', title: 'Add Page Numbers to PDF Free Online | PDFEdit', description: 'Add page numbers, Roman numerals, or custom pagination to PDF documents locally in your browser.' },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'add-page-numbers' })} />;
}
