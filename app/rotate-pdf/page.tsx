import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/rotate-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Rotate PDF Pages Online Free | PDFEdit' },
	description: 'Rotate PDF pages by 90, 180, or 270 degrees in your browser, then download the adjusted document without sending it to a server.',
	alternates: { canonical: url },
	openGraph: { title: 'Rotate PDF Pages Online Free | PDFEdit', description: 'Rotate PDF pages in your browser and download the adjusted document locally.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'rotate-pdf' })} />; }
