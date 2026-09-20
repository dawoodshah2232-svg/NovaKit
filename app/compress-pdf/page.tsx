import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/compress-pdf';
export const metadata: Metadata = {
	title: 'Compress PDF Online Free in Your Browser | PDFEdit',
	description: 'Reduce PDF file size locally for email and uploads while keeping text and document content usable. Process PDFs in your browser with no server upload.',
	alternates: { canonical: url },
	openGraph: { title: 'Compress PDF Online Free in Your Browser | PDFEdit', description: 'Reduce PDF file size locally for email and uploads while keeping text and document content usable.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'compress-pdf' })} />; }
