import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/pdf-to-jpg';
export const metadata: Metadata = {
	title: { absolute: 'PDF to JPG Converter Online Free | PDFEdit' },
	description: 'Convert every PDF page to JPG images in your browser. Choose quality, download individual pages, or download all JPGs as a ZIP.',
	alternates: { canonical: url },
	openGraph: { title: 'PDF to JPG Converter Online Free | PDFEdit', description: 'Convert every PDF page to JPG images in your browser and download individual pages or a ZIP.', url },
	twitter: { card: 'summary_large_image', title: 'PDF to JPG Converter Online Free | PDFEdit', description: 'Convert every PDF page to JPG images in your browser and download individual pages or a ZIP.' },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-to-jpg' })} />; }
