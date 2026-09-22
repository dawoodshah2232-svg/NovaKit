import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/pdf-to-images';
export const metadata: Metadata = {
	title: { absolute: 'PDF to Images Converter Online | PDFEdit' },
	description: 'Convert PDF pages to PNG or JPG images in your browser with selectable output quality and local downloads. Your PDF is processed on your device.',
	alternates: { canonical: url },
	openGraph: { title: 'PDF to Images Converter Online | PDFEdit', description: 'Convert PDF pages to PNG or JPG images in your browser with local downloads.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'pdf-to-images' })} />; }
