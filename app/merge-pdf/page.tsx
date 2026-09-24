import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/merge-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Merge PDF Online Free – Combine PDF Files | PDFEdit' },
	description:
		'Merge PDF files online for free. Combine multiple PDFs in your preferred order directly in your browser and download one merged document.',
	alternates: {
		canonical: url,
		languages: {
			'x-default': url,
			en: url,
			es: 'https://www.pdfedit.website/es/merge-pdf',
			ar: 'https://www.pdfedit.website/ar/merge-pdf',
		},
	},
	openGraph: {
		title: 'Merge PDF Online Free – Combine PDF Files | PDFEdit',
		description:
			'Combine multiple PDFs in your preferred order directly in your browser and download one merged document.',
		url,
		siteName: 'PDFEdit',
		type: 'website',
	},
	twitter: { card: 'summary_large_image', title: 'Merge PDF Online Free – Combine PDF Files | PDFEdit', description: 'Combine multiple PDFs in your preferred order directly in your browser and download one merged document.' },
};

export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-merger' })} />; }
