import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/jpg-to-pdf';
export const metadata: Metadata = {
	title: { absolute: 'JPG to PDF Converter Online Free | PDFEdit' },
	description: 'Convert JPG, PNG, and WebP images into a single PDF in your browser. Arrange images, create a clean document, and download it locally.',
	alternates: { canonical: url },
	openGraph: { title: 'JPG to PDF Converter Online Free | PDFEdit', description: 'Convert JPG, PNG, and WebP images into a single PDF in your browser.', url },
	twitter: { card: 'summary_large_image', title: 'JPG to PDF Converter Online Free | PDFEdit', description: 'Convert JPG, PNG, and WebP images into a single PDF in your browser.' },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'image-to-pdf' })} />; }
