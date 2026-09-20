import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/pdf-to-word';
export const metadata: Metadata = {
  title: 'PDF to Word Converter Online | PDFEdit',
  description: 'Convert readable PDF text into a DOCX Word document locally in your browser. Complex layouts and scanned PDFs are not reconstructed.',
  alternates: { canonical: url },
  openGraph: { title: 'PDF to Word Converter Online | PDFEdit', description: 'Convert readable PDF text into a DOCX Word document locally in your browser.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-to-word' })} />; }