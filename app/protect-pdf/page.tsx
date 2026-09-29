import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/protect-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Protect PDF Online Free – Add Password to PDF | PDFEdit' },
	description:
		'Protect PDF files online for free. Add a password and encryption to your PDFs directly in your browser and download the secured document.',
	alternates: { canonical: url },
	openGraph: {
		title: 'Protect PDF Online Free – Add Password to PDF | PDFEdit',
		description:
			'Add password protection and encryption to your PDFs directly in your browser.',
		url,
		siteName: 'PDFEdit',
		type: 'website',
		images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
	},
	twitter: { card: 'summary_large_image', title: 'Protect PDF Online Free – Add Password to PDF | PDFEdit', description: 'Add password protection and encryption to your PDFs directly in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'protect-pdf' })} />; }
