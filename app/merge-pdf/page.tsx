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
		images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
	},
	twitter: { card: 'summary_large_image', title: 'Merge PDF Online Free – Combine PDF Files | PDFEdit', description: 'Combine multiple PDFs in your preferred order directly in your browser and download one merged document.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-merger' })} />; }
