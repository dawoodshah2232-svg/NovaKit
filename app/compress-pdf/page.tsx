import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/compress-pdf';
export const metadata: Metadata = {
	title: 'Compress PDF Online Free | PDF Compressor | PDFEdit',
	description: 'Compress PDF files online in your browser to reduce size for email, uploads, and sharing. Compare the original and compressed file sizes before downloading.',
	alternates: { canonical: url },
	openGraph: { title: 'Compress PDF Online Free | PDF Compressor | PDFEdit', description: 'Reduce PDF files in your browser for email, uploads, and sharing, then compare sizes before downloading.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'compress-pdf' })} />; }
