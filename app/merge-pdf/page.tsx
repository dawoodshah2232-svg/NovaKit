import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/merge-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Merge PDF Online Free – Combine PDF Files | PDFEdit' },
	description:
		'Merge PDF files online for free. Combine multiple PDFs in your preferred order directly in your browser and download one merged document.',
	alternates: { canonical: url },
	openGraph: {
		title: 'Merge PDF Online Free – Combine PDF Files | PDFEdit',
		description:
			'Combine multiple PDFs in your preferred order directly in your browser and download one merged document.',
		url,
		siteName: 'PDFEdit',
		type: 'website',
	},
};

export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-merger' })} />; }
