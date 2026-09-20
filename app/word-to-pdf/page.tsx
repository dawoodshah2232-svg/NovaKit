import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/word-to-pdf';
export const metadata: Metadata = {
  title: 'Word to PDF Converter Online | PDFEdit',
  description: 'Convert supported DOCX text documents into PDFs locally in your browser. Legacy DOC files and complex Word layouts are not supported.',
  alternates: { canonical: url },
  openGraph: { title: 'Word to PDF Converter Online | PDFEdit', description: 'Convert supported DOCX text documents into PDFs locally in your browser.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'word-to-pdf' })} />; }