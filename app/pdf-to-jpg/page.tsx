import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/pdf-to-jpg';
export const metadata: Metadata = {
	title: { absolute: 'PDF to JPG Converter Online Free | PDFEdit' },
	description: 'Convert every PDF page to JPG images in your browser. Choose quality, download individual pages, or download all JPGs as a ZIP.',
	alternates: { canonical: url },
	openGraph: { title: 'PDF to JPG Converter Online Free | PDFEdit', description: 'Convert every PDF page to JPG images in your browser and download individual pages or a ZIP.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
	twitter: { card: 'summary_large_image', title: 'PDF to JPG Converter Online Free | PDFEdit', description: 'Convert every PDF page to JPG images in your browser and download individual pages or a ZIP.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-to-jpg' })} />; }
