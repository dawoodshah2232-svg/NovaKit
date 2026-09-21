import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/flatten-pdf';

export const metadata: Metadata = {
  title: 'Flatten PDF Online Free | Lock Form Fields | PDFEdit',
  description: 'Flatten PDF fillable form fields, comments, and annotations into static uneditable content. 100% private in-browser tool.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Flatten PDF Online Free | Lock Form Fields | PDFEdit',
    description: 'Flatten fillable form fields, comments, and annotations in PDF documents into static content client-side.',
    url,
  },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'flatten-pdf' })} />;
}
