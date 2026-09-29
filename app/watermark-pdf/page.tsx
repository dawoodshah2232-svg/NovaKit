import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/watermark-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Add a Watermark to PDF Online | PDFEdit' },
	description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position directly in your browser.',
	alternates: { canonical: url },
	openGraph: { title: 'Add a Watermark to PDF Online | PDFEdit', description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position in your browser.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
	twitter: { card: 'summary_large_image', title: 'Add a Watermark to PDF Online | PDFEdit', description: 'Apply a text watermark to PDF pages with adjustable opacity, angle, and position in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'watermark-pdf' })} />; }
