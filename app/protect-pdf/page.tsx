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
	},
};

export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'protect-pdf' })} />; }
