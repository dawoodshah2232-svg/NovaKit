import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/delete-pdf-pages';

export const metadata: Metadata = {
  title: { absolute: 'Delete PDF Pages Online Free | PDFEdit' },
  description: 'Delete unwanted or blank pages from your PDF document visually. 100% private, client-side in-memory processing with zero server uploads.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Delete PDF Pages Online Free | PDFEdit',
    description: 'Delete unwanted or blank pages from your PDF document visually. 100% private in-browser processing.',
    url,
  },
  twitter: { card: 'summary_large_image', title: 'Delete PDF Pages Online Free | PDFEdit', description: 'Delete unwanted or blank pages from your PDF document visually. 100% private in-browser processing.' },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'delete-pdf-pages' })} />;
}
