import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/watermark-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Add a Watermark to PDF Online | PDFEdit' },
	description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position directly in your browser.',
	alternates: { canonical: url },
	openGraph: { title: 'Add a Watermark to PDF Online | PDFEdit', description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position in your browser.', url },
	twitter: { card: 'summary_large_image', title: 'Add a Watermark to PDF Online | PDFEdit', description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position in your browser.' },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'watermark-pdf' })} />; }
